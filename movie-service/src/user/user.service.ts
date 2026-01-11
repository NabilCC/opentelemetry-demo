import {Inject, Injectable, Logger} from '@nestjs/common';
import Redis from 'ioredis';

export interface User {
  id: string;
  email: string;
  name: string;
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
      @Inject('REDIS_CLIENT')
      private readonly redis: Redis,
  ) {}

  async getUserById(id: string): Promise<User | null> {
    this.logger.log(`Fetching user ${id} from Redis cache.`);
    const data = await this.redis.get(`user:${id}`);
    if (!data)
      this.logger.warn(`User ${id} does not exist in the Redis cache.`);
    return data ? JSON.parse(data) : null;
  }
}
