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
import { DeviceService } from '../device/device.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Account } from '../common/interfaces/account.interface';
import { ImageUploadPipe } from '../common/pipes/image.pipe';
import { Folder } from '../common/enums/folder.enum';

@Controller({
  path: 'organizations/:organization/sites/:site/buildings',
  version: '1',
})
export class BuildingController {
  constructor(
    private readonly buildingService: BuildingService,
    private readonly mediaService: MediaService,
    private readonly deviceService: DeviceService,
  ) {}

  @Post()
  create(
    @CurrentUser() account: Account,
    @Param('organization') organization: string,
    @Param('site') site: string,
    @Body() createBuildingDto: CreateBuildingDto,
  ) {
    return this.buildingService.create(
      account.sub,
      organization,
      site,
      createBuildingDto,
    );
  }

  @Get()
  findAll(
    @CurrentUser() account: Account,
    @Param('organization') organization: string,
    @Param('site') site: string,
    @Query('search') search?: string,
    @Query() paginationDto?: PaginationDto,
  ) {
    return this.buildingService.findAll(
      account.sub,
      organization,
      site,
      search,
      paginationDto,
    );
  }

  @Get(':building/devices')
  getBuildingDevices(
    @CurrentUser() account: Account,
    @Param('organization') organization: string,
    @Param('site') site: string,
    @Param('building') building: string,
    @Query('search') search?: string,
    @Query() paginationDto?: PaginationDto,
  ) {
    return this.deviceService.getBuildingDevices(
      account.sub,
      organization,
      site,
      building,
      search,
      paginationDto,
    );
  }

  @Get(':building')
  findOne(
    @CurrentUser() account: Account,
    @Param('organization') organization: string,
    @Param('site') site: string,
    @Param('building') building: string,
  ) {
    return this.buildingService.findOne(
      account.sub,
      organization,
      site,
      building,
    );
  }

  @Put(':building/cover')
  @UseInterceptors(FileInterceptor('file'))
  async updateProfilePic(
    @CurrentUser() account: Account,
    @Param('organization') organization: string,
    @Param('site') site: string,
    @Param('building') building: string,
    @UploadedFile(new ImageUploadPipe()) file: Express.Multer.File,
  ) {
    const cover = await this.mediaService.uploadImage(
      account.sub,
      file,
      Folder.BUILDING_COVER_IMAGES,
    );
    await this.buildingService.update(
      account.sub,
      organization,
      site,
      building,
      { cover },
    );
    return { cover };
  }

  @Patch(':building')
  update(
    @CurrentUser() account: Account,
    @Param('organization') organization: string,
    @Param('site') site: string,
    @Param('building') building: string,
    @Body() updateBuildingDto: UpdateBuildingDto,
  ) {
    return this.buildingService.update(
      account.sub,
      organization,
      site,
      building,
      updateBuildingDto,
    );
  }

  @Delete(':building')
  remove(
    @CurrentUser() account: Account,
    @Param('organization') organization: string,
    @Param('site') site: string,
    @Param('building') building: string,
  ) {
    return this.buildingService.remove(
      account.sub,
      organization,
      site,
      building,
    );
  }
}
