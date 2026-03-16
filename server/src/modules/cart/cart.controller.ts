import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CartService } from './cart.service';
import { IsString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';

class AddToCartDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;
}

class UpdateCartDto {
  @IsNumber()
  quantity: number;
}

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':userId')
  async getCart(@Param('userId') userId: string) {
    console.log('[CartController] getCart:', userId);
    return this.cartService.getCartByUserId(userId);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async addToCart(@Body() addToCartDto: AddToCartDto) {
    console.log('[CartController] addToCart:', addToCartDto);
    return this.cartService.addToCart(addToCartDto);
  }

  @Put(':id')
  async updateCartItem(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    console.log('[CartController] updateCartItem:', id, updateCartDto);
    return this.cartService.updateCartItem(id, updateCartDto.quantity);
  }

  @Delete(':id')
  async removeFromCart(@Param('id') id: string, @Query('userId') userId: string) {
    console.log('[CartController] removeFromCart:', id, userId);
    return this.cartService.removeFromCart(id, userId);
  }

  @Delete('clear/:userId')
  async clearCart(@Param('userId') userId: string) {
    console.log('[CartController] clearCart:', userId);
    return this.cartService.clearCart(userId);
  }

  @Post('check-invalid/:userId')
  @HttpCode(HttpStatus.OK)
  async checkInvalidItems(@Param('userId') userId: string) {
    console.log('[CartController] checkInvalidItems:', userId);
    return this.cartService.checkAndUpdateInvalidItems(userId);
  }
}
