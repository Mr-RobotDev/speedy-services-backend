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
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';
import { CountField } from '../common/enums/count-fields.enum';

@Injectable()
export class DeviceService {
  constructor(
    @InjectModel(Device.name)
    private readonly deviceModel: PaginatedModel<Device>,
    @Inject(forwardRef(() => SiteService))
    private readonly siteService: SiteService,
    private readonly buildingService: BuildingService,
    private readonly floorService: FloorService,
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
      room: room._id,
    });
    await this.siteService.increaseStats(siteId, CountField.DEVICE_COUNT);
    await this.buildingService.increaseStats(
      buildingId,
      CountField.DEVICE_COUNT,
    );
    await this.floorService.increaseStats(floorId, CountField.DEVICE_COUNT);
    await this.roomService.increaseStats(room._id, CountField.DEVICE_COUNT);
    return device;
  }

  async findAll(
    siteId: string,
    buildingId: string,
    floorId: string,
    roomId: string,
    search: string,
    paginationDto: PaginationDto,
  ) {
    const { page, limit } = paginationDto;
    const room = await this.findRoom(siteId, buildingId, floorId, roomId);
    return this.deviceModel.paginate(
      {
        room: room._id,
        ...(search && { name: { $regex: search, $options: 'i' } }),
      },
      {
        page,
        limit,
        projection: '-site -building -floor -room',
      },
    );
  }

  async getSiteDevices(
    siteId: string,
    search: string,
    paginationDto: PaginationDto,
  ) {
    const { page, limit } = paginationDto;
    const site = await this.siteService.findOne(siteId);
    return this.deviceModel.paginate(
      {
        site: site._id,
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
    const device = await this.deviceModel.findOne({
      _id: id,
      room: room._id,
    });
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
        room: room._id,
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
      room: room._id,
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
    await this.roomService.decreaseStats(room._id, CountField.DEVICE_COUNT);
    return device;
  }
}
