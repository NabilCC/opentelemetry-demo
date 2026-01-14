// main.ts
import './tracing'; // MUST be first
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {WinstonModule} from "nest-winston";
import {Logger} from '@nestjs/common';
import {winstonOptions} from "./winston.config";
import {Transport} from "@nestjs/microservices";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonOptions()),
  });

  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKERS ?? 'localhost:9092'],
      },
      consumer: {
        groupId: 'audit-service',
      },
    },
  });

  await app.startAllMicroservices();

  const port = process.env.PORT || 4002;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`App is listening on port ${port}`);
}

bootstrap();
