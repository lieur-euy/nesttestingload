import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CustomerService } from './customer.service';

@Controller('master-data/customers')
export class CustomerController {
  constructor(private readonly svc: CustomerService) {}

  @Post()
  async create(
    @Body()
    data: {
      code: string;
      name: string;
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
