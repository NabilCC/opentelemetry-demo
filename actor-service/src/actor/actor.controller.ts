import {Controller, Get, HttpException, HttpStatus, Logger, Param, ParseIntPipe} from '@nestjs/common';
import {ActorService} from "./actor.service";

@Controller('actor')
export class ActorController {
  private readonly logger = new Logger(ActorController.name);

  constructor(private readonly actorService: ActorService) {
  }

  @Get(':id')
  async getActorById(@Param('id', ParseIntPipe) actorId: number) {
    this.logger.log(`GET actor by id: ${actorId}`);
    const result = await this.actorService.findActorById(actorId);
    if (!result) {
      this.logger.error(`Actor ${actorId} was not found.`);
      throw new HttpException("Actor does not exist", HttpStatus.NOT_FOUND);
    }
    return result;
  }

}
