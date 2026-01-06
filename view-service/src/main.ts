import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {createWinstonOptions} from "./logger.config";
import {WinstonModule} from "nest-winston";
import {Logger} from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(createWinstonOptions()),
  });

  const port = process.env.PORT || 4002;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`App is listening on port ${port}`);
}

bootstrap();
