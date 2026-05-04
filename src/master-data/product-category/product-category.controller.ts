import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ProductCategoryService } from './product-category.service';

@Controller('master-data/product-categories')
export class ProductCategoryController {
  constructor(private readonly svc: ProductCategoryService) {}

  @Post()
  async create(@Body() data: { name: string }) {
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
