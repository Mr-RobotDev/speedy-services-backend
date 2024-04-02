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
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ImageUploadPipe } from '../common/pipes/image.pipe';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Account } from '../common/interfaces/account.interface';
import { Folder } from '../common/enums/folder.enum';
import { DeviceService } from '../device/device.service';

@Controller({
  path: 'organizations/:organization/sites',
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
    @Param('organization') organization: string,
    @Body() createSiteDto: CreateSiteDto,
  ) {
    return this.siteService.create(account.sub, organization, createSiteDto);
  }

  @Get()
  findAll(
    @CurrentUser() account: Account,
    @Param('organization') organization: string,
    @Query('search') search: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.siteService.findAll(
      account.sub,
      organization,
      search,
      paginationDto,
    );
  }

  @Get(':site')
  findOne(
    @CurrentUser() account: Account,
    @Param('organization') organization: string,
    @Param('site') site: string,
  ) {
    return this.siteService.findOne(account.sub, organization, site);
  }

  @Get(':site/devices')
  getSiteDevices(
    @CurrentUser() account: Account,
    @Param('organization') organization: string,
    @Param('site') site: string,
    @Query('search') search: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.deviceService.getSiteDevices(
      account.sub,
      organization,
      site,
      search,
      paginationDto,
    );
  }

  @Put(':site/cover')
  @UseInterceptors(FileInterceptor('file'))
  async updateProfilePic(
    @CurrentUser() account: Account,
    @Param('organization') organization: string,
    @Param('site') site: string,
    @UploadedFile(new ImageUploadPipe()) file: Express.Multer.File,
  ) {
    const cover = await this.mediaService.uploadImage(
      account.sub,
      file,
      Folder.SITE_COVER_IMAGES,
    );
    await this.siteService.update(account.sub, organization, site, { cover });
    return { cover };
  }

  @Patch(':site')
  update(
    @CurrentUser() account: Account,
    @Param('organization') organization: string,
    @Param('site') site: string,
    @Body() updateSiteDto: UpdateSiteDto,
  ) {
    return this.siteService.update(
      account.sub,
      organization,
      site,
      updateSiteDto,
    );
  }

  @Delete(':site')
  remove(
    @CurrentUser() account: Account,
    @Param('organization') organization: string,
    @Param('site') site: string,
  ) {
    return this.siteService.remove(account.sub, organization, site);
  }
}
