import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BuildingService } from './building.service';
import { BuildingController } from './building.controller';
import { Building, BuildingSchema } from './schema/building.schema';
import { MediaModule } from '../media/media.module';
import { SiteModule } from '../site/site.module';
import { FloorModule } from '../floor/floor.module';

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
    forwardRef(() => FloorModule),
  ],
  controllers: [BuildingController],
  providers: [BuildingService],
  exports: [BuildingService],
})
export class BuildingModule {}
