import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import {
  ALLOWED_DIAGRAM_TYPES,
  IMAGE_MAX_SIZE,
} from '../constants/image.constant';

@Injectable()
export class DiagramUploadPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (
      !file ||
      file.size > IMAGE_MAX_SIZE ||
      !ALLOWED_DIAGRAM_TYPES.includes(file.mimetype)
    ) {
      throw new BadRequestException('Invalid File Type / Size');
    }
    return file;
  }
}
