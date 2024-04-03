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
import { PaginationDto } from '../common/dto/pagination.dto';
import { ImageUploadPipe } from '../common/pipes/image.pipe';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Account } from '../common/interfaces/account.interface';
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
  create(
    @CurrentUser() account: Account,
    @Body() createSiteDto: CreateSiteDto,
  ) {
    return this.siteService.create(account.sub, createSiteDto);
  }

  @Get()
  findAll(
    @CurrentUser() account: Account,
    @Query('search') search: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.siteService.findAll(account.sub, search, paginationDto);
  }

  @Get(':site')
  findOne(@CurrentUser() account: Account, @Param('site') site: string) {
    return this.siteService.findOne(account.sub, site);
  }

  @Get(':site/devices')
  getSiteDevices(
    @CurrentUser() account: Account,
    @Param('site') site: string,
    @Query('search') search: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.deviceService.getSiteDevices(
      account.sub,
      site,
      search,
      paginationDto,
    );
  }

  @Put(':site/cover')
  @UseInterceptors(FileInterceptor('file'))
  async updateProfilePic(
    @CurrentUser() account: Account,
    @Param('site') site: string,
    @UploadedFile(new ImageUploadPipe()) file: Express.Multer.File,
  ) {
    const cover = await this.mediaService.uploadImage(
      account.sub,
      file,
      Folder.SITE_COVER_IMAGES,
    );
    await this.siteService.update(account.sub, site, { cover });
    return { cover };
  }

  @Patch(':site')
  update(
    @CurrentUser() account: Account,
    @Param('site') site: string,
    @Body() updateSiteDto: UpdateSiteDto,
  ) {
    return this.siteService.update(account.sub, site, updateSiteDto);
  }

  @Delete(':site')
  remove(@CurrentUser() account: Account, @Param('site') site: string) {
    return this.siteService.remove(account.sub, site);
  }
}
