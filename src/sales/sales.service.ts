import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { InventoryService } from '../inventory/inventory.service';
import { PaymentService } from '../payment/payment.service';
import { AuditService } from '../audit/audit.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly inventory: InventoryService,
    private readonly payment: PaymentService,
    private readonly audit: AuditService,
  ) {}

  async createOrder(dto: CreateSalesOrderDto) {
    const productIds = [...new Set(dto.items.map((i) => i.productId))];

    const bomCacheKeys = productIds.map((pid) => `bom:${dto.outletId}:${pid}`);

    return this.prisma.$transaction(async (tx) => {
      const warehouse = await tx.warehouse.findUniqueOrThrow({
        where: { outletId: dto.outletId },
      });

      const bomOutlets = await tx.bomOutlet.findMany({
        where: { productId: { in: productIds }, outletId: dto.outletId },
        include: { ingredients: true },
      });

      if (bomOutlets.length !== productIds.length) {
        throw new Error('BOM not found for one or more products');
      }

      const ingredientMap = new Map<string, number>();
      const ingredientProductIds = new Set<string>();

      for (const item of dto.items) {
        const bom = bomOutlets.find((b) => b.productId === item.productId);
        if (!bom)
          throw new Error(`BOM not found for product ${item.productId}`);
        for (const ing of bom.ingredients) {
          const total = ing.qty * item.qty;
          ingredientMap.set(
            ing.productId,
            (ingredientMap.get(ing.productId) ?? 0) + total,
          );
          ingredientProductIds.add(ing.productId);
        }
      }

      const cachePipeline = this.redis['client']?.pipeline();
      const products = await tx.product.findMany({
        where: { id: { in: [...ingredientProductIds] } },
      });
      const priceMap = new Map(products.map((p) => [p.id, p.price]));

      for (const [productId, neededQty] of ingredientMap) {
        await this.inventory.ensureStock(
          tx,
          warehouse.id,
          productId,
          neededQty,
        );
      }

      let totalAmt = 0;
      for (const item of dto.items) {
        const bom = bomOutlets.find((b) => b.productId === item.productId)!;
        for (const ing of bom.ingredients) {
          const unitPrice = priceMap.get(ing.productId) ?? 0;
          totalAmt += unitPrice * ing.qty * item.qty;
        }
      }

      const salesOrder = await tx.salesOrder.create({
        data: {
          outletId: dto.outletId,
          customerId: dto.customerId,
          totalAmt,
          items: {
            createMany: {
              data: dto.items.map((item) => ({
                productId: item.productId,
                qty: item.qty,
                price: 0,
              })),
            },
          },
        },
        include: { items: true },
      });

      for (const [productId, neededQty] of ingredientMap) {
        await this.inventory.deductStock(
          tx,
          warehouse.id,
          productId,
          neededQty,
          'SALES_OUT',
          salesOrder.id,
        );
      }

      await this.payment.createPayment(tx, {
        salesOrderId: salesOrder.id,
        methodId: dto.methodId,
        amount: totalAmt,
        status: 'PAID',
      });

      await this.audit.log('SALES_CREATE', 'SalesOrder', salesOrder.id, {
        outletId: dto.outletId,
        totalAmt,
        itemCount: dto.items.length,
      });

      await this.redis.del(`sales:list:*`);

      return salesOrder;
    });
  }

  async findAll(cursor?: string, take: number = 50) {
    const cacheKey = `sales:list:${cursor ?? ''}:${take}`;
    return this.redis.getOrSet(
      cacheKey,
      async () => {
        const data = await this.prisma.salesOrder.findMany({
          orderBy: { createdAt: 'desc' },
          take: take + 1,
          include: {
            items: true,
            payment: { include: { paymentMethod: true } },
          },
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
    const cacheKey = `sales:${id}`;
    return this.redis.getOrSet(cacheKey, () =>
      this.prisma.salesOrder.findUniqueOrThrow({
        where: { id },
        include: { items: true, payment: { include: { paymentMethod: true } } },
      }),
    );
  }
}
