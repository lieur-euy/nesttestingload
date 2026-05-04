import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuditModule } from './audit/audit.module';
import { InventoryModule } from './inventory/inventory.module';
import { PaymentModule } from './payment/payment.module';
import { SalesModule } from './sales/sales.module';
import { MasterDataModule } from './master-data/master-data.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    AuditModule,
    MasterDataModule,
    InventoryModule,
    PaymentModule,
    SalesModule,
  ],
})
export class AppModule {}
