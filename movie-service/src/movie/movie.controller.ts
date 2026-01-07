import {BadRequestException, Controller, Get, Headers, HttpException, HttpStatus, Logger, Param, ParseIntPipe} from '@nestjs/common';
import {MovieService} from "./movie.service";

@Controller('movie')
export class MovieController {
  private readonly logger = new Logger(MovieController.name);

  constructor(private readonly movieService: MovieService) {
  }

  @Get(':id')
  async getMovieById(@Param('id', ParseIntPipe) movieId: number,
                     @Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }

    // TODO: lookup the user from the Redis cache

    // TODO: Send user access request to Bull MQ

    this.logger.log({message: `GET movie by id: ${movieId}`, labels: { 'key': 'value' }});

    const result = await this.movieService.findMovieById(movieId);
    if (!result) {
      this.logger.error(`Movie ${movieId} was not found.`);
      throw new HttpException("Movie does not exist", HttpStatus.NOT_FOUND);
    }
    return result;
  }
}
