import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(config: ConfigService) {
    this.client = new Redis({
      host: config.get('REDIS_HOST', 'localhost'),
      port: config.get('REDIS_PORT', 6379),
      lazyConnect: true,
    });
    this.client.connect().catch(() => {});
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSec?: number): Promise<void> {
    if (ttlSec) {
      await this.client.set(key, value, 'EX', ttlSec);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const stream = this.client.scanStream({ match: pattern, count: 100 });
    for await (const keys of stream) {
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    }
  }

  async getOrSet<T>(
    key: string,
    fetch: () => Promise<T>,
    ttlSec: number = 60,
  ): Promise<T> {
    const cached = await this.get(key);
    if (cached) return JSON.parse(cached) as T;
    const value = await fetch();
    await this.set(key, JSON.stringify(value), ttlSec);
    return value;
  }

  async acquireLock(lockKey: string, ttlSec: number = 5): Promise<boolean> {
    const result = await this.client.set(lockKey, '1', 'EX', ttlSec, 'NX');
    return result === 'OK';
  }

  async releaseLock(lockKey: string): Promise<void> {
    await this.client.del(lockKey);
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
