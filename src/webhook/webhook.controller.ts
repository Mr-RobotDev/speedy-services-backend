import { Controller, Post, Req, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';

@Controller({
  path: 'webhook',
  version: '1',
})
export class WebhookController {
  @Post('receive-events-raw')
  async receiveEventsRaw(@Req() req: RawBodyRequest<Request>) {
    console.log(req.rawBody);
  }

  @Post('receive-events-json')
  async receiveEventsJson(@Req() request: Request) {
    console.log(request.body);
  }
}
