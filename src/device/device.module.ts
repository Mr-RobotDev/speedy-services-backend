import { forwardRef, Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from './schema/device.schema';
import { SiteModule } from '../site/site.module';
import { BuildingModule } from '../building/building.module';
import { FloorModule } from '../floor/floor.module';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
    forwardRef(() => SiteModule),
    BuildingModule,
    FloorModule,
    RoomModule,
  ],
  controllers: [DeviceController],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DeviceModule {}
