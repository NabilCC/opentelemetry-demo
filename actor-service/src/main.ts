import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {WinstonModule} from "nest-winston";
import {Logger} from '@nestjs/common';
import {winstonOptions} from "./winston.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonOptions()),
  });

  const port = process.env.PORT || 4001;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`App is listening on port ${port}`);
}

bootstrap();
