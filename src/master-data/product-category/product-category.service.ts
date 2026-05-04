import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class ProductCategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private key = 'product-category';

  async findAll(cursor?: string, take = 50) {
    return this.redis.getOrSet(
      `${this.key}:list:${cursor ?? ''}:${take}`,
      async () => {
        const data = await this.prisma.productCategory.findMany({
          orderBy: { name: 'asc' },
          take: take + 1,
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        });
        const hasMore = data.length > take;
        if (hasMore) data.pop();
        return { data, nextCursor: hasMore ? data[data.length - 1].id : null };
      },
      60,
    );
  }

  async create(data: { name: string }) {
    const item = await this.prisma.productCategory.create({ data });
    await this.redis.delPattern(`${this.key}:*`);
    return item;
  }
}
