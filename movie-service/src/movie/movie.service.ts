import {HttpException, Injectable, Logger} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {ConfigService} from "@nestjs/config";
import {AxiosError} from "axios";

@Injectable()
export class MovieService {
  private readonly logger = new Logger(MovieService.name);
  private readonly actorServiceUrl: string;

  constructor(private readonly prismaService: PrismaService,
              private readonly http: HttpService,
              private readonly configService: ConfigService) {
    this.actorServiceUrl = this.configService.getOrThrow("ACTOR_SERVICE_URL");
    if (!this.actorServiceUrl.startsWith('http://')) {
      throw new Error(
          `Invalid ACTOR_SERVICE_URL "${this.actorServiceUrl}". It must start with "http://".`,
      );
    }
  }

  async findMovieById(id: number) {
    this.logger.log(`Fetch movie ${id} from DB`);

    const movie = await this.prismaService.movie.findUnique({
      where: {id}
    });
    if (!movie) {
      return null;
    }

    const actors = new Array<Actor>();

    for (const actorId of movie.actorIds) {
      actors.push(await this.findActorById(actorId) as Actor);
    }

    return {
      movie,
      actors
    }
  }

  private async findActorById(id: number) {
    const url = `${this.actorServiceUrl}/actor/${id}`;
    this.logger.log(`Fetch actor ${id} from actor-service using url: ${url}`);
    // vibe-coded
    try {
      const response = await firstValueFrom(this.http.get(url));
      return response.data;
    } catch (error) {
      const err = error as AxiosError;

      // Log useful details
      this.logger.error(
          `Error calling actor-service at ${url}: ${err.message}`,
          err.stack,
      );

      // If the other service returned an HTTP error, forward something meaningful
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data as any;

        throw new HttpException(
            data?.message || `Actor service error (${status})`,
            status,
        );
      }

      // Network / timeout / unknown error
      throw new HttpException(
          'Actor service is unavailable',
          503, // Service Unavailable
      );
    }
  }
}
