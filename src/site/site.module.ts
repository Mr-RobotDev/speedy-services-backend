import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SiteService } from './site.service';
import { SiteController } from './site.controller';
import { Site, SiteSchema } from './schema/site.schema';
import { MediaModule } from '../media/media.module';
import { BuildingModule } from '../building/building.module';
import { DeviceModule } from '../device/device.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Site.name,
        schema: SiteSchema,
      },
    ]),
    MediaModule,
    forwardRef(() => BuildingModule),
    forwardRef(() => DeviceModule),
  ],
  controllers: [SiteController],
  providers: [SiteService],
  exports: [SiteService],
})
export class SiteModule {}
