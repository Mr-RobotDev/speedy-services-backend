import { Controller, Post, Req, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { Public } from '../common/decorators/public.decorator';

@Public()
@Controller({
  path: 'webhook',
  version: '1',
})
export class WebhookController {
  @Post('receive-events-raw')
  async receiveEventsRaw(@Req() req: RawBodyRequest<Request>) {
    console.log(req.rawBody.toString('utf8'));
  }

  @Post('receive-events-json')
  async receiveEventsJson(@Req() request: Request) {
    console.log(request.body);
  }
}
