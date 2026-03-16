import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { UsersModule } from '@/modules/users/users.module';
import { ProductsModule } from '@/modules/products/products.module';
import { CartModule } from '@/modules/cart/cart.module';
import { OrdersModule } from '@/modules/orders/orders.module';
import { AddressesModule } from '@/modules/addresses/addresses.module';
import { UploadModule } from '@/modules/upload/upload.module';

@Module({
  imports: [
    UsersModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    AddressesModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
