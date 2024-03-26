import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3, PutObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';

@Injectable()
export class MediaService {
  private s3: S3;

  constructor(private configService: ConfigService) {
    this.s3 = new S3({
      endpoint: configService.get('spaces.endpoint'),
      region: configService.get('spaces.region'),
      credentials: {
        accessKeyId: configService.get('spaces.accessKey'),
        secretAccessKey: configService.get('spaces.secretKey'),
      },
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    try {
      const filepath = `${folder}/${file.originalname}`;
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.configService.get('spaces.bucket'),
          Key: filepath,
          Body: file.buffer,
          ACL: ObjectCannedACL.public_read,
          ContentType: file.mimetype,
        }),
      );
      return `${this.configService.get('spaces.cdn')}/${filepath}`;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('File upload failed');
    }
  }
}
