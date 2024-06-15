import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ProjectionType } from 'mongoose';
import { Event } from './schema/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { GetEventsQueryDto } from './dto/get-events.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<Event>,
  ) {}

  createEvent(createEventDto: CreateEventDto) {
    return this.eventModel.create(createEventDto);
  }

  async getEvents(device: string, query: GetEventsQueryDto): Promise<Event[]> {
    const { from, to, eventTypes } = query;
    const adjustedTo = new Date(to);
    adjustedTo.setHours(23, 59, 59, 999);

    const filter: FilterQuery<Event> = {
      device,
      createdAt: { $gte: from, $lte: adjustedTo },
    };

    const projection: ProjectionType<Event> = {
      createdAt: 1,
    };

    if (eventTypes) {
      const eventTypesArray = eventTypes.split(',');
      eventTypesArray.forEach((type) => {
        projection[type] = 1;
      });
    } else {
      projection.temperature = 1;
      projection.relativeHumidity = 1;
      projection.pressure = 1;
    }

    return this.eventModel.find(filter, projection).sort({ createdAt: -1 });
  }
}
