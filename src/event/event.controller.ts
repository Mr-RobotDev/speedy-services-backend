import { Controller, Get, Param, Query } from '@nestjs/common';
import { EventService } from './event.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@Controller({
  path: 'devices/:device/events',
  version: '1',
})
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  getEvents(
    @Param('device') device: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.eventService.getEvents(device, query);
  }
}
