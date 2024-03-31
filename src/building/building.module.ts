import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BuildingService } from './building.service';
import { BuildingController } from './building.controller';
import { Building, BuildingSchema } from './schema/building.schema';
import { MediaModule } from '../media/media.module';
import { SiteModule } from '../site/site.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Building.name,
        schema: BuildingSchema,
      },
    ]),
    MediaModule,
    SiteModule,
  ],
  controllers: [BuildingController],
  providers: [BuildingService],
  exports: [BuildingService],
})
export class BuildingModule {}
