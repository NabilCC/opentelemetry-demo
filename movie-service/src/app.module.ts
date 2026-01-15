import {Module} from '@nestjs/common';
import {HttpModule} from '@nestjs/axios';
import {HealthController} from './health.controller';
import {ConfigModule} from "@nestjs/config";
import {PrismaService} from './prisma/prisma.service';
import {MovieService} from './movie/movie.service';
import {MovieController} from "./movie/movie.controller";
import { RedisModule } from './redis/redis.module';
import { UserModule } from './user/user.module';
import {ClientsModule, Transport} from "@nestjs/microservices";

@Module({
  imports: [HttpModule, ConfigModule.forRoot({
    isGlobal: true,
  }), RedisModule, UserModule,  ClientsModule.register([
    {
      name: 'KAFKA_PRODUCER',
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'movie-service',
          brokers: [process.env.KAFKA_BROKERS ?? 'localhost:9092'],
        },
        producerOnlyMode: true,
      },
    },
  ]),],
  controllers: [HealthController, MovieController],
  providers: [PrismaService, MovieService, PrismaService],
})
export class AppModule {
}
