import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BuildingService } from './building.service';
import { BuildingController } from './building.controller';
import { Building, BuildingSchema } from './schema/building.schema';
import { MediaModule } from '../media/media.module';
import { SiteModule } from '../site/site.module';
import { DeviceModule } from '../device/device.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Building.name,
        schema: BuildingSchema,
      },
    ]),
    MediaModule,
    forwardRef(() => SiteModule),
    forwardRef(() => DeviceModule),
  ],
  controllers: [BuildingController],
  providers: [BuildingService],
  exports: [BuildingService],
})
export class BuildingModule {}
