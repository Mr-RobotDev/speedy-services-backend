import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import toJSON from '../../common/plugins/toJSON.plugin';
import { Document, Types } from 'mongoose';
import {
  paginate,
  paginatedAggregation,
} from '../../common/plugins/pagination.plugin';
import { Address, AddressSchema } from '../../common/schema/address.schema';
import { Site } from '../../site/schema/site.schema';

@Schema({
  timestamps: true,
})
export class Building extends Document {
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
    type: AddressSchema,
    required: true,
  })
  address: Address;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  floorCount: number;

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
    ref: Site.name,
    required: true,
    index: true,
  })
  site: Site;
}

export const BuildingSchema = SchemaFactory.createForClass(Building);

BuildingSchema.plugin(toJSON);
BuildingSchema.plugin(paginate);
BuildingSchema.plugin(paginatedAggregation);
