import { Model, Document, PipelineStage } from 'mongoose';
import { Options } from './options.interface';
import { Result } from './result.interface';

export interface PaginatedModel<T extends Document> extends Model<T> {
  paginate(filter: object, options?: Options): Promise<Result<T>>;
  paginatedAggregation(
    pipeline: PipelineStage[],
    options?: Options,
  ): Promise<Result<T>>;
}
