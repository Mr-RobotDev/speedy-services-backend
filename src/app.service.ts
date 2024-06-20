import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getVersion(): string {
    return 'version 1.0.0 is up & running!';
  }
}
