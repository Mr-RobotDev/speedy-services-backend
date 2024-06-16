import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import toJSON from '../../common/plugins/toJSON.plugin';
import {
  paginate,
  paginatedAggregation,
} from '../../common/plugins/pagination.plugin';
import { Floor } from '../../floor/schema/floor.schema';

@Schema({
  timestamps: true,
})
export class Room extends Document {
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
  deviceCount: number;

  @Prop({
    type: String,
  })
  diagram?: string;

  @Prop({
    type: Types.ObjectId,
    ref: Floor.name,
    required: true,
    index: true,
  })
  floor: Floor;
}

export const RoomSchema = SchemaFactory.createForClass(Room);

RoomSchema.plugin(toJSON);
RoomSchema.plugin(paginate);
RoomSchema.plugin(paginatedAggregation);
