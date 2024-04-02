import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateQuery } from 'mongoose';
import { Device } from './schema/device.schema';
import { OrganizationService } from '../organization/organization.service';
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
    private readonly organizationService: OrganizationService,
    @Inject(forwardRef(() => SiteService))
    private readonly siteService: SiteService,
    private readonly buildingService: BuildingService,
    private readonly floorService: FloorService,
    private readonly roomService: RoomService,
  ) {}

  private async findRoom(
    user: string,
    organizationId: string,
    siteId: string,
    buildingId: string,
    floorId: string,
    roomId: string,
  ) {
    return this.roomService.findOne(
      user,
      organizationId,
      siteId,
      buildingId,
      floorId,
      roomId,
    );
  }

  async create(
    user: string,
    organizationId: string,
    siteId: string,
    buildingId: string,
    floorId: string,
    roomId: string,
    createDeviceDto: CreateDeviceDto,
  ) {
    const room = await this.findRoom(
      user,
      organizationId,
      siteId,
      buildingId,
      floorId,
      roomId,
    );
    const device = await this.deviceModel.create({
      ...createDeviceDto,
      site: siteId,
      building: buildingId,
      floor: floorId,
      room: room._id,
    });
    await this.organizationService.increaseStats(
      organizationId,
      CountField.DEVICE_COUNT,
    );
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
    user: string,
    organizationId: string,
    siteId: string,
    buildingId: string,
    floorId: string,
    roomId: string,
    search: string,
    paginationDto: PaginationDto,
  ) {
    const room = await this.findRoom(
      user,
      organizationId,
      siteId,
      buildingId,
      floorId,
      roomId,
    );
    return this.deviceModel.paginate(
      {
        room: room._id,
        ...(search && { name: { $regex: search, $options: 'i' } }),
      },
      paginationDto,
    );
  }

  async getSiteDevices(
    user: string,
    organizationId: string,
    siteId: string,
    search: string,
    paginationDto: PaginationDto,
  ) {
    const { page, limit } = paginationDto;
    const site = await this.siteService.findOne(user, organizationId, siteId);
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

  async getBuildingDevices(
    user: string,
    organizationId: string,
    siteId: string,
    buildingId: string,
    search: string,
    paginationDto: PaginationDto,
  ) {
    const { page, limit } = paginationDto;
    const building = await this.buildingService.findOne(
      user,
      organizationId,
      siteId,
      buildingId,
    );
    return this.deviceModel.paginate(
      {
        building: building._id,
        ...(search && { name: { $regex: search, $options: 'i' } }),
      },
      {
        page,
        limit,
        populate: [
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
    user: string,
    organizationId: string,
    siteId: string,
    buildingId: string,
    floorId: string,
    roomId: string,
    id: string,
  ) {
    const room = await this.findRoom(
      user,
      organizationId,
      siteId,
      buildingId,
      floorId,
      roomId,
    );
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
    user: string,
    organizationId: string,
    siteId: string,
    buildingId: string,
    floorId: string,
    roomId: string,
    id: string,
    updateDevice: UpdateQuery<Device>,
  ) {
    const room = await this.findRoom(
      user,
      organizationId,
      siteId,
      buildingId,
      floorId,
      roomId,
    );
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
    user: string,
    organizationId: string,
    siteId: string,
    buildingId: string,
    floorId: string,
    roomId: string,
    id: string,
  ) {
    const room = await this.findRoom(
      user,
      organizationId,
      siteId,
      buildingId,
      floorId,
      roomId,
    );
    const device = await this.deviceModel.findOneAndDelete({
      _id: id,
      room: room._id,
    });
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    await this.organizationService.decreaseStats(
      organizationId,
      CountField.DEVICE_COUNT,
    );
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
