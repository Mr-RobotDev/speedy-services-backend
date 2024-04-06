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
import { PaginationDto } from '../common/dto/pagination.dto';
import { DiagramUploadPipe } from '../common/pipes/diagram.pipe';
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
    @Param('site') site: string,
    @Param('building') building: string,
    @Body() createFloorDto: CreateFloorDto,
  ) {
    return this.floorService.create(site, building, createFloorDto);
  }

  @Get()
  findAll(
    @Param('site') site: string,
    @Param('building') building: string,
    @Query('search') search?: string,
    @Query() paginationDto?: PaginationDto,
  ) {
    return this.floorService.findAll(site, building, search, paginationDto);
  }

  @Get(':floor')
  findOne(
    @Param('site') site: string,
    @Param('building') building: string,
    @Param('floor') floor: string,
  ) {
    return this.floorService.findOne(site, building, floor);
  }

  @Put(':floor/diagram')
  @UseInterceptors(FileInterceptor('file'))
  async updateProfilePic(
    @Param('site') site: string,
    @Param('building') building: string,
    @Param('floor') floor: string,
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
    @Param('site') site: string,
    @Param('building') building: string,
    @Param('floor') floor: string,
    @Body() updateFloorDto: UpdateFloorDto,
  ) {
    return this.floorService.update(site, building, floor, updateFloorDto);
  }

  @Delete(':floor')
  remove(
    @Param('site') site: string,
    @Param('building') building: string,
    @Param('floor') floor: string,
  ) {
    return this.floorService.remove(site, building, floor);
  }
}
