import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PipelineStage, UpdateQuery } from 'mongoose';
import { Site } from './schema/site.schema';
import { MediaService } from '../media/media.service';
import { BuildingService } from '../building/building.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';
import { CountField } from '../common/enums/count-fields.enum';

@Injectable()
export class SiteService {
  constructor(
    @InjectModel(Site.name)
    private readonly siteModel: PaginatedModel<Site>,
    private readonly mediaService: MediaService,
    @Inject(forwardRef(() => BuildingService))
    private readonly buildingService: BuildingService,
  ) {}

  async create(createSiteDto: CreateSiteDto) {
    const site = await this.siteModel.create({
      ...createSiteDto,
    });
    return site;
  }

  async findAll(search: string, paginationDto: PaginationQueryDto) {
    const pipeline: PipelineStage[] = [
      ...(search
        ? [
            {
              $search: {
                index: 'sites_partial_search',
                autocomplete: {
                  path: 'name',
                  query: search,
                  tokenOrder: 'sequential',
                  fuzzy: {
                    maxEdits: 1,
                    prefixLength: 3,
                    maxExpansions: 100,
                  },
                },
              },
            },
          ]
        : []),
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: 1,
          description: 1,
          location: 1,
          address: 1,
          buildingCount: 1,
          deviceCount: 1,
          pointsCount: 1,
          cover: 1,
          createdAt: 1,
        },
      },
    ];

    return this.siteModel.paginatedAggregation(pipeline, paginationDto);
  }

  async findOne(id: string) {
    const site = await this.siteModel.findById(id);
    if (!site) {
      throw new NotFoundException('Site not found');
    }
    return site;
  }

  async update(id: string, updateSite: UpdateQuery<Site>) {
    const site = await this.siteModel.findByIdAndUpdate(id, updateSite, {
      new: true,
    });
    if (!site) {
      throw new NotFoundException('Site not found');
    }
    return site;
  }

  async remove(id: string) {
    console.log(id);
    const site = await this.siteModel.findByIdAndDelete(id);
    console.log(site);
    if (!site) {
      throw new NotFoundException('Site not found');
    }
    await this.buildingService.removeSiteBuildings(site._id);
    if (site.cover) await this.mediaService.deleteImage(site.cover);
    return site;
  }

  async increaseStats(id: string, field: CountField) {
    return this.siteModel.findByIdAndUpdate(id, {
      $inc: { [field]: 1 },
    });
  }

  async decreaseStats(id: string, field: CountField) {
    return this.siteModel.findByIdAndUpdate(id, {
      $inc: { [field]: -1 },
    });
  }
}
