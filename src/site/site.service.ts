import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PipelineStage, UpdateQuery } from 'mongoose';
import { Site } from './schema/site.schema';
import { OrganizationService } from '../organization/organization.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';
import { CountField } from '../common/enums/count-fields.enum';

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
      CountField.SITE_COUNT,
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
    const pipeline: PipelineStage[] = [
      {
        $match: {
          organization: organization._id,
        },
      },
      ...(search
        ? [
            {
              $search: {
                index: 'sites_partial_search',
                autocomplete: {
                  path: 'name',
                  query: search,
                  tokenOrder: 'sequential',
                  fuzzy: {
                    maxEdits: 1,
                    prefixLength: 3,
                    maxExpansions: 100,
                  },
                },
              },
            },
          ]
        : []),
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: 1,
          description: 1,
          location: 1,
          address: 1,
          buildingCount: 1,
          deviceCount: 1,
          pointsCount: 1,
          cover: 1,
          organization: 1,
          createdAt: 1,
        },
      },
    ];

    return this.siteModel.paginatedAggregation(pipeline, paginationDto);
  }

  async findOne(user: string, organizationId: string, id: string) {
    const organization = await this.findOrganization(user, organizationId);
    const site = await this.siteModel.findOne({
      _id: id,
      organization: organization._id,
    });
    if (!site) {
      throw new NotFoundException('Site not found');
    }
    return site;
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
      CountField.SITE_COUNT,
    );
    return site;
  }

  async increaseStats(id: string, field: CountField) {
    return this.siteModel.findByIdAndUpdate(id, {
      $inc: { [field]: 1 },
    });
  }

  async decreaseStats(id: string, field: CountField) {
    return this.siteModel.findByIdAndUpdate(id, {
      $inc: { [field]: -1 },
    });
  }
}
