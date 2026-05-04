import { Controller, Get, Param, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly svc: PaymentService) {}

  @Get()
  async findAll(
    @Query('cursor') cursor?: string,
    @Query('take') take?: string,
  ) {
    return this.svc.findAll(cursor, take ? Number(take) : 50);
  }

  @Get('by-sales-order/:salesOrderId')
  async findBySalesOrder(@Param('salesOrderId') id: string) {
    return this.svc.findBySalesOrder(id);
  }
}
