import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Event } from './schema/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';
import { Result } from '../common/interfaces/result.interface';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: PaginatedModel<Event>,
  ) {}

  create(createEventDto: CreateEventDto) {
    return this.eventModel.create(createEventDto);
  }

  getEvents(device: string, query: PaginationQueryDto): Promise<Result<Event>> {
    const { page, limit } = query;
    return this.eventModel.paginate({ device }, { page, limit });
  }
}
