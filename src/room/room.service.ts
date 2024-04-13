import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PipelineStage, UpdateQuery } from 'mongoose';
import { Room } from './schema/room.schema';
import { FloorService } from '../floor/floor.service';
import { MediaService } from '../media/media.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';
import { CountField } from '../common/enums/count-fields.enum';
import { DeviceService } from '../device/device.service';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name)
    private readonly roomModel: PaginatedModel<Room>,
    private readonly mediaService: MediaService,
    @Inject(forwardRef(() => FloorService))
    private readonly floorService: FloorService,
    @Inject(forwardRef(() => DeviceService))
    private readonly deviceService: DeviceService,
  ) {}

  private async findFloor(siteId: string, buildingId: string, floorId: string) {
    return this.floorService.findOne(siteId, buildingId, floorId);
  }

  async create(
    siteId: string,
    buildingId: string,
    floorId: string,
    createRoomDto: CreateRoomDto,
  ) {
    const floor = await this.findFloor(siteId, buildingId, floorId);
    const room = await this.roomModel.create({
      ...createRoomDto,
      floor: floor._id,
    });
    await this.floorService.increaseStats(floor._id, CountField.ROOM_COUNT);
    return room;
  }

  async findAll(
    siteId: string,
    buildingId: string,
    floorId: string,
    search?: string,
    paginationDto?: PaginationDto,
  ) {
    const floor = await this.findFloor(siteId, buildingId, floorId);
    const pipeline: PipelineStage[] = [
      ...(search
        ? [
            {
              $search: {
                index: 'rooms_partial_search',
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
          floor: floor._id,
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: 1,
          description: 1,
          deviceCount: 1,
          pointsCount: 1,
          diagram: 1,
          floor: 1,
          createdAt: 1,
        },
      },
    ];

    return this.roomModel.paginatedAggregation(pipeline, paginationDto);
  }

  async findOne(
    siteId: string,
    buildingId: string,
    floorId: string,
    id: string,
  ) {
    const floor = await this.findFloor(siteId, buildingId, floorId);
    const room = await this.roomModel.findOne({
      _id: id,
      floor: floor._id,
    });
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }

  async update(
    siteId: string,
    buildingId: string,
    floorId: string,
    id: string,
    updateRoom: UpdateQuery<Room>,
  ) {
    const floor = await this.findFloor(siteId, buildingId, floorId);
    const room = await this.roomModel.findOneAndUpdate(
      {
        _id: id,
        floor: floor._id,
      },
      updateRoom,
      { new: true },
    );
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }

  async remove(
    siteId: string,
    buildingId: string,
    floorId: string,
    id: string,
  ) {
    const floor = await this.findFloor(siteId, buildingId, floorId);
    const room = await this.roomModel.findOneAndDelete({
      _id: id,
      floor: floor._id,
    });
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    await this.floorService.decreaseStats(floor._id, CountField.ROOM_COUNT);
    await this.mediaService.deleteImage(room.diagram);
    await this.deviceService.removeRoomDevices(room._id);
    return room;
  }

  async removeFloorRooms(floorId: string) {
    const rooms = await this.roomModel.find({
      floor: floorId,
    });
    await this.roomModel.deleteMany({
      floor: floorId,
    });
    await Promise.all(
      rooms.map((room) => this.deviceService.removeRoomDevices(room._id)),
    );
    await Promise.all(
      rooms
        .filter((room) => room.diagram)
        .map((room) => this.mediaService.deleteImage(room.diagram)),
    );
  }

  async increaseStats(id: string, field: CountField) {
    return this.roomModel.findByIdAndUpdate(id, {
      $inc: { [field]: 1 },
    });
  }

  async decreaseStats(id: string, field: CountField) {
    return this.roomModel.findByIdAndUpdate(id, {
      $inc: { [field]: -1 },
    });
  }
}
