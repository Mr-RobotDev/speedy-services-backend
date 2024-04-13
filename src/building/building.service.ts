import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PipelineStage, UpdateQuery } from 'mongoose';
import { Building } from './schema/building.schema';
import { MediaService } from '../media/media.service';
import { SiteService } from '../site/site.service';
import { FloorService } from '../floor/floor.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';
import { CountField } from '../common/enums/count-fields.enum';

@Injectable()
export class BuildingService {
  constructor(
    @InjectModel(Building.name)
    private readonly buildingModel: PaginatedModel<Building>,
    private readonly mediaService: MediaService,
    @Inject(forwardRef(() => SiteService))
    private readonly siteService: SiteService,
    @Inject(forwardRef(() => FloorService))
    private readonly floorService: FloorService,
  ) {}

  private async findSite(siteId: string) {
    return this.siteService.findOne(siteId);
  }

  async create(siteId: string, createBuildingDto: CreateBuildingDto) {
    const site = await this.findSite(siteId);
    const building = await this.buildingModel.create({
      ...createBuildingDto,
      site: site._id,
    });
    await this.siteService.increaseStats(site._id, CountField.BUILDING_COUNT);
    return building;
  }

  async findAll(
    siteId: string,
    search?: string,
    paginationDto?: PaginationDto,
  ) {
    const site = await this.findSite(siteId);
    const pipeline: PipelineStage[] = [
      ...(search
        ? [
            {
              $search: {
                index: 'buildings_partial_search',
                autocomplete: {
                  path: 'name',
                  query: search,
                  tokenOrder: 'sequential',
                  fuzzy: {
                    maxEdits: 1,
                    prefixLength: 3,
                    maxExpansions: 100,
                  },
                },
              },
            },
          ]
        : []),
      {
        $match: {
          site: site._id,
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: 1,
          description: 1,
          address: 1,
          floorCount: 1,
          deviceCount: 1,
          pointsCount: 1,
          cover: 1,
          site: 1,
          createdAt: 1,
        },
      },
    ];

    return this.buildingModel.paginatedAggregation(pipeline, paginationDto);
  }

  async findOne(siteId: string, id: string) {
    const site = await this.findSite(siteId);
    const building = await this.buildingModel.findOne({
      _id: id,
      site: site._id,
    });
    if (!building) {
      throw new NotFoundException('Building not found');
    }
    return building;
  }

  async update(
    siteId: string,
    id: string,
    updateBuilding: UpdateQuery<Building>,
  ) {
    const site = await this.findSite(siteId);
    const building = await this.buildingModel.findOneAndUpdate(
      {
        _id: id,
        site: site._id,
      },
      updateBuilding,
      { new: true },
    );
    if (!building) {
      throw new NotFoundException('Building not found');
    }
    return building;
  }

  async remove(siteId: string, id: string) {
    const site = await this.findSite(siteId);
    const building = await this.buildingModel.findOneAndDelete({
      _id: id,
      site: site._id,
    });
    if (!building) {
      throw new NotFoundException('Building not found');
    }
    await this.siteService.decreaseStats(site._id, CountField.BUILDING_COUNT);
    await this.mediaService.deleteImage(building.cover);
    await this.floorService.removeBuildingFloors(site._id, building._id);
    return building;
  }

  async removeSiteBuildings(siteId: string) {
    const buildings = await this.buildingModel.find({
      site: siteId,
    });
    await this.buildingModel.deleteMany({
      site: siteId,
    });
    await Promise.all(
      buildings.map((building) =>
        this.floorService.removeBuildingFloors(siteId, building._id),
      ),
    );
    await Promise.all(
      buildings
        .filter((building) => building.cover)
        .map((building) => this.mediaService.deleteImage(building.cover)),
    );
  }

  async increaseStats(id: string, field: CountField) {
    return this.buildingModel.findByIdAndUpdate(id, {
      $inc: { [field]: 1 },
    });
  }

  async decreaseStats(id: string, field: CountField) {
    return this.buildingModel.findByIdAndUpdate(id, {
      $inc: { [field]: -1 },
    });
  }
}
