import { Injectable } from '@nestjs/common';

@Injectable()
export class WebhookService {
  async door(doorWebhookDto: any) {
    console.log('doorWebhookDto', doorWebhookDto);
  }

  async alarm(alarmWebhookDto: any) {
    console.log('alarmWebhookDto', alarmWebhookDto);
  }

  async lux(luxWebhookDto: any) {
    console.log('luxWebhookDto', luxWebhookDto);
  }

  async motion(motionWebhookDto: any) {
    console.log('motionWebhookDto', motionWebhookDto);
  }

  async co2(co2WebhookDto: any) {
    console.log('co2WebhookDto', co2WebhookDto);
  }

  async temperature(temperatureWebhookDto: any) {
    console.log('temperatureWebhookDto', temperatureWebhookDto);
  }

  async airConditioner(airConditionerWebhookDto: any) {
    console.log('airConditionerWebhookDto', airConditionerWebhookDto);
  }

  async energy(energyWebhookDto: any) {
    console.log('energyWebhookDto', energyWebhookDto);
  }
}
