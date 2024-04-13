import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BuildingService } from './building.service';
import { MediaService } from '../media/media.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ImageUploadPipe } from '../common/pipes/image.pipe';
import { Folder } from '../common/enums/folder.enum';

@Controller({
  path: 'sites/:site/buildings',
  version: '1',
})
export class BuildingController {
  constructor(
    private readonly buildingService: BuildingService,
    private readonly mediaService: MediaService,
  ) {}

  @Post()
  create(
    @Param('site') site: string,
    @Body() createBuildingDto: CreateBuildingDto,
  ) {
    return this.buildingService.create(site, createBuildingDto);
  }

  @Get()
  findAll(
    @Param('site') site: string,
    @Query('search') search?: string,
    @Query() paginationDto?: PaginationDto,
  ) {
    return this.buildingService.findAll(site, search, paginationDto);
  }

  @Get(':building')
  findOne(@Param('site') site: string, @Param('building') building: string) {
    return this.buildingService.findOne(site, building);
  }

  @Put(':building/cover')
  @UseInterceptors(FileInterceptor('file'))
  async updateProfilePic(
    @Param('site') site: string,
    @Param('building') building: string,
    @UploadedFile(new ImageUploadPipe()) file: Express.Multer.File,
  ) {
    const cover = await this.mediaService.uploadImage(
      file,
      Folder.BUILDING_COVER_IMAGES,
    );
    await this.buildingService.update(site, building, { cover });
    return { cover };
  }

  @Patch(':building')
  update(
    @Param('site') site: string,
    @Param('building') building: string,
    @Body() updateBuildingDto: UpdateBuildingDto,
  ) {
    return this.buildingService.update(site, building, updateBuildingDto);
  }

  @Delete(':building')
  remove(@Param('site') site: string, @Param('building') building: string) {
    return this.buildingService.remove(site, building);
  }
}
