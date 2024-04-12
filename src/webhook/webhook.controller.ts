import { Controller, Post, Body } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { Public } from '../common/decorators/public.decorator';

@Public()
@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('door')
  async door(@Body() doorWebhookDto: any) {
    await this.webhookService.door(doorWebhookDto);
  }

  @Post('alarm')
  async alarm(@Body() alarmWebhookDto: any) {
    await this.webhookService.alarm(alarmWebhookDto);
  }

  @Post('lux')
  async lux(@Body() luxWebhookDto: any) {
    await this.webhookService.lux(luxWebhookDto);
  }

  @Post('motion')
  async motion(@Body() motionWebhookDto: any) {
    await this.webhookService.motion(motionWebhookDto);
  }

  @Post('co2')
  async co2(@Body() co2WebhookDto: any) {
    await this.webhookService.co2(co2WebhookDto);
  }

  @Post('temperature')
  async temperature(@Body() temperatureWebhookDto: any) {
    await this.webhookService.temperature(temperatureWebhookDto);
  }

  @Post('airConditioner')
  async airConditioner(@Body() airConditionerWebhookDto: any) {
    await this.webhookService.airConditioner(airConditionerWebhookDto);
  }

  @Post('energy')
  async energy(@Body() energyWebhookDto: any) {
    await this.webhookService.energy(energyWebhookDto);
  }
}
