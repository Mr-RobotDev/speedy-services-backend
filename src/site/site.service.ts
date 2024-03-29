import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateQuery } from 'mongoose';
import { Site } from './schema/site.schema';
import { CreateSiteDto } from './dto/create-site.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { OrganizationService } from '../organization/organization.service';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';
import { CountField } from 'src/common/enums/count-fields.enum';

@Injectable()
export class SiteService {
  constructor(
    @InjectModel(Site.name)
    private readonly siteModel: PaginatedModel<Site>,
    private readonly organizationService: OrganizationService,
  ) {}

  private async findOrganization(user: string, organizationId: string) {
    return this.organizationService.findOne(user, organizationId);
  }

  async create(
    user: string,
    organizationId: string,
    createSiteDto: CreateSiteDto,
  ) {
    const organization = await this.findOrganization(user, organizationId);
    const site = await this.siteModel.create({
      ...createSiteDto,
      organization: organization._id,
    });
    await this.organizationService.increaseStats(
      organization._id,
      CountField.SiteCount,
    );
    return site;
  }

  async findAll(
    user: string,
    organizationId: string,
    search: string,
    paginationDto: PaginationDto,
  ) {
    const organization = await this.findOrganization(user, organizationId);
    return this.siteModel.paginate(
      {
        organization: organization._id,
        ...(search && { $text: { $search: search, $caseSensitive: false } }),
      },
      paginationDto,
    );
  }

  async findOne(user: string, organizationId: string, id: string) {
    const organization = await this.findOrganization(user, organizationId);
    return this.siteModel.findOne({
      _id: id,
      organization: organization._id,
    });
  }

  async update(
    user: string,
    organizationId: string,
    id: string,
    updateSite: UpdateQuery<Site>,
  ) {
    const organization = await this.findOrganization(user, organizationId);
    const site = await this.siteModel.findOneAndUpdate(
      {
        _id: id,
        organization: organization._id,
      },
      updateSite,
      { new: true },
    );
    if (!site) {
      throw new NotFoundException('Site not found');
    }
    return site;
  }

  async remove(user: string, organizationId: string, id: string) {
    const organization = await this.findOrganization(user, organizationId);
    const site = await this.siteModel.findOneAndDelete({
      _id: id,
      organization: organization._id,
    });
    if (!site) {
      throw new NotFoundException('Site not found');
    }
    await this.organizationService.decreaseStats(
      organization._id,
      CountField.SiteCount,
    );
    return site;
  }
}
