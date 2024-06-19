import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PipelineStage, UpdateQuery } from 'mongoose';
import { Floor } from './schema/floor.schema';
import { MediaService } from '../media/media.service';
import { BuildingService } from '../building/building.service';
import { RoomService } from '../room/room.service';
import { CreateFloorDto } from './dto/create-floor.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';
import { CountField } from '../common/enums/count-fields.enum';

@Injectable()
export class FloorService {
  constructor(
    @InjectModel(Floor.name)
    private readonly floorModel: PaginatedModel<Floor>,
    private readonly mediaService: MediaService,
    @Inject(forwardRef(() => BuildingService))
    private readonly buildingService: BuildingService,
    @Inject(forwardRef(() => RoomService))
    private readonly roomService: RoomService,
  ) {}

  private async findBuilding(siteId: string, buildingId: string) {
    return this.buildingService.findOne(siteId, buildingId);
  }

  async create(
    siteId: string,
    buildingId: string,
    createFloorDto: CreateFloorDto,
  ) {
    const building = await this.findBuilding(siteId, buildingId);
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
    siteId: string,
    buildingId: string,
    search?: string,
    paginationDto?: PaginationQueryDto,
  ) {
    const building = await this.findBuilding(siteId, buildingId);
    const pipeline: PipelineStage[] = [
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
        $match: {
          building: building._id,
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: 1,
          description: 1,
          roomCount: 1,
          deviceCount: 1,
          diagram: 1,
        },
      },
    ];

    return this.floorModel.paginatedAggregation(pipeline, paginationDto);
  }

  async findOne(siteId: string, buildingId: string, id: string) {
    const building = await this.findBuilding(siteId, buildingId);
    const floor = await this.floorModel.findOne(
      {
        _id: id,
        building: building._id,
      },
      '-building',
    );
    if (!floor) {
      throw new NotFoundException('Floor not found');
    }
    return floor;
  }

  async update(
    siteId: string,
    buildingId: string,
    id: string,
    updateFloor: UpdateQuery<Floor>,
  ) {
    const building = await this.findBuilding(siteId, buildingId);
    const floor = await this.floorModel.findOneAndUpdate(
      {
        _id: id,
        building: building._id,
      },
      updateFloor,
      { new: true, projection: '-building' },
    );
    if (!floor) {
      throw new NotFoundException('Floor not found');
    }
    return floor;
  }

  async remove(siteId: string, buildingId: string, id: string) {
    const building = await this.findBuilding(siteId, buildingId);
    const floor = await this.floorModel.findOneAndDelete(
      {
        _id: id,
        building: building._id,
      },
      { projection: '-building' },
    );
    if (!floor) {
      throw new NotFoundException('Floor not found');
    }
    await this.buildingService.decreaseStats(
      building._id,
      CountField.FLOOR_COUNT,
    );
    await this.mediaService.deleteImage(floor.diagram);
    await this.roomService.removeFloorRooms(floor._id);
    return floor;
  }

  async removeBuildingFloors(siteId: string, buildingId: string) {
    const floors = await this.floorModel.find({
      building: buildingId,
    });
    await this.floorModel.deleteMany({
      building: buildingId,
    });
    await Promise.all(
      floors.map((floor) => this.roomService.removeFloorRooms(floor._id)),
    );
    await Promise.all(
      floors
        .filter((floor) => floor.diagram)
        .map((floor) => this.mediaService.deleteImage(floor.diagram)),
    );
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
