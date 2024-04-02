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
import { PaginationDto } from '../common/dto/pagination.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Account } from '../common/interfaces/account.interface';

@Controller({
  path: 'organizations/:organization/sites/:site/buildings/:building/floors/:floor/rooms/:room/devices',
  version: '1',
})
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  create(
    @CurrentUser() account: Account,
    @Param('organization') organization: string,
    @Param('site') site: string,
    @Param('building') building: string,
    @Param('floor') floor: string,
    @Param('room') room: string,
    @Body() createDeviceDto: CreateDeviceDto,
  ) {
    return this.deviceService.create(
      account.sub,
      organization,
      site,
      building,
      floor,
      room,
      createDeviceDto,
    );
  }

  @Get()
  findAll(
    @CurrentUser() account: Account,
    @Param('organization') organization: string,
    @Param('site') site: string,
    @Param('building') building: string,
    @Param('floor') floor: string,
    @Param('room') room: string,
    @Query('search') search: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.deviceService.findAll(
      account.sub,
      organization,
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
    @CurrentUser() account: Account,
    @Param('organization') organization: string,
    @Param('site') site: string,
    @Param('building') building: string,
    @Param('floor') floor: string,
    @Param('room') room: string,
    @Param('device') device: string,
  ) {
    return this.deviceService.findOne(
      account.sub,
      organization,
      site,
      building,
      floor,
      room,
      device,
    );
  }

  @Patch(':device')
  update(
    @CurrentUser() account: Account,
    @Param('organization') organization: string,
    @Param('site') site: string,
    @Param('building') building: string,
    @Param('floor') floor: string,
    @Param('room') room: string,
    @Param('device') device: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ) {
    return this.deviceService.update(
      account.sub,
      organization,
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
    @CurrentUser() account: Account,
    @Param('organization') organization: string,
    @Param('site') site: string,
    @Param('building') building: string,
    @Param('floor') floor: string,
    @Param('room') room: string,
    @Param('device') device: string,
  ) {
    return this.deviceService.remove(
      account.sub,
      organization,
      site,
      building,
      floor,
      room,
      device,
    );
  }
}
