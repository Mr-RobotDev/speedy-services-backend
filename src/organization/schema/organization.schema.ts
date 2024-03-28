import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import toJSON from '../../common/plugins/toJSON.plugin';
import {
  paginate,
  paginatedAggregation,
} from '../../common/plugins/pagination.plugin';
import { Address, AddressSchema } from '../../common/schema/address.schema';
import { User } from '../../user/schema/user.schema';

@Schema({
  timestamps: true,
})
export class Organization extends Document {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    type: AddressSchema,
    required: true,
  })
  address: Address;

  @Prop({
    type: String,
    trim: true,
  })
  logo?: string;

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  user: User;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

OrganizationSchema.plugin(toJSON);
OrganizationSchema.plugin(paginate);
OrganizationSchema.plugin(paginatedAggregation);
