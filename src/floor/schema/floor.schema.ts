import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import toJSON from '../../common/plugins/toJSON.plugin';
import {
  paginate,
  paginatedAggregation,
} from '../../common/plugins/pagination.plugin';
import { Building } from '../../building/schema/building.schema';

@Schema({
  timestamps: true,
})
export class Floor extends Document {
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
    type: Number,
    default: 0,
    min: 0,
  })
  roomCount: number;

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
  diagram?: string;

  @Prop({
    type: Types.ObjectId,
    ref: Building.name,
    required: true,
    index: true,
  })
  building: Building;
}

export const FloorSchema = SchemaFactory.createForClass(Floor);

FloorSchema.plugin(toJSON);
FloorSchema.plugin(paginate);
FloorSchema.plugin(paginatedAggregation);
