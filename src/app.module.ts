import { APP_GUARD } from '@nestjs/core';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MediaModule } from './media/media.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SiteModule } from './site/site.module';
import { BuildingModule } from './building/building.module';
import { FloorModule } from './floor/floor.module';
import { RoomModule } from './room/room.module';
import { DeviceModule } from './device/device.module';
import { JwtAuthGuard } from './common/guards/auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { WebhookModule } from './webhook/webhook.module';
import { EventModule } from './event/event.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.url'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      ignoreEnvFile: false,
    }),
    ScheduleModule.forRoot(),
    MediaModule,
    UserModule,
    AuthModule,
    SiteModule,
    BuildingModule,
    FloorModule,
    RoomModule,
    DeviceModule,
    WebhookModule,
    EventModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
