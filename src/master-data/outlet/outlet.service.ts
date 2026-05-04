import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class OutletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private cacheKey(id: string) {
    return `outlet:${id}`;
  }
  private listCacheKey = 'outlet:list';

  async findAll(cursor?: string, take = 50) {
    return this.redis.getOrSet(
      `${this.listCacheKey}:${cursor ?? ''}:${take}`,
      async () => {
        const data = await this.prisma.outlet.findMany({
          orderBy: { createdAt: 'desc' },
          take: take + 1,
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        });
        const hasMore = data.length > take;
        if (hasMore) data.pop();
        return { data, nextCursor: hasMore ? data[data.length - 1].id : null };
      },
      30,
    );
  }

  async findOne(id: string) {
    return this.redis.getOrSet(this.cacheKey(id), () =>
      this.prisma.outlet.findUniqueOrThrow({ where: { id } }),
    );
  }

  async create(data: {
    code: string;
    name: string;
    address?: string;
    phone?: string;
  }) {
    const outlet = await this.prisma.outlet.create({ data });
    await this.redis.delPattern('outlet:*');
    return outlet;
  }

  async update(
    id: string,
    data: { name?: string; address?: string; phone?: string },
  ) {
    const outlet = await this.prisma.outlet.update({ where: { id }, data });
    await this.redis.delPattern('outlet:*');
    return outlet;
  }
}
