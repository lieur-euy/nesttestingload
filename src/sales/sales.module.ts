import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { InventoryModule } from '../inventory/inventory.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [InventoryModule, PaymentModule],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
