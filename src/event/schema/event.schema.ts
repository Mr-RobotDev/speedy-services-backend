import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import toJSON from '../../common/plugins/toJSON.plugin';
import {
  paginate,
  paginatedAggregation,
} from '../../common/plugins/pagination.plugin';
import { Device } from '../../device/schema/device.schema';

@Schema({
  timestamps: true,
})
export class Event extends Document {
  @Prop({
    type: Number,
    required: true,
  })
  value: number;

  @Prop({
    type: Types.ObjectId,
    ref: Device.name,
    required: true,
    index: true,
  })
  device: Device;
}

export const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.plugin(toJSON);
EventSchema.plugin(paginate);
EventSchema.plugin(paginatedAggregation);
