import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PipelineStage, UpdateQuery } from 'mongoose';
import { Floor } from './schema/floor.schema';
import { BuildingService } from '../building/building.service';
import { CreateFloorDto } from './dto/create-floor.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';
import { CountField } from '../common/enums/count-fields.enum';

@Injectable()
export class FloorService {
  constructor(
    @InjectModel(Floor.name)
    private readonly floorModel: PaginatedModel<Floor>,
    private readonly buildingService: BuildingService,
  ) {}

  private async findBuilding(
    user: string,
    organizationId: string,
    siteId: string,
    buildingId: string,
  ) {
    return this.buildingService.findOne(
      user,
      organizationId,
      siteId,
      buildingId,
    );
  }

  async create(
    user: string,
    organizationId: string,
    siteId: string,
    buildingId: string,
    createFloorDto: CreateFloorDto,
  ) {
    const building = await this.findBuilding(
      user,
      organizationId,
      siteId,
      buildingId,
    );
    const floor = await this.floorModel.create({
      ...createFloorDto,
      building: building._id,
    });
    await this.buildingService.increaseStats(
      building._id,
      CountField.FLOOR_COUNT,
    );
    return floor;
  }

  async findAll(
    user: string,
    organizationId: string,
    siteId: string,
    buildingId: string,
    search?: string,
    paginationDto?: PaginationDto,
  ) {
    const building = await this.findBuilding(
      user,
      organizationId,
      siteId,
      buildingId,
    );
    const pipeline: PipelineStage[] = [
      {
        $match: {
          building: building._id,
        },
      },
      ...(search
        ? [
            {
              $search: {
                index: 'floors_partial_search',
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
          roomCount: 1,
          deviceCount: 1,
          pointsCount: 1,
          diagram: 1,
          building: 1,
          createdAt: 1,
        },
      },
    ];

    return this.floorModel.paginatedAggregation(pipeline, paginationDto);
  }

  async findOne(
    user: string,
    organizationId: string,
    siteId: string,
    buildingId: string,
    id: string,
  ) {
    const building = await this.findBuilding(
      user,
      organizationId,
      siteId,
      buildingId,
    );
    const floor = await this.floorModel.findOne({
      _id: id,
      building: building._id,
    });
    if (!floor) {
      throw new NotFoundException('Floor not found');
    }
    return floor;
  }

  async update(
    user: string,
    organizationId: string,
    siteId: string,
    buildingId: string,
    id: string,
    updateFloor: UpdateQuery<Floor>,
  ) {
    const building = await this.findBuilding(
      user,
      organizationId,
      siteId,
      buildingId,
    );
    const floor = await this.floorModel.findOneAndUpdate(
      {
        _id: id,
        building: building._id,
      },
      updateFloor,
      { new: true },
    );
    if (!floor) {
      throw new NotFoundException('Floor not found');
    }
    return floor;
  }

  async remove(
    user: string,
    organizationId: string,
    siteId: string,
    buildingId: string,
    id: string,
  ) {
    const building = await this.findBuilding(
      user,
      organizationId,
      siteId,
      buildingId,
    );
    const floor = await this.floorModel.findOneAndDelete({
      _id: id,
      building: building._id,
    });
    if (!floor) {
      throw new NotFoundException('Floor not found');
    }
    await this.buildingService.decreaseStats(
      building._id,
      CountField.FLOOR_COUNT,
    );
    return floor;
  }

  async increaseStats(id: string, field: CountField) {
    return this.floorModel.findByIdAndUpdate(id, {
      $inc: { [field]: 1 },
    });
  }

  async decreaseStats(id: string, field: CountField) {
    return this.floorModel.findByIdAndUpdate(id, {
      $inc: { [field]: -1 },
    });
  }
}
