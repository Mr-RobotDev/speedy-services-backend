import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false, versionKey: false })
export class Address {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  streetAddress?: string;

  @Prop({
    type: String,
    trim: true,
  })
  addressLine2?: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  city: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  state: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  country: string;

  @Prop({
    type: String,
    trim: true,
  })
  zip?: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
