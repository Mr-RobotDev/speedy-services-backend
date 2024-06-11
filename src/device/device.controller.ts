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

@Controller({
  path: 'sites/:site/buildings/:building/floors/:floor/rooms/:room/devices',
  version: '1',
})
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  create(
    @Param('site') site: string,
    @Param('building') building: string,
    @Param('floor') floor: string,
    @Param('room') room: string,
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
    @Param('site') site: string,
    @Param('building') building: string,
    @Param('floor') floor: string,
    @Param('room') room: string,
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
    @Param('site') site: string,
    @Param('building') building: string,
    @Param('floor') floor: string,
    @Param('room') room: string,
    @Param('device') device: string,
  ) {
    return this.deviceService.findOne(site, building, floor, room, device);
  }

  @Patch(':device')
  update(
    @Param('site') site: string,
    @Param('building') building: string,
    @Param('floor') floor: string,
    @Param('room') room: string,
    @Param('device') device: string,
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
    @Param('site') site: string,
    @Param('building') building: string,
    @Param('floor') floor: string,
    @Param('room') room: string,
    @Param('device') device: string,
  ) {
    return this.deviceService.remove(site, building, floor, room, device);
  }
}
