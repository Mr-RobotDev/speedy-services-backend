import { Controller, Get, Param, Query } from '@nestjs/common';
import { EventService } from './event.service';
import { GetEventsQueryDto } from './dto/get-events.dto';
import { IsObjectIdPipe } from '../common/pipes/objectid.pipe';

@Controller({
  path: 'devices/:device/events',
  version: '1',
})
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  getEvents(
    @Param('device', IsObjectIdPipe) device: string,
    @Query() query: GetEventsQueryDto,
  ) {
    return this.eventService.getEvents(device, query);
  }
}
