import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getStock(warehouseId: string, productId: string): Promise<number> {
    const cacheKey = `stock:${warehouseId}:${productId}`;
    return this.redis.getOrSet(
      cacheKey,
      async () => {
        const last = await this.prisma.inventoryTransaction.findFirst({
          where: { warehouseId, productId },
          orderBy: { createdAt: 'desc' },
        });
        return last?.runningStock ?? 0;
      },
      10,
    );
  }

  async ensureStock(
    tx: Prisma.TransactionClient,
    warehouseId: string,
    productId: string,
    requiredQty: number,
  ): Promise<void> {
    const rows = await tx.$queryRawUnsafe<Array<{ running_stock: number }>>(
      `SELECT running_stock FROM inventory_transactions
       WHERE warehouse_id = $1 AND product_id = $2
       ORDER BY created_at DESC LIMIT 1
       FOR UPDATE`,
      warehouseId,
      productId,
    );
    const currentStock = rows.length > 0 ? Number(rows[0].running_stock) : 0;
    if (currentStock < requiredQty) {
      throw new BadRequestException(
        `Insufficient stock for product ${productId}: have ${currentStock}, need ${requiredQty}`,
      );
    }
  }

  async deductStock(
    tx: Prisma.TransactionClient,
    warehouseId: string,
    productId: string,
    qty: number,
    type: string,
    refId?: string,
  ): Promise<void> {
    const rows = await tx.$queryRawUnsafe<Array<{ running_stock: number }>>(
      `SELECT running_stock FROM inventory_transactions
       WHERE warehouse_id = $1 AND product_id = $2
       ORDER BY created_at DESC LIMIT 1
       FOR UPDATE`,
      warehouseId,
      productId,
    );
    const currentStock = rows.length > 0 ? Number(rows[0].running_stock) : 0;
    await tx.inventoryTransaction.create({
      data: {
        warehouseId,
        productId,
        qty: -qty,
        type,
        refId,
        runningStock: currentStock - qty,
      },
    });
    await this.redis.del(`stock:${warehouseId}:${productId}`);
  }

  async addStock(
    tx: Prisma.TransactionClient,
    warehouseId: string,
    productId: string,
    qty: number,
    type: string,
    refId?: string,
  ): Promise<void> {
    const rows = await tx.$queryRawUnsafe<Array<{ running_stock: number }>>(
      `SELECT running_stock FROM inventory_transactions
       WHERE warehouse_id = $1 AND product_id = $2
       ORDER BY created_at DESC LIMIT 1
       FOR UPDATE`,
      warehouseId,
      productId,
    );
    const currentStock = rows.length > 0 ? Number(rows[0].running_stock) : 0;
    await tx.inventoryTransaction.create({
      data: {
        warehouseId,
        productId,
        qty,
        type,
        refId,
        runningStock: currentStock + qty,
      },
    });
    await this.redis.del(`stock:${warehouseId}:${productId}`);
  }

  async getStockHistory(
    warehouseId: string,
    productId: string,
    cursor?: string,
    take: number = 50,
  ) {
    const data = await this.prisma.inventoryTransaction.findMany({
      where: { warehouseId, productId },
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    const hasMore = data.length > take;
    if (hasMore) data.pop();
    return {
      data,
      nextCursor: hasMore ? data[data.length - 1].id : null,
    };
  }

  async getWarehouseByOutlet(outletId: string) {
    const cacheKey = `warehouse:outlet:${outletId}`;
    return this.redis.getOrSet(cacheKey, () =>
      this.prisma.warehouse.findUniqueOrThrow({
        where: { outletId },
        include: { outlet: true },
      }),
    );
  }
}
