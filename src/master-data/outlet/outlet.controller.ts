import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Query,
} from '@nestjs/common';
import { OutletService } from './outlet.service';

@Controller('master-data/outlets')
export class OutletController {
  constructor(private readonly svc: OutletService) {}

  @Post()
  async create(
    @Body()
    data: {
      code: string;
      name: string;
      address?: string;
      phone?: string;
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
    @Body() data: { name?: string; address?: string; phone?: string },
  ) {
    return this.svc.update(id, data);
  }
}
