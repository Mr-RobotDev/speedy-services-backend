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
import { FloorService } from './floor.service';
import { MediaService } from '../media/media.service';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { DiagramUploadPipe } from '../common/pipes/diagram.pipe';
import { IsObjectIdPipe } from '../common/pipes/objectid.pipe';
import { Folder } from '../common/enums/folder.enum';

@Controller({
  path: 'sites/:site/buildings/:building/floors',
  version: '1',
})
export class FloorController {
  constructor(
    private readonly floorService: FloorService,
    private readonly mediaService: MediaService,
  ) {}

  @Post()
  create(
    @Param('site', IsObjectIdPipe) site: string,
    @Param('building', IsObjectIdPipe) building: string,
    @Body() createFloorDto: CreateFloorDto,
  ) {
    return this.floorService.create(site, building, createFloorDto);
  }

  @Get()
  findAll(
    @Param('site', IsObjectIdPipe) site: string,
    @Param('building', IsObjectIdPipe) building: string,
    @Query('search') search?: string,
    @Query() paginationDto?: PaginationQueryDto,
  ) {
    return this.floorService.findAll(site, building, search, paginationDto);
  }

  @Get(':floor')
  findOne(
    @Param('site', IsObjectIdPipe) site: string,
    @Param('building', IsObjectIdPipe) building: string,
    @Param('floor', IsObjectIdPipe) floor: string,
  ) {
    return this.floorService.findOne(site, building, floor);
  }

  @Put(':floor/diagram')
  @UseInterceptors(FileInterceptor('file'))
  async updateProfilePic(
    @Param('site', IsObjectIdPipe) site: string,
    @Param('building', IsObjectIdPipe) building: string,
    @Param('floor', IsObjectIdPipe) floor: string,
    @UploadedFile(new DiagramUploadPipe()) file: Express.Multer.File,
  ) {
    const diagram = await this.mediaService.uploadImage(
      file,
      Folder.FLOOR_DIAGRAMS,
    );
    await this.floorService.update(site, building, floor, {
      diagram,
    });
    return { diagram };
  }

  @Patch(':floor')
  update(
    @Param('site', IsObjectIdPipe) site: string,
    @Param('building', IsObjectIdPipe) building: string,
    @Param('floor', IsObjectIdPipe) floor: string,
    @Body() updateFloorDto: UpdateFloorDto,
  ) {
    return this.floorService.update(site, building, floor, updateFloorDto);
  }

  @Delete(':floor')
  remove(
    @Param('site', IsObjectIdPipe) site: string,
    @Param('building', IsObjectIdPipe) building: string,
    @Param('floor', IsObjectIdPipe) floor: string,
  ) {
    return this.floorService.remove(site, building, floor);
  }
}
