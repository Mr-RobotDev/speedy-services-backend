import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PipelineStage, UpdateQuery } from 'mongoose';
import { Building } from './schema/building.schema';
import { SiteService } from '../site/site.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';
import { CountField } from '../common/enums/count-fields.enum';

@Injectable()
export class BuildingService {
  constructor(
    @InjectModel(Building.name)
    private readonly buildingModel: PaginatedModel<Building>,
    private readonly siteService: SiteService,
  ) {}

  private async findSite(user: string, organizationId: string, siteId: string) {
    return this.siteService.findOne(user, organizationId, siteId);
  }

  async create(
    user: string,
    organizationId: string,
    siteId: string,
    createBuildingDto: CreateBuildingDto,
  ) {
    const site = await this.findSite(user, organizationId, siteId);
    const building = await this.buildingModel.create({
      ...createBuildingDto,
      site: site._id,
    });
    await this.siteService.increaseStats(site._id, CountField.BUILDING_COUNT);
    return building;
  }

  async findAll(
    user: string,
    organizationId: string,
    siteId: string,
    search?: string,
    paginationDto?: PaginationDto,
  ) {
    const site = await this.findSite(user, organizationId, siteId);
    const pipeline: PipelineStage[] = [
      {
        $match: {
          site: site._id,
        },
      },
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

  async findOne(
    user: string,
    organizationId: string,
    siteId: string,
    id: string,
  ) {
    const site = await this.findSite(user, organizationId, siteId);
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
    user: string,
    organizationId: string,
    siteId: string,
    id: string,
    updateBuilding: UpdateQuery<Building>,
  ) {
    const site = await this.findSite(user, organizationId, siteId);
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

  async remove(
    user: string,
    organizationId: string,
    siteId: string,
    id: string,
  ) {
    const site = await this.findSite(user, organizationId, siteId);
    const building = await this.buildingModel.findOneAndDelete({
      _id: id,
      site: site._id,
    });
    if (!building) {
      throw new NotFoundException('Building not found');
    }
    await this.siteService.decreaseStats(site._id, CountField.BUILDING_COUNT);
    return building;
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
