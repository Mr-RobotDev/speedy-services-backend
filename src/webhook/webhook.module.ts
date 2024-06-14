import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { WebhookService } from './webhook.service';
import { DeviceModule } from '../device/device.module';
import { EventModule } from '../event/event.module';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('miniserver.url'),
      }),
      inject: [ConfigService],
    }),
    DeviceModule,
    EventModule,
  ],
  providers: [WebhookService],
})
export class WebhookModule {}
