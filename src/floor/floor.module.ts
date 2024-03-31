import { Module } from '@nestjs/common';
import { FloorService } from './floor.service';
import { FloorController } from './floor.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Floor, FloorSchema } from './schema/floor.schema';
import { MediaModule } from '../media/media.module';
import { BuildingModule } from '../building/building.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Floor.name,
        schema: FloorSchema,
      },
    ]),
    MediaModule,
    BuildingModule,
  ],
  controllers: [FloorController],
  providers: [FloorService],
})
export class FloorModule {}
