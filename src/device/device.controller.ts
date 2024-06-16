import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { IsObjectIdPipe } from '../common/pipes/objectid.pipe';

@Controller({
  path: 'sites/:site/buildings/:building/floors/:floor/rooms/:room/devices',
  version: '1',
})
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  create(
    @Param('site', IsObjectIdPipe) site: string,
    @Param('building', IsObjectIdPipe) building: string,
    @Param('floor', IsObjectIdPipe) floor: string,
    @Param('room', IsObjectIdPipe) room: string,
    @Body() createDeviceDto: CreateDeviceDto,
  ) {
    return this.deviceService.create(
      site,
      building,
      floor,
      room,
      createDeviceDto,
    );
  }

  @Get()
  findAll(
    @Param('site', IsObjectIdPipe) site: string,
    @Param('building', IsObjectIdPipe) building: string,
    @Param('floor', IsObjectIdPipe) floor: string,
    @Param('room', IsObjectIdPipe) room: string,
    @Query('search') search: string,
    @Query() paginationDto: PaginationQueryDto,
  ) {
    return this.deviceService.findAll(
      site,
      building,
      floor,
      room,
      search,
      paginationDto,
    );
  }

  @Get(':device')
  findOne(
    @Param('site', IsObjectIdPipe) site: string,
    @Param('building', IsObjectIdPipe) building: string,
    @Param('floor', IsObjectIdPipe) floor: string,
    @Param('room', IsObjectIdPipe) room: string,
    @Param('device', IsObjectIdPipe) device: string,
  ) {
    return this.deviceService.findOne(site, building, floor, room, device);
  }

  @Patch(':device')
  update(
    @Param('site', IsObjectIdPipe) site: string,
    @Param('building', IsObjectIdPipe) building: string,
    @Param('floor', IsObjectIdPipe) floor: string,
    @Param('room', IsObjectIdPipe) room: string,
    @Param('device', IsObjectIdPipe) device: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ) {
    return this.deviceService.update(
      site,
      building,
      floor,
      room,
      device,
      updateDeviceDto,
    );
  }

  @Delete(':device')
  remove(
    @Param('site', IsObjectIdPipe) site: string,
    @Param('building', IsObjectIdPipe) building: string,
    @Param('floor', IsObjectIdPipe) floor: string,
    @Param('room', IsObjectIdPipe) room: string,
    @Param('device', IsObjectIdPipe) device: string,
  ) {
    return this.deviceService.remove(site, building, floor, room, device);
  }
}
