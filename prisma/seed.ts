import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  console.log('Seeding master data...');

  // --- UOMs ---
  const uomPcs = await prisma.uom.create({ data: { name: 'Pieces', symbol: 'pcs' } });
  const uomKg = await prisma.uom.create({ data: { name: 'Kilogram', symbol: 'kg' } });
  const uomGr = await prisma.uom.create({ data: { name: 'Gram', symbol: 'g' } });
  const uomLtr = await prisma.uom.create({ data: { name: 'Liter', symbol: 'L' } });
  const uomMl = await prisma.uom.create({ data: { name: 'Milliliter', symbol: 'ml' } });

  // --- Product Categories ---
  const catBeverage = await prisma.productCategory.create({ data: { name: 'Beverages' } });
  const catFood = await prisma.productCategory.create({ data: { name: 'Food' } });
  const catIngredient = await prisma.productCategory.create({ data: { name: 'Raw Ingredients' } });
  const catSnack = await prisma.productCategory.create({ data: { name: 'Snacks' } });
  const catPacking = await prisma.productCategory.create({ data: { name: 'Packaging' } });

  // --- Payment Methods ---
  await prisma.paymentMethod.create({ data: { code: 'CASH', name: 'Cash' } });
  await prisma.paymentMethod.create({ data: { code: 'CARD', name: 'Debit/Credit Card' } });
  await prisma.paymentMethod.create({ data: { code: 'QRIS', name: 'QRIS' } });
  await prisma.paymentMethod.create({ data: { code: 'GOPAY', name: 'GoPay' } });
  await prisma.paymentMethod.create({ data: { code: 'OVO', name: 'OVO' } });

  // --- Suppliers ---
  const supIndofood = await prisma.supplier.create({
    data: { code: 'SUP-001', name: 'PT Indofood Sukses Makmur', contact: 'Budi', phone: '021-12345678' },
  });
  const supUnilever = await prisma.supplier.create({
    data: { code: 'SUP-002', name: 'PT Unilever Indonesia', contact: 'Ani', phone: '021-87654321' },
  });
  const supLocal = await prisma.supplier.create({
    data: { code: 'SUP-003', name: 'Pemasok Lokal', contact: 'Cahyo', phone: '0812-34567890' },
  });

  // --- Customers ---
  await prisma.customer.create({ data: { code: 'CUST-001', name: 'Walk-in Customer' } });
  await prisma.customer.create({
    data: { code: 'CUST-002', name: 'PT Makmur Jaya', phone: '0811-222333', email: 'info@makmurjaya.com' },
  });
  await prisma.customer.create({
    data: { code: 'CUST-003', name: 'Toko Sejahtera', phone: '0813-444555', email: 'sejahtera@email.com' },
  });
  await prisma.customer.create({
    data: { code: 'CUST-004', name: 'Restoran Enak Rasa', phone: '021-9998877' },
  });

  // --- Products (raw ingredients) ---
  const productCoffeeBeans = await prisma.product.create({
    data: { name: 'Coffee Beans Arabica', sku: 'ING-001', price: 50000, categoryId: catIngredient.id, uomId: uomKg.id, supplierId: supIndofood.id },
  });
  const productMilk = await prisma.product.create({
    data: { name: 'Fresh Milk', sku: 'ING-002', price: 15000, categoryId: catIngredient.id, uomId: uomLtr.id, supplierId: supUnilever.id },
  });
  const productSugar = await prisma.product.create({
    data: { name: 'Granulated Sugar', sku: 'ING-003', price: 12000, categoryId: catIngredient.id, uomId: uomKg.id, supplierId: supLocal.id },
  });
  const productFlour = await prisma.product.create({
    data: { name: 'Wheat Flour', sku: 'ING-004', price: 10000, categoryId: catIngredient.id, uomId: uomKg.id, supplierId: supIndofood.id },
  });
  const productEgg = await prisma.product.create({
    data: { name: 'Egg', sku: 'ING-005', price: 2000, categoryId: catIngredient.id, uomId: uomPcs.id, supplierId: supLocal.id },
  });
  const productButter = await prisma.product.create({
    data: { name: 'Butter', sku: 'ING-006', price: 25000, categoryId: catIngredient.id, uomId: uomKg.id, supplierId: supUnilever.id },
  });
  const productSyrup = await prisma.product.create({
    data: { name: 'Caramel Syrup', sku: 'ING-007', price: 35000, categoryId: catIngredient.id, uomId: uomLtr.id, supplierId: supLocal.id },
  });
  const productIce = await prisma.product.create({
    data: { name: 'Ice Cube', sku: 'ING-008', price: 2000, categoryId: catIngredient.id, uomId: uomKg.id, supplierId: supLocal.id },
  });
  const productTea = await prisma.product.create({
    data: { name: 'Tea Bag', sku: 'ING-009', price: 500, categoryId: catIngredient.id, uomId: uomPcs.id, supplierId: supIndofood.id },
  });
  const productChicken = await prisma.product.create({
    data: { name: 'Chicken Meat', sku: 'ING-010', price: 30000, categoryId: catIngredient.id, uomId: uomKg.id, supplierId: supLocal.id },
  });
  const productRice = await prisma.product.create({
    data: { name: 'Rice', sku: 'ING-011', price: 12000, categoryId: catIngredient.id, uomId: uomKg.id, supplierId: supLocal.id },
  });
  const productOil = await prisma.product.create({
    data: { name: 'Cooking Oil', sku: 'ING-012', price: 14000, categoryId: catIngredient.id, uomId: uomLtr.id, supplierId: supIndofood.id },
  });
  const productSalt = await prisma.product.create({
    data: { name: 'Salt', sku: 'ING-013', price: 5000, categoryId: catIngredient.id, uomId: uomKg.id, supplierId: supLocal.id },
  });
  const productSpice = await prisma.product.create({
    data: { name: 'Mixed Spices', sku: 'ING-014', price: 8000, categoryId: catIngredient.id, uomId: uomKg.id, supplierId: supLocal.id },
  });
  const productBread = await prisma.product.create({
    data: { name: 'Bread Slice', sku: 'ING-015', price: 15000, categoryId: catIngredient.id, uomId: uomPcs.id, supplierId: supIndofood.id },
  });
  const productCheese = await prisma.product.create({
    data: { name: 'Cheese Slice', sku: 'ING-016', price: 2000, categoryId: catIngredient.id, uomId: uomPcs.id, supplierId: supUnilever.id },
  });
  const productChoco = await prisma.product.create({
    data: { name: 'Chocolate Paste', sku: 'ING-017', price: 40000, categoryId: catIngredient.id, uomId: uomKg.id, supplierId: supIndofood.id },
  });

  // --- Finished goods ---
  const productKopiSusu = await prisma.product.create({
    data: { name: 'Kopi Susu', sku: 'FG-001', price: 25000, categoryId: catBeverage.id, uomId: uomPcs.id },
  });
  const productKopiHitam = await prisma.product.create({
    data: { name: 'Kopi Hitam', sku: 'FG-002', price: 15000, categoryId: catBeverage.id, uomId: uomPcs.id },
  });
  const productTehManis = await prisma.product.create({
    data: { name: 'Teh Manis', sku: 'FG-003', price: 10000, categoryId: catBeverage.id, uomId: uomPcs.id },
  });
  const productNasiGoreng = await prisma.product.create({
    data: { name: 'Nasi Goreng', sku: 'FG-004', price: 30000, categoryId: catFood.id, uomId: uomPcs.id },
  });
  const productAyamGoreng = await prisma.product.create({
    data: { name: 'Ayam Goreng', sku: 'FG-005', price: 25000, categoryId: catFood.id, uomId: uomPcs.id },
  });
  const productRotiBakar = await prisma.product.create({
    data: { name: 'Roti Bakar', sku: 'FG-006', price: 15000, categoryId: catFood.id, uomId: uomPcs.id },
  });
  const productFrenchFries = await prisma.product.create({
    data: { name: 'French Fries', sku: 'FG-007', price: 18000, categoryId: catSnack.id, uomId: uomPcs.id },
  });
  const productIceCream = await prisma.product.create({
    data: { name: 'Ice Cream Sundae', sku: 'FG-008', price: 20000, categoryId: catSnack.id, uomId: uomPcs.id },
  });

  // --- Outlets ---
  const outlet1 = await prisma.outlet.create({
    data: { code: 'OUT-001', name: 'Cabang Utama', address: 'Jl. Sudirman No. 1, Jakarta', phone: '021-1111111' },
  });
  const outlet2 = await prisma.outlet.create({
    data: { code: 'OUT-002', name: 'Cabang Kedua', address: 'Jl. Thamrin No. 10, Jakarta', phone: '021-2222222' },
  });
  const outlet3 = await prisma.outlet.create({
    data: { code: 'OUT-003', name: 'Cabang Mangga Dua', address: 'Jl. Mangga Dua Raya, Jakarta', phone: '021-3333333' },
  });

  // --- Warehouses (one per outlet) ---
  const wh1 = await prisma.warehouse.create({ data: { outletId: outlet1.id, name: 'Gudang Utama' } });
  const wh2 = await prisma.warehouse.create({ data: { outletId: outlet2.id, name: 'Gudang Kedua' } });
  const wh3 = await prisma.warehouse.create({ data: { outletId: outlet3.id, name: 'Gudang Mangga Dua' } });

  // --- BOMs for outlet 1 ---
  async function createBom(outletId: string, productId: string, ingredients: Array<{ productId: string; qty: number }>) {
    const bom = await prisma.bomOutlet.create({ data: { outletId, productId, qty: 1 } });
    await prisma.bomIngredient.createMany({
      data: ingredients.map((i) => ({ bomOutletId: bom.id, productId: i.productId, qty: i.qty })),
    });
  }

  await createBom(outlet1.id, productKopiSusu.id, [
    { productId: productCoffeeBeans.id, qty: 1 },
    { productId: productMilk.id, qty: 1 },
    { productId: productSugar.id, qty: 2 },
    { productId: productIce.id, qty: 1 },
  ]);
  await createBom(outlet1.id, productKopiHitam.id, [
    { productId: productCoffeeBeans.id, qty: 1 },
    { productId: productSugar.id, qty: 1 },
  ]);
  await createBom(outlet1.id, productTehManis.id, [
    { productId: productTea.id, qty: 1 },
    { productId: productSugar.id, qty: 2 },
    { productId: productIce.id, qty: 1 },
  ]);
  await createBom(outlet1.id, productNasiGoreng.id, [
    { productId: productRice.id, qty: 1 },
    { productId: productEgg.id, qty: 2 },
    { productId: productOil.id, qty: 1 },
    { productId: productSalt.id, qty: 1 },
    { productId: productSpice.id, qty: 1 },
    { productId: productChicken.id, qty: 1 },
  ]);
  await createBom(outlet1.id, productAyamGoreng.id, [
    { productId: productChicken.id, qty: 1 },
    { productId: productOil.id, qty: 1 },
    { productId: productSalt.id, qty: 1 },
    { productId: productSpice.id, qty: 1 },
  ]);
  await createBom(outlet1.id, productRotiBakar.id, [
    { productId: productBread.id, qty: 2 },
    { productId: productButter.id, qty: 1 },
    { productId: productCheese.id, qty: 1 },
    { productId: productChoco.id, qty: 1 },
  ]);
  await createBom(outlet1.id, productFrenchFries.id, [
    { productId: productOil.id, qty: 1 },
    { productId: productSalt.id, qty: 1 },
  ]);
  await createBom(outlet1.id, productIceCream.id, [
    { productId: productMilk.id, qty: 1 },
    { productId: productSugar.id, qty: 2 },
    { productId: productChoco.id, qty: 1 },
  ]);

  // Copy BOMs to outlets 2 and 3
  for (const bom of await prisma.bomOutlet.findMany({ where: { outletId: outlet1.id }, include: { ingredients: true } })) {
    await createBom(outlet2.id, bom.productId, bom.ingredients.map((i) => ({ productId: i.productId, qty: i.qty })));
    await createBom(outlet3.id, bom.productId, bom.ingredients.map((i) => ({ productId: i.productId, qty: i.qty })));
  }

  // --- Initial stock ---
  async function seedStock(whId: string, productId: string, qty: number) {
    const last = await prisma.inventoryTransaction.findFirst({
      where: { warehouseId: whId, productId },
      orderBy: { createdAt: 'desc' },
    });
    const running = (last?.runningStock ?? 0) + qty;
    await prisma.inventoryTransaction.create({
      data: { warehouseId: whId, productId, qty, type: 'INITIAL', runningStock: running },
    });
  }

  const initialStock: Array<[string, number]> = [
    [productCoffeeBeans.id, 500], [productMilk.id, 200], [productSugar.id, 1000],
    [productIce.id, 500], [productTea.id, 1000], [productRice.id, 300],
    [productEgg.id, 600], [productOil.id, 200], [productSalt.id, 200],
    [productSpice.id, 200], [productChicken.id, 200], [productFlour.id, 200],
    [productButter.id, 100], [productSyrup.id, 100], [productBread.id, 300],
    [productCheese.id, 500], [productChoco.id, 100],
  ];

  for (const [pid, qty] of initialStock) {
    await seedStock(wh1.id, pid, qty);
  }
  for (const wh of [wh2, wh3]) {
    for (const [pid, qty] of initialStock) {
      await seedStock(wh.id, pid, Math.floor(qty * 0.4));
    }
  }

  console.log('Seed completed successfully!');
  console.log(`  Outlets: 3`);
  console.log(`  Warehouses: 3`);
  console.log(`  Products: ${await prisma.product.count()}`);
  console.log(`  Product Categories: 5`);
  console.log(`  UOMs: 5`);
  console.log(`  Suppliers: 3`);
  console.log(`  Customers: 4`);
  console.log(`  Payment Methods: 5`);
  console.log(`  BOMs: ${await prisma.bomOutlet.count()}`);
  console.log(`  BOM Ingredients: ${await prisma.bomIngredient.count()}`);
  console.log(`  Inventory Transactions: ${await prisma.inventoryTransaction.count()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
