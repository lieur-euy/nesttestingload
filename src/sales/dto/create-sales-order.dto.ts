import {
  IsString,
  IsArray,
  IsInt,
  Min,
  ArrayMinSize,
  ValidateNested,
  IsOptional,
} from 'class-validator';

export class SalesOrderItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  qty: number;
}

export class CreateSalesOrderDto {
  @IsString()
  outletId: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsString()
  methodId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  items: SalesOrderItemDto[];
}
