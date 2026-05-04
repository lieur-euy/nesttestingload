import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private cacheKey(id: string) {
    return `product:${id}`;
  }
  private listKey = 'product:list';

  async findAll(cursor?: string, take = 50) {
    return this.redis.getOrSet(
      `${this.listKey}:${cursor ?? ''}:${take}`,
      async () => {
        const data = await this.prisma.product.findMany({
          orderBy: { name: 'asc' },
          take: take + 1,
          include: { category: true, uom: true, supplier: true },
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
      this.prisma.product.findUniqueOrThrow({
        where: { id },
        include: { category: true, uom: true, supplier: true },
      }),
    );
  }

  async create(data: {
    name: string;
    sku: string;
    price: number;
    categoryId?: string;
    uomId?: string;
    supplierId?: string;
  }) {
    const item = await this.prisma.product.create({ data });
    await this.redis.delPattern('product:*');
    return item;
  }

  async update(
    id: string,
    data: {
      name?: string;
      price?: number;
      categoryId?: string;
      uomId?: string;
    },
  ) {
    const item = await this.prisma.product.update({ where: { id }, data });
    await this.redis.delPattern('product:*');
    return item;
  }
}
