import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { IsString, IsOptional, IsNotEmpty, IsBoolean } from 'class-validator';

class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  receiverName: string;

  @IsString()
  @IsNotEmpty()
  receiverPhone: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsString()
  @IsNotEmpty()
  detailAddress: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get('user/:userId')
  async getUserAddresses(@Param('userId') userId: string) {
    console.log('[AddressesController] getUserAddresses:', userId);
    return this.addressesService.getAddressesByUserId(userId);
  }

  @Get(':id')
  async getAddress(@Param('id') id: string) {
    console.log('[AddressesController] getAddress:', id);
    return this.addressesService.getAddressById(id);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createAddress(@Body() createAddressDto: CreateAddressDto) {
    console.log('[AddressesController] createAddress:', createAddressDto);
    return this.addressesService.createAddress(createAddressDto);
  }

  @Put(':id')
  async updateAddress(@Param('id') id: string, @Body() updateData: any) {
    console.log('[AddressesController] updateAddress:', id, updateData);
    return this.addressesService.updateAddress(id, updateData);
  }

  @Delete(':id')
  async deleteAddress(@Param('id') id: string, @Body() body: { userId: string }) {
    console.log('[AddressesController] deleteAddress:', id, body.userId);
    return this.addressesService.deleteAddress(id, body.userId);
  }

  @Put(':id/default')
  async setDefaultAddress(@Param('id') id: string, @Body() body: { userId: string }) {
    console.log('[AddressesController] setDefaultAddress:', id, body.userId);
    return this.addressesService.setDefaultAddress(id, body.userId);
  }
}
