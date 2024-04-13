import { forwardRef, Module } from '@nestjs/common';
import { FloorService } from './floor.service';
import { FloorController } from './floor.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Floor, FloorSchema } from './schema/floor.schema';
import { MediaModule } from '../media/media.module';
import { BuildingModule } from '../building/building.module';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Floor.name,
        schema: FloorSchema,
      },
    ]),
    MediaModule,
    forwardRef(() => BuildingModule),
    forwardRef(() => RoomModule),
  ],
  controllers: [FloorController],
  providers: [FloorService],
  exports: [FloorService],
})
export class FloorModule {}
