import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { SalesQueryDto } from './dto/sales-query.dto';

@Controller('sales')
export class SalesController {
  constructor(private readonly sales: SalesService) {}

  @Post()
  async create(@Body() dto: CreateSalesOrderDto) {
    return this.sales.createOrder(dto);
  }

  @Get()
  async findAll(@Query() query: SalesQueryDto) {
    return this.sales.findAll(query.cursor, query.take);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.sales.findOne(id);
  }
}
