import {Module} from '@nestjs/common';
import {HealthController} from './health.controller';
import {ActorController} from './actor/actor.controller';
import {PrismaService} from "./prisma/prisma.service";
import { ActorService } from './actor/actor.service';
import {ConfigModule} from "@nestjs/config";

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }),],
  controllers: [HealthController, ActorController],
  providers: [PrismaService, ActorService],
})
export class AppModule {}
