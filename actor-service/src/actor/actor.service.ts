import {Injectable, Logger} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";

@Injectable()
export class ActorService {
  private readonly logger = new Logger(ActorService.name);

  constructor(private readonly prismaService: PrismaService) {
  }

  async findActorById(id: number) {
    this.logger.log(`Fetch actor ${id} from DB`);
    return this.prismaService.actor.findUnique({
      where: {id}
    });
  }
}
