import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RoomService } from './room.service';
import { MediaService } from '../media/media.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Account } from '../common/interfaces/account.interface';
import { DiagramUploadPipe } from '../common/pipes/diagram.pipe';
import { Folder } from '../common/enums/folder.enum';

@Controller({
  path: 'sites/:site/buildings/:building/floors/:floor/rooms',
  version: '1',
})
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly mediaService: MediaService,
  ) {}

  @Post()
  create(
    @CurrentUser() account: Account,
    @Param('site') site: string,
    @Param('building') building: string,
    @Param('floor') floor: string,
    @Body() createRoomDto: CreateRoomDto,
  ) {
    return this.roomService.create(
      account.sub,
      site,
      building,
      floor,
      createRoomDto,
    );
  }

  @Get()
  findAll(
    @CurrentUser() account: Account,
    @Param('site') site: string,
    @Param('building') building: string,
    @Param('floor') floor: string,
    @Query('search') search?: string,
    @Query() paginationDto?: PaginationDto,
  ) {
    return this.roomService.findAll(
      account.sub,
      site,
      building,
      floor,
      search,
      paginationDto,
    );
  }

  @Get(':room')
  findOne(
    @CurrentUser() account: Account,
    @Param('site') site: string,
    @Param('building') building: string,
    @Param('floor') floor: string,
    @Param('room') room: string,
  ) {
    return this.roomService.findOne(account.sub, site, building, floor, room);
  }

  @Put(':room/diagram')
  @UseInterceptors(FileInterceptor('file'))
  async updateProfilePic(
    @CurrentUser() account: Account,

    @Param('site') site: string,
    @Param('building') building: string,
    @Param('floor') floor: string,
    @Param('room') room: string,
    @UploadedFile(new DiagramUploadPipe()) file: Express.Multer.File,
  ) {
    const diagram = await this.mediaService.uploadImage(
      account.sub,
      file,
      Folder.ROOM_DIAGRAMS,
    );
    await this.roomService.update(account.sub, site, building, floor, room, {
      diagram,
    });
    return { diagram };
  }

  @Patch(':room')
  update(
    @CurrentUser() account: Account,

    @Param('site') site: string,
    @Param('building') building: string,
    @Param('floor') floor: string,
    @Param('room') room: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomService.update(
      account.sub,
      site,
      building,
      floor,
      room,
      updateRoomDto,
    );
  }

  @Delete(':room')
  remove(
    @CurrentUser() account: Account,
    @Param('site') site: string,
    @Param('building') building: string,
    @Param('floor') floor: string,
    @Param('room') room: string,
  ) {
    return this.roomService.remove(account.sub, site, building, floor, room);
  }
}
