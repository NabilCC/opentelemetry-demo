import {Module} from '@nestjs/common';
import {HttpModule} from '@nestjs/axios';
import {HealthController} from './health.controller';
import {ConfigModule} from "@nestjs/config";
import {PrismaService} from './prisma/prisma.service';
import {MovieService} from './movie/movie.service';
import {MovieController} from "./movie/movie.controller";
import { RedisModule } from './redis/redis.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [HttpModule, ConfigModule.forRoot({
    isGlobal: true,
  }), RedisModule, UserModule],
  controllers: [HealthController, MovieController],
  providers: [PrismaService, MovieService, PrismaService],
})
export class AppModule {
}
