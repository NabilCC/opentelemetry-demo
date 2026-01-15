import {Module} from '@nestjs/common';
import {HealthController} from './health.controller';
import {PrismaService} from "./prisma/prisma.service";
import {ConfigModule} from "@nestjs/config";
import { ViewService } from './view/view.service';
import { ViewController } from './view/view.controller';
import {ClientsModule, Transport} from "@nestjs/microservices";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [HealthController, ViewController],
  providers: [PrismaService, ViewService],
})
export class AppModule {}
