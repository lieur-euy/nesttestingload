import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly svc: InventoryService) {}

  @Get('stock')
  async getStock(
    @Query('warehouseId') warehouseId: string,
    @Query('productId') productId: string,
  ) {
    return { stock: await this.svc.getStock(warehouseId, productId) };
  }

  @Get('transactions')
  async getHistory(
    @Query('warehouseId') warehouseId: string,
    @Query('productId') productId: string,
    @Query('cursor') cursor?: string,
    @Query('take') take?: string,
  ) {
    return this.svc.getStockHistory(
      warehouseId,
      productId,
      cursor,
      take ? Number(take) : 50,
    );
  }

  @Post('stock')
  async topUpStock(
    @Body() body: { warehouseId: string; productId: string; qty: number },
  ) {
    await this.svc.topUpStock(body.warehouseId, body.productId, body.qty);
    return { ok: true };
  }

  @Get('warehouse/by-outlet/:outletId')
  async getWarehouse(@Param('outletId') outletId: string) {
    return this.svc.getWarehouseByOutlet(outletId);
  }
}
