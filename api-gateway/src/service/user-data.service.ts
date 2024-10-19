import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UserDataService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('USER_SERVICE') private readonly clientUserService: ClientProxy,
  ) {}

  async getUserName(userId: string): Promise<string> {
    const cacheKey = `user:${userId}:name`;
    let userName = await this.cacheManager.get<string>(cacheKey);

    if (!userName) {
      try {
        const response = await firstValueFrom(
          this.clientUserService.send({ cmd: 'fetchUser' }, { userId }),
        );

        if (response && response.name) {
          userName = response.name;
          await this.cacheManager.set(cacheKey, userName, 3600000); // TTL in milliseconds (1 hour)
        } else {
          userName = 'Unknown User';
        }
      } catch (error) {
        console.error(`Failed to fetch user name for ID ${userId}:`, error);
        userName = 'Unknown User';
      }
    }

    return userName;
  }
}
