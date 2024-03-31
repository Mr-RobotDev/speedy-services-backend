import { Module } from '@nestjs/common';
import { BuildingService } from './building.service';
import { BuildingController } from './building.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Building, BuildingSchema } from './schema/building.schema';
import { SiteModule } from '../site/site.module';
import { MediaModule } from 'src/media/media.module';

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
