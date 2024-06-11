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
import { SiteService } from './site.service';
import { MediaService } from '../media/media.service';
import { DeviceService } from '../device/device.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { ImageUploadPipe } from '../common/pipes/image.pipe';
import { Folder } from '../common/enums/folder.enum';

@Controller({
  path: 'sites',
  version: '1',
})
export class SiteController {
  constructor(
    private readonly siteService: SiteService,
    private readonly mediaService: MediaService,
    private readonly deviceService: DeviceService,
  ) {}

  @Post()
  create(@Body() createSiteDto: CreateSiteDto) {
    return this.siteService.create(createSiteDto);
  }

  @Get()
  findAll(
    @Query('search') search: string,
    @Query() paginationDto: PaginationQueryDto,
  ) {
    return this.siteService.findAll(search, paginationDto);
  }

  @Get(':site')
  findOne(@Param('site') site: string) {
    return this.siteService.findOne(site);
  }

  @Get(':site/devices')
  getSiteDevices(
    @Param('site') site: string,
    @Query('search') search: string,
    @Query() paginationDto: PaginationQueryDto,
  ) {
    return this.deviceService.getSiteDevices(site, search, paginationDto);
  }

  @Put(':site/cover')
  @UseInterceptors(FileInterceptor('file'))
  async updateProfilePic(
    @Param('site') site: string,
    @UploadedFile(new ImageUploadPipe()) file: Express.Multer.File,
  ) {
    const cover = await this.mediaService.uploadImage(
      file,
      Folder.SITE_COVER_IMAGES,
    );
    await this.siteService.update(site, { cover });
    return { cover };
  }

  @Patch(':site')
  update(@Param('site') site: string, @Body() updateSiteDto: UpdateSiteDto) {
    return this.siteService.update(site, updateSiteDto);
  }

  @Delete(':site')
  remove(@Param('site') site: string) {
    return this.siteService.remove(site);
  }
}
