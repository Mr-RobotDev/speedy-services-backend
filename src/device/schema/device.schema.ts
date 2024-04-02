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
    type: Types.ObjectId,
    ref: Site.name,
    required: true,
    index: true,
  })
  site: Site | Types.ObjectId | string;

  @Prop({
    type: Types.ObjectId,
    ref: Building.name,
    required: true,
    index: true,
  })
  building: Building | Types.ObjectId | string;

  @Prop({
    type: Types.ObjectId,
    ref: Floor.name,
    required: true,
    index: true,
  })
  floor: Floor | Types.ObjectId | string;

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

DeviceSchema.pre('save', function (next) {
  if (typeof this.site === 'string') {
    this.site = new Types.ObjectId(this.site);
  }

  if (typeof this.building === 'string') {
    this.building = new Types.ObjectId(this.building);
  }

  if (typeof this.floor === 'string') {
    this.floor = new Types.ObjectId(this.floor);
  }

  next();
});
