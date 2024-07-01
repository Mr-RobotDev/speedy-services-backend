import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { DeviceService } from '../device/device.service';
import { EventService } from '../event/event.service';

@Injectable()
export class WebhookService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly deviceService: DeviceService,
    private readonly eventService: EventService,
  ) {}
}
