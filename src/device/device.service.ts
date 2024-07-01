import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateQuery } from 'mongoose';
import { Device } from './schema/device.schema';
import { SiteService } from '../site/site.service';
import { BuildingService } from '../building/building.service';
import { FloorService } from '../floor/floor.service';
import { RoomService } from '../room/room.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';
import { CountField } from '../common/enums/count-fields.enum';

@Injectable()
export class DeviceService {
  constructor(
    @InjectModel(Device.name)
    private readonly deviceModel: PaginatedModel<Device>,
    @Inject(forwardRef(() => SiteService))
    private readonly siteService: SiteService,
    @Inject(forwardRef(() => BuildingService))
    private readonly buildingService: BuildingService,
    @Inject(forwardRef(() => FloorService))
    private readonly floorService: FloorService,
    @Inject(forwardRef(() => RoomService))
    private readonly roomService: RoomService,
  ) {}

  private async findRoom(
    siteId: string,
    buildingId: string,
    floorId: string,
    roomId: string,
  ) {
    return this.roomService.findOne(siteId, buildingId, floorId, roomId);
  }

  async create(
    siteId: string,
    buildingId: string,
    floorId: string,
    roomId: string,
    createDeviceDto: CreateDeviceDto,
  ) {
    const room = await this.findRoom(siteId, buildingId, floorId, roomId);
    const device = await this.deviceModel.create({
      ...createDeviceDto,
      site: siteId,
      building: buildingId,
      floor: floorId,
      room: room.id,
    });
    await this.siteService.increaseStats(siteId, CountField.DEVICE_COUNT);
    await this.buildingService.increaseStats(
      buildingId,
      CountField.DEVICE_COUNT,
    );
    await this.floorService.increaseStats(floorId, CountField.DEVICE_COUNT);
    await this.roomService.increaseStats(room.id, CountField.DEVICE_COUNT);
    return this.findOne(siteId, buildingId, floorId, roomId, device.id);
  }

  async findAll(
    siteId: string,
    buildingId: string,
    floorId: string,
    roomId: string,
    search: string,
    paginationDto: PaginationQueryDto,
  ) {
    const { page, limit } = paginationDto;
    const room = await this.findRoom(siteId, buildingId, floorId, roomId);
    return this.deviceModel.paginate(
      {
        room: room.id,
        ...(search && { name: { $regex: search, $options: 'i' } }),
      },
      {
        page,
        limit,
        populate: [
          {
            path: 'site',
            select: 'name',
          },
          {
            path: 'building',
            select: 'name',
          },
          {
            path: 'floor',
            select: 'name',
          },
          {
            path: 'room',
            select: 'name',
          },
        ],
      },
    );
  }

  async getSiteDevices(
    siteId: string,
    search: string,
    paginationDto: PaginationQueryDto,
  ) {
    const { page, limit } = paginationDto;
    const site = await this.siteService.findOne(siteId);
    return this.deviceModel.paginate(
      {
        site: site.id,
        ...(search && { name: { $regex: search, $options: 'i' } }),
      },
      {
        page,
        limit,
        populate: [
          {
            path: 'site',
            select: 'name',
          },
          {
            path: 'building',
            select: 'name',
          },
          {
            path: 'floor',
            select: 'name',
          },
          {
            path: 'room',
            select: 'name',
          },
        ],
      },
    );
  }

  async findOne(
    siteId: string,
    buildingId: string,
    floorId: string,
    roomId: string,
    id: string,
  ) {
    const room = await this.findRoom(siteId, buildingId, floorId, roomId);
    const device = await this.deviceModel
      .findOne({
        _id: id,
        room: room.id,
      })
      .populate('site', 'name')
      .populate('building', 'name')
      .populate('floor', 'name')
      .populate('room', 'name');
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    return device;
  }

  async update(
    siteId: string,
    buildingId: string,
    floorId: string,
    roomId: string,
    id: string,
    updateDevice: UpdateQuery<Device>,
  ) {
    const room = await this.findRoom(siteId, buildingId, floorId, roomId);
    const device = await this.deviceModel.findOneAndUpdate(
      {
        _id: id,
        room: room.id,
      },
      updateDevice,
      { new: true },
    );
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    return device;
  }

  async remove(
    siteId: string,
    buildingId: string,
    floorId: string,
    roomId: string,
    id: string,
  ) {
    const room = await this.findRoom(siteId, buildingId, floorId, roomId);
    const device = await this.deviceModel.findOneAndDelete({
      _id: id,
      room: room.id,
    });
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    await this.siteService.decreaseStats(siteId, CountField.DEVICE_COUNT);
    await this.buildingService.decreaseStats(
      buildingId,
      CountField.DEVICE_COUNT,
    );
    await this.floorService.decreaseStats(floorId, CountField.DEVICE_COUNT);
    await this.roomService.decreaseStats(room.id, CountField.DEVICE_COUNT);
    return device;
  }

  async removeRoomDevices(roomId: string) {
    await this.deviceModel.deleteMany({ room: roomId });
  }
}
