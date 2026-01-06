import {Module} from '@nestjs/common';
import {HealthController} from './health.controller';
import {PrismaService} from "./prisma/prisma.service";
import {ConfigModule} from "@nestjs/config";
import { ViewService } from './view/view.service';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }),],
  controllers: [HealthController],
  providers: [PrismaService, ViewService],
})
export class AppModule {}
