import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PaymentMethodService } from './payment-method.service';

@Controller('master-data/payment-methods')
export class PaymentMethodController {
  constructor(private readonly svc: PaymentMethodService) {}

  @Post()
  async create(@Body() data: { code: string; name: string }) {
    return this.svc.create(data);
  }

  @Get()
  async findAll(
    @Query('cursor') cursor?: string,
    @Query('take') take?: string,
  ) {
    return this.svc.findAll(cursor, take ? Number(take) : 50);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }
}
