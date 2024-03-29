import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false, versionKey: false })
export class Location extends Document {
  @Prop({
    type: Number,
    required: true,
  })
  latitude: number;

  @Prop({
    type: Number,
    required: true,
  })
  longitude: number;
}

export const LocationSchema = SchemaFactory.createForClass(Location);
