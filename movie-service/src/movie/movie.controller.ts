import {BadRequestException, Controller, Get, Headers, HttpException, HttpStatus, Logger, Param, ParseIntPipe} from '@nestjs/common';
import {MovieService} from "./movie.service";
import {UserService} from "../user/user.service";

@Controller('movie')
export class MovieController {
  private readonly logger = new Logger(MovieController.name);

  constructor(private readonly movieService: MovieService, private readonly userService: UserService) {
  }

  @Get(':id')
  async getMovieById(@Param('id', ParseIntPipe) movieId: number,
                     @Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }

    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new BadRequestException(`Invalid userId.`);
    }
    this.logger.log(`Retrieved user details from Redis: ${JSON.stringify(user)}`);
    this.logger.log({message: `GET movie by id: ${movieId}`, labels: { 'key': 'value' }});

    const result = await this.movieService.findMovieById(movieId);
    if (!result) {
      this.logger.error(`Movie ${movieId} was not found.`);
      throw new HttpException("Movie does not exist", HttpStatus.NOT_FOUND);
    }

    this.logger.log(`Publish movie viewed event to Kafka with movieId:${movieId}.`);
    await this.movieService.publishMovieViewedEvent({movieId});
    return result;
  }
}
