import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { Room, RoomSchema } from './schema/room.schema';
import { MediaModule } from '../media/media.module';
import { FloorModule } from '../floor/floor.module';
import { DeviceModule } from '../device/device.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Room.name,
        schema: RoomSchema,
      },
    ]),
    MediaModule,
    forwardRef(() => FloorModule),
    forwardRef(() => DeviceModule),
  ],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule {}
