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
import { OrganizationService } from './organization.service';
import { MediaService } from '../media/media.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { ImageUploadPipe } from '../common/pipes/image.pipe';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Account } from '../common/interfaces/account.interface';
import { Folder } from '../common/enums/folder.enum';

@Controller({
  path: 'organizations',
  version: '1',
})
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly mediaService: MediaService,
  ) {}

  @Post()
  create(
    @CurrentUser() account: Account,
    @Body() createOrganizationDto: CreateOrganizationDto,
  ) {
    return this.organizationService.create(account.sub, createOrganizationDto);
  }

  @Get()
  findAll(
    @CurrentUser() account: Account,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.organizationService.findAll(account.sub, paginationDto);
  }

  @Get(':organization')
  findOne(
    @CurrentUser() account: Account,
    @Param('organization') organization: string,
  ) {
    return this.organizationService.findOne(account.sub, organization);
  }

  @Put(':organization/logo')
  @UseInterceptors(FileInterceptor('file'))
  async updateProfilePic(
    @CurrentUser() account: Account,
    @Param('organization') organization: string,
    @UploadedFile(new ImageUploadPipe()) file: Express.Multer.File,
  ) {
    const logo = await this.mediaService.uploadImage(
      file,
      Folder.ORGANIZATION_LOGOS,
    );
    await this.organizationService.update(account.sub, organization, { logo });
    return { logo };
  }

  @Patch(':organization')
  update(
    @CurrentUser() account: Account,
    @Param('organization') organization: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationService.update(
      account.sub,
      organization,
      updateOrganizationDto,
    );
  }

  @Delete(':organization')
  remove(
    @CurrentUser() account: Account,
    @Param('organization') organization: string,
  ) {
    return this.organizationService.remove(account.sub, organization);
  }
}
