import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SiteService } from './site.service';
import { SiteController } from './site.controller';
import { Site, SiteSchema } from './schema/site.schema';
import { MediaModule } from '../media/media.module';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Site.name,
        schema: SiteSchema,
      },
    ]),
    MediaModule,
    OrganizationModule,
  ],
  controllers: [SiteController],
  providers: [SiteService],
})
export class SiteModule {}
