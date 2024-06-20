import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { DeviceService } from '../device/device.service';
import { EventService } from '../event/event.service';

@Injectable()
export class WebhookService implements OnModuleInit {
  private resolvedUrl: string;
  private token: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly deviceService: DeviceService,
    private readonly eventService: EventService,
  ) {
    this.token = btoa(
      `${configService.get<string>('miniserver.username')}:${configService.get<string>('miniserver.password')}`,
    );
  }

  async onModuleInit() {}

  async refreshResolvedUrl() {
    try {
      const response = await this.httpService.axiosRef.get(
        `/${this.configService.get<string>('miniserver.id')}`,
      );
      this.resolvedUrl = response.request?.res?.responseUrl;
    } catch (error) {
      console.error('Error fetching URL:', error);
    }
  }

  async fetchData() {
    try {
      const uuids = await this.deviceService.getAllDevices();
      const fetchAndProcessPromises = uuids.map(async (uuid) => {
        const value = await this.fetchDeviceData(uuid);
        const device = await this.deviceService.updateDeviceValue(uuid, value);
        await this.eventService.createEvent({
          value,
          device: device.id,
        });
      });

      await Promise.all(fetchAndProcessPromises);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  private async fetchDeviceData(uuid: string): Promise<string> {
    try {
      const response = await this.httpService.axiosRef.get(
        `${this.resolvedUrl}jdev/sps/io/${uuid}/state`,
        {
          headers: {
            Authorization: 'Basic ' + this.token,
          },
        },
      );
      return response.data.LL.value;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
}
