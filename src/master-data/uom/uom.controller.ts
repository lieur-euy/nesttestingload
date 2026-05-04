import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UomService } from './uom.service';

@Controller('master-data/uoms')
export class UomController {
  constructor(private readonly svc: UomService) {}

  @Post()
  async create(@Body() data: { name: string; symbol: string }) {
    return this.svc.create(data);
  }

  @Get()
  async findAll(
    @Query('cursor') cursor?: string,
    @Query('take') take?: string,
  ) {
    return this.svc.findAll(cursor, take ? Number(take) : 50);
  }
}
