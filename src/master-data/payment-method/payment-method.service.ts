import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class PaymentMethodService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private cacheKey(id: string) {
    return `payment-method:${id}`;
  }
  private listKey = 'payment-method:list';

  async findAll(cursor?: string, take = 50) {
    return this.redis.getOrSet(
      `${this.listKey}:${cursor ?? ''}:${take}`,
      async () => {
        const data = await this.prisma.paymentMethod.findMany({
          orderBy: { name: 'asc' },
          take: take + 1,
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        });
        const hasMore = data.length > take;
        if (hasMore) data.pop();
        return { data, nextCursor: hasMore ? data[data.length - 1].id : null };
      },
      120,
    );
  }

  async findOne(id: string) {
    return this.redis.getOrSet(this.cacheKey(id), () =>
      this.prisma.paymentMethod.findUniqueOrThrow({ where: { id } }),
    );
  }

  async create(data: { code: string; name: string }) {
    const item = await this.prisma.paymentMethod.create({ data });
    await this.redis.delPattern('payment-method:*');
    return item;
  }
}
