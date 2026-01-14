import {Controller, Logger} from '@nestjs/common';
import {Ctx, KafkaContext, MessagePattern, Payload} from "@nestjs/microservices";
import {ViewService} from "./view.service";
import {context} from "@opentelemetry/api";

@Controller('view')
export class ViewController {

  private readonly logger = new Logger(ViewController.name);

  constructor(private readonly viewService: ViewService) {
  }

  @MessagePattern('movies.views.incremented')
  async handleViewsIncremented(
      @Payload() message: {movieId: number},
      @Ctx() context: KafkaContext,
  ) {
    const originalMessage = context.getMessage();
    const topic = context.getTopic();
    const partition = context.getPartition();

    this.logger.log('Topic:' + topic);
    this.logger.log('Partition:' + partition);
    this.logger.log('Value:' + message);

    await this.viewService.incrementViewsForMovie(message.movieId);

    return {
      success: true,
    };
  }


}
