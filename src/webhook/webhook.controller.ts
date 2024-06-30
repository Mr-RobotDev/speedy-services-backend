import {
  Controller,
  Post,
  Req,
  RawBodyRequest,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { Public } from '../common/decorators/public.decorator';

@Public()
@Controller({
  path: 'webhook',
  version: '1',
})
export class WebhookController {
  constructor() {}

  @Post('receive-events-raw')
  @HttpCode(HttpStatus.OK)
  async receiveEventsRaw(@Req() req: RawBodyRequest<Request>) {
    if (req.rawBody) console.log(req.rawBody.toString('utf8'));
  }
}
