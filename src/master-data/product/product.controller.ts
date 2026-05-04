import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('master-data/products')
export class ProductController {
  constructor(private readonly svc: ProductService) {}

  @Post()
  async create(
    @Body()
    data: {
      name: string;
      sku: string;
      price: number;
      categoryId?: string;
      uomId?: string;
      supplierId?: string;
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

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    data: {
      name?: string;
      price?: number;
      categoryId?: string;
      uomId?: string;
    },
  ) {
    return this.svc.update(id, data);
  }
}
