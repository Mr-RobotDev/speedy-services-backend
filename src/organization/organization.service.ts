import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateQuery } from 'mongoose';
import { Organization } from './schema/organization.schema';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CountField } from '../common/enums/count-fields.enum';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization.name)
    private readonly organizationModel: PaginatedModel<Organization>,
  ) {}

  create(user: string, createOrganizationDto: CreateOrganizationDto) {
    return this.organizationModel.create({
      ...createOrganizationDto,
      user,
    });
  }

  findAll(user: string, paginationDto: PaginationDto) {
    return this.organizationModel.paginate({ user }, paginationDto);
  }

  async findOne(user: string, id: string) {
    const organization = await this.organizationModel.findOne({
      _id: id,
      user,
    });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }

  async update(
    user: string,
    id: string,
    updateOrganization: UpdateQuery<Organization>,
  ) {
    const organization = await this.organizationModel.findOneAndUpdate(
      {
        _id: id,
        user,
      },
      updateOrganization,
      { new: true },
    );
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }

  async remove(user: string, id: string) {
    const organization = await this.organizationModel.findOneAndDelete({
      _id: id,
      user,
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }

  async increaseStats(id: string, field: CountField) {
    return this.organizationModel.findByIdAndUpdate(id, {
      $inc: { [field]: 1 },
    });
  }

  async decreaseStats(id: string, field: CountField) {
    return this.organizationModel.findByIdAndUpdate(id, {
      $inc: { [field]: -1 },
    });
  }
}
