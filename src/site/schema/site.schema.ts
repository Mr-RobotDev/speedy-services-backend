import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Location, LocationSchema } from './location.schema';
import { Organization } from '../../organization/schema/organization.schema';
import { Address, AddressSchema } from '../../common/schema/address.schema';
import toJSON from '../../common/plugins/toJSON.plugin';
import {
  paginate,
  paginatedAggregation,
} from '../../common/plugins/pagination.plugin';

@Schema({
  timestamps: true,
})
export class Site extends Document {
  @Prop({
    type: String,
    required: true,
    text: true,
  })
  name: string;

  @Prop({
    type: String,
  })
  description?: string;

  @Prop({
    type: LocationSchema,
    required: true,
  })
  location: Location;

  @Prop({
    type: AddressSchema,
    required: true,
  })
  address: Address;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  buildingCount: number;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  deviceCount: number;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  pointsCount: number;

  @Prop({
    type: String,
  })
  cover?: string;

  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organization: Organization;
}

export const SiteSchema = SchemaFactory.createForClass(Site);

SiteSchema.plugin(toJSON);
SiteSchema.plugin(paginate);
SiteSchema.plugin(paginatedAggregation);
