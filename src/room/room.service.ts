import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateQuery } from 'mongoose';
import { Room } from './schema/room.schema';
import { FloorService } from '../floor/floor.service';
import { MediaService } from '../media/media.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
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
      floor: floor.id,
    });
    await this.floorService.increaseStats(floor.id, CountField.ROOM_COUNT);
    return this.findOne(siteId, buildingId, floorId, room.id);
  }

  async findAll(
    siteId: string,
    buildingId: string,
    floorId: string,
    search?: string,
    paginationDto?: PaginationQueryDto,
  ) {
    const floor = await this.findFloor(siteId, buildingId, floorId);
    const { page, limit } = paginationDto;
    return this.roomModel.paginate(
      {
        floor: floor.id,
        ...(search && {
          name: { $regex: search, $options: 'i' },
        }),
      },
      {
        page,
        limit,
        populate: [
          {
            path: 'floor',
            select: 'name',
            populate: {
              path: 'building',
              select: 'name',
              populate: {
                path: 'site',
                select: 'name',
              },
            },
          },
        ],
      },
    );
  }

  async findOne(
    siteId: string,
    buildingId: string,
    floorId: string,
    id: string,
  ) {
    const floor = await this.findFloor(siteId, buildingId, floorId);
    const room = await this.roomModel
      .findOne({
        _id: id,
        floor: floor.id,
      })
      .populate({
        path: 'floor',
        select: 'name',
        populate: {
          path: 'building',
          select: 'name',
          populate: {
            path: 'site',
            select: 'name',
          },
        },
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
    const room = await this.roomModel
      .findOneAndUpdate(
        {
          _id: id,
          floor: floor.id,
        },
        updateRoom,
        {
          new: true,
        },
      )
      .populate({
        path: 'floor',
        select: 'name',
        populate: {
          path: 'building',
          select: 'name',
          populate: {
            path: 'site',
            select: 'name',
          },
        },
      });

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
      floor: floor.id,
    });
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    await this.floorService.decreaseStats(floor.id, CountField.ROOM_COUNT);
    await this.mediaService.deleteImage(room.diagram);
    await this.deviceService.removeRoomDevices(room.id);
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
      rooms.map((room) => this.deviceService.removeRoomDevices(room.id)),
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
