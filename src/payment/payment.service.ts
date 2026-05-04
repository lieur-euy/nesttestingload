import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async createPayment(
    tx: Prisma.TransactionClient,
    data: {
      salesOrderId: string;
      methodId: string;
      amount: number;
      status: string;
    },
  ) {
    return tx.payment.create({ data });
  }

  async findBySalesOrder(salesOrderId: string) {
    const cacheKey = `payment:so:${salesOrderId}`;
    return this.redis.getOrSet(cacheKey, () =>
      this.prisma.payment.findUnique({
        where: { salesOrderId },
        include: { paymentMethod: true },
      }),
    );
  }

  async findAll(cursor?: string, take = 50) {
    const cacheKey = `payment:list:${cursor ?? ''}:${take}`;
    return this.redis.getOrSet(
      cacheKey,
      async () => {
        const data = await this.prisma.payment.findMany({
          orderBy: { createdAt: 'desc' },
          take: take + 1,
          include: { paymentMethod: true },
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        });
        const hasMore = data.length > take;
        if (hasMore) data.pop();
        return { data, nextCursor: hasMore ? data[data.length - 1].id : null };
      },
      30,
    );
  }
}
