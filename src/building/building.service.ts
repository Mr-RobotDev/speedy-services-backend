import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateQuery } from 'mongoose';
import { Building } from './schema/building.schema';
import { SiteService } from '../site/site.service';
import { OrganizationService } from '../organization/organization.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';
import { CountField } from '../common/enums/count-fields.enum';

@Injectable()
export class BuildingService {
  constructor(
    @InjectModel(Building.name)
    private readonly buildingModel: PaginatedModel<Building>,
    private readonly organizationService: OrganizationService,
    private readonly siteService: SiteService,
  ) {}

  private async findSite(user: string, organizationId: string, siteId: string) {
    return this.siteService.findOne(user, organizationId, siteId);
  }

  async create(
    user: string,
    organizationId: string,
    siteId: string,
    createBuildingDto: CreateBuildingDto,
  ) {
    const site = await this.findSite(user, organizationId, siteId);
    const building = await this.buildingModel.create({
      ...createBuildingDto,
      site: site._id,
    });
    await this.siteService.increaseStats(site._id, CountField.BUILDING_COUNT);
    return building;
  }

  async findAll(
    user: string,
    organizationId: string,
    siteId: string,
    search?: string,
    paginationDto?: PaginationDto,
  ) {
    const site = await this.findSite(user, organizationId, siteId);
    return this.buildingModel.paginate(
      {
        site: site._id,
        ...(search && { $text: { $search: search, $caseSensitive: false } }),
      },
      paginationDto,
    );
  }

  async findOne(
    user: string,
    organizationId: string,
    siteId: string,
    id: string,
  ) {
    const site = await this.findSite(user, organizationId, siteId);
    const building = await this.buildingModel.findOne({
      _id: id,
      site: site._id,
    });
    if (!building) {
      throw new NotFoundException('Building not found');
    }
    return building;
  }

  async update(
    user: string,
    organizationId: string,
    siteId: string,
    id: string,
    updateBuilding: UpdateQuery<Building>,
  ) {
    const site = await this.findSite(user, organizationId, siteId);
    const building = await this.buildingModel.findOneAndUpdate(
      {
        _id: id,
        site: site._id,
      },
      updateBuilding,
      { new: true },
    );
    if (!building) {
      throw new NotFoundException('Building not found');
    }
    return building;
  }

  async remove(
    user: string,
    organizationId: string,
    siteId: string,
    id: string,
  ) {
    const site = await this.findSite(user, organizationId, siteId);
    const building = await this.buildingModel.findOneAndDelete({
      _id: id,
      site: site._id,
    });
    if (!building) {
      throw new NotFoundException('Building not found');
    }
    await this.siteService.decreaseStats(site._id, CountField.BUILDING_COUNT);
    return building;
  }

  async increaseStats(id: string, field: CountField) {
    return this.buildingModel.findByIdAndUpdate(id, {
      $inc: { [field]: 1 },
    });
  }

  async decreaseStats(id: string, field: CountField) {
    return this.buildingModel.findByIdAndUpdate(id, {
      $inc: { [field]: -1 },
    });
  }
}
