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
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { DiagramUploadPipe } from '../common/pipes/diagram.pipe';
import { IsObjectIdPipe } from '../common/pipes/objectid.pipe';
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
    @Param('site', IsObjectIdPipe) site: string,
    @Param('building', IsObjectIdPipe) building: string,
    @Param('floor', IsObjectIdPipe) floor: string,
    @Body() createRoomDto: CreateRoomDto,
  ) {
    return this.roomService.create(site, building, floor, createRoomDto);
  }

  @Get()
  findAll(
    @Param('site', IsObjectIdPipe) site: string,
    @Param('building', IsObjectIdPipe) building: string,
    @Param('floor', IsObjectIdPipe) floor: string,
    @Query('search') search?: string,
    @Query() paginationDto?: PaginationQueryDto,
  ) {
    return this.roomService.findAll(
      site,
      building,
      floor,
      search,
      paginationDto,
    );
  }

  @Get(':room')
  findOne(
    @Param('site', IsObjectIdPipe) site: string,
    @Param('building', IsObjectIdPipe) building: string,
    @Param('floor', IsObjectIdPipe) floor: string,
    @Param('room', IsObjectIdPipe) room: string,
  ) {
    return this.roomService.findOne(site, building, floor, room);
  }

  @Put(':room/diagram')
  @UseInterceptors(FileInterceptor('file'))
  async updateProfilePic(
    @Param('site', IsObjectIdPipe) site: string,
    @Param('building', IsObjectIdPipe) building: string,
    @Param('floor', IsObjectIdPipe) floor: string,
    @Param('room', IsObjectIdPipe) room: string,
    @UploadedFile(new DiagramUploadPipe()) file: Express.Multer.File,
  ) {
    const diagram = await this.mediaService.uploadImage(
      file,
      Folder.ROOM_DIAGRAMS,
    );
    await this.roomService.update(site, building, floor, room, {
      diagram,
    });
    return { diagram };
  }

  @Patch(':room')
  update(
    @Param('site', IsObjectIdPipe) site: string,
    @Param('building', IsObjectIdPipe) building: string,
    @Param('floor', IsObjectIdPipe) floor: string,
    @Param('room', IsObjectIdPipe) room: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomService.update(site, building, floor, room, updateRoomDto);
  }

  @Delete(':room')
  remove(
    @Param('site', IsObjectIdPipe) site: string,
    @Param('building', IsObjectIdPipe) building: string,
    @Param('floor', IsObjectIdPipe) floor: string,
    @Param('room', IsObjectIdPipe) room: string,
  ) {
    return this.roomService.remove(site, building, floor, room);
  }
}
