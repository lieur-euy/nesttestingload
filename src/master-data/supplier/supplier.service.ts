import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class SupplierService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private cacheKey(id: string) {
    return `supplier:${id}`;
  }
  private listKey = 'supplier:list';

  async findAll(cursor?: string, take = 50) {
    return this.redis.getOrSet(
      `${this.listKey}:${cursor ?? ''}:${take}`,
      async () => {
        const data = await this.prisma.supplier.findMany({
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

  async findOne(id: string) {
    return this.redis.getOrSet(this.cacheKey(id), () =>
      this.prisma.supplier.findUniqueOrThrow({ where: { id } }),
    );
  }

  async create(data: {
    code: string;
    name: string;
    contact?: string;
    phone?: string;
    email?: string;
  }) {
    const item = await this.prisma.supplier.create({ data });
    await this.redis.delPattern('supplier:*');
    return item;
  }
}
