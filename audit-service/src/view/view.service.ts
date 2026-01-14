import {Injectable, Logger} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";

@Injectable()
export class ViewService {
  private readonly logger = new Logger(ViewService.name);

  constructor(private readonly prismaService: PrismaService) {
  }

  async incrementViewsForMovie(movieId: number) {
    this.logger.log(`Increment view count of movie: ${movieId}`);

    await this.prismaService.views.update({
      where: {
        movieId
      },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  }
}
