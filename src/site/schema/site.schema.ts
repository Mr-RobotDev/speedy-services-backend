import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Location, LocationSchema } from './location.schema';
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
    type: String,
  })
  cover?: string;
}

export const SiteSchema = SchemaFactory.createForClass(Site);

SiteSchema.plugin(toJSON);
SiteSchema.plugin(paginate);
SiteSchema.plugin(paginatedAggregation);
