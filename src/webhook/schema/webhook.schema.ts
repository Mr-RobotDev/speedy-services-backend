import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Webhook extends Document {}

export const WebhookSchema = SchemaFactory.createForClass(Webhook);
