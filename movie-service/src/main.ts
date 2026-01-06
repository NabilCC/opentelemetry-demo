// main.ts
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {Logger} from '@nestjs/common';
import {WinstonModule} from "nest-winston";
import {createWinstonOptions} from "./logger.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(createWinstonOptions()),
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`App is listening on port ${port}`);
}

bootstrap();