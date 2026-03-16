import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { IsString, IsOptional, IsNotEmpty, IsNumber, IsArray } from 'class-validator';

class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  addressId: string;

  @IsArray()
  cartItemIds: string[];

  @IsOptional()
  @IsString()
  remark?: string;
}

class UpdateOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string;

  @IsOptional()
  @IsString()
  logisticsCompany?: string;

  @IsOptional()
  @IsString()
  logisticsNo?: string;
}

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('user/:userId')
  async getUserOrders(
    @Param('userId') userId: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    console.log('[OrdersController] getUserOrders:', userId, status);
    return this.ordersService.getOrdersByUserId(userId, status, page, pageSize);
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    console.log('[OrdersController] getOrder:', id);
    return this.ordersService.getOrderById(id);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    console.log('[OrdersController] createOrder:', createOrderDto);
    return this.ordersService.createOrder(createOrderDto);
  }

  @Put(':id/status')
  async updateOrderStatus(@Param('id') id: string, @Body() updateDto: UpdateOrderStatusDto) {
    console.log('[OrdersController] updateOrderStatus:', id, updateDto);
    return this.ordersService.updateOrderStatus(id, updateDto);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelOrder(@Param('id') id: string, @Body() body: { userId: string }) {
    console.log('[OrdersController] cancelOrder:', id, body.userId);
    return this.ordersService.cancelOrder(id, body.userId);
  }

  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmReceive(@Param('id') id: string, @Body() body: { userId: string }) {
    console.log('[OrdersController] confirmReceive:', id, body.userId);
    return this.ordersService.confirmReceive(id, body.userId);
  }
}
