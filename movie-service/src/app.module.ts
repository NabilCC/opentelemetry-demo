import {Module} from '@nestjs/common';
import {HttpModule} from '@nestjs/axios';
import {HealthController} from './health.controller';
import {ConfigModule} from "@nestjs/config";
import {PrismaService} from './prisma/prisma.service';
import {MovieService} from './movie/movie.service';
import {MovieController} from "./movie/movie.controller";

@Module({
  imports: [HttpModule, ConfigModule.forRoot({
    isGlobal: true,
  })],
  controllers: [HealthController, MovieController],
  providers: [PrismaService, MovieService, PrismaService],
})
export class AppModule {
}
