import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { SupplierService } from './supplier.service';

@Controller('master-data/suppliers')
export class SupplierController {
  constructor(private readonly svc: SupplierService) {}

  @Post()
  async create(
    @Body()
    data: {
      code: string;
      name: string;
      contact?: string;
      phone?: string;
      email?: string;
    },
  ) {
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
