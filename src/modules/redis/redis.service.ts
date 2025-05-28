// redis.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit {
  private publisher: RedisClientType;
  private subscriber: RedisClientType;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');

    this.publisher = createClient({ url: redisUrl });
    this.subscriber = createClient({ url: redisUrl });

    await this.publisher.connect();
    await this.subscriber.connect();
  }

  getPublisher() {
    return this.publisher;
  }

  getSubscriber() {
    return this.subscriber;
  }
}
