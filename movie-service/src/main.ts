import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {Logger} from '@nestjs/common';
import {WinstonModule} from "nest-winston";
import {winstonOptions} from "./winston.config";


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonOptions()),
  });

  const logger = new Logger('Bootstrap');

  const port = process.env.PORT || 4000;
  logger.log(`App is attempting to listen on port ${port}`);
  await app.listen(port);

  logger.log(`App is listening on port ${port}`);
}

bootstrap();