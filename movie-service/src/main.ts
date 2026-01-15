// main.ts
import './tracing'; // MUST be first
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {Logger} from '@nestjs/common';
import {WinstonModule} from "nest-winston";
import {winstonOptions} from "./winston.config";
import {Transport} from "@nestjs/microservices";


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonOptions()),
  });

  const logger = new Logger('Bootstrap');

  logger.log(`App is connecting microservices`);
  // app.connectMicroservice({
  //   transport: Transport.KAFKA,
  //   options: {
  //     client: {
  //       brokers: [process.env.KAFKA_BROKERS ?? 'localhost:9092'],
  //     },
  //     producerOnlyMode: true
  //   },
  // });
  //
  // logger.log(`App is starting microservices`);
  // await app.startAllMicroservices();

  const port = process.env.PORT || 4000;
  logger.log(`App is attempting to listen on port ${port}`);
  await app.listen(port);

  logger.log(`App is listening on port ${port}`);
}

bootstrap();