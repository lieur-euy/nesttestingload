import { Module } from '@nestjs/common';
import { OutletModule } from './outlet/outlet.module';
import { ProductCategoryModule } from './product-category/product-category.module';
import { UomModule } from './uom/uom.module';
import { SupplierModule } from './supplier/supplier.module';
import { CustomerModule } from './customer/customer.module';
import { PaymentMethodModule } from './payment-method/payment-method.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    OutletModule,
    ProductCategoryModule,
    UomModule,
    SupplierModule,
    CustomerModule,
    PaymentMethodModule,
    ProductModule,
  ],
})
export class MasterDataModule {}
