import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import toJSON from '../../common/plugins/toJSON.plugin';
import {
  paginate,
  paginatedAggregation,
} from '../../common/plugins/pagination.plugin';
import { Building } from '../../building/schema/building.schema';
import { Floor } from '../../floor/schema/floor.schema';
import { Room } from '../../room/schema/room.schema';
import { Site } from '../../site/schema/site.schema';

@Schema({
  timestamps: true,
})
export class Device extends Document {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
    index: true,
  })
  uuid: string;

  @Prop({
    type: String,
    required: true,
  })
  type: string;

  @Prop({
    type: Number,
    default: 0,
  })
  value: number;

  @Prop({
    type: Types.ObjectId,
    ref: Site.name,
    required: true,
    index: true,
  })
  site: Site;

  @Prop({
    type: Types.ObjectId,
    ref: Building.name,
    required: true,
    index: true,
  })
  building: Building;

  @Prop({
    type: Types.ObjectId,
    ref: Floor.name,
    required: true,
    index: true,
  })
  floor: Floor;

  @Prop({
    type: Types.ObjectId,
    ref: Room.name,
    required: true,
    index: true,
  })
  room: Room;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

DeviceSchema.plugin(toJSON);
DeviceSchema.plugin(paginate);
DeviceSchema.plugin(paginatedAggregation);
