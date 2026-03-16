import { Controller, Get, Post, Body, Put, Param, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';

class LoginDto {
  @IsString()
  @IsNotEmpty()
  openid: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

class BindPhoneDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}

class UpdateShopDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  shopName: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  licenseImageKey?: string;

  @IsOptional()
  @IsString()
  licenseImageUrl?: string;
}

class AuditDto {
  @IsEnum(['pending', 'approved', 'rejected'])
  auditStatus: string;

  @IsOptional()
  @IsString()
  auditRemark?: string;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    console.log('[UsersController] login:', loginDto);
    return this.usersService.login(loginDto);
  }

  @Post('bind-phone')
  @HttpCode(HttpStatus.OK)
  async bindPhone(@Body() bindPhoneDto: BindPhoneDto) {
    console.log('[UsersController] bindPhone:', bindPhoneDto);
    return this.usersService.bindPhone(bindPhoneDto);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    console.log('[UsersController] getUser:', id);
    return this.usersService.getUserById(id);
  }

  @Get('shop/:userId')
  async getShopInfo(@Param('userId') userId: string) {
    console.log('[UsersController] getShopInfo:', userId);
    return this.usersService.getShopInfo(userId);
  }

  @Post('shop')
  @HttpCode(HttpStatus.OK)
  async createOrUpdateShop(@Body() updateShopDto: UpdateShopDto) {
    console.log('[UsersController] createOrUpdateShop:', updateShopDto);
    return this.usersService.createOrUpdateShop(updateShopDto);
  }

  @Put(':id/audit')
  async updateAuditStatus(@Param('id') id: string, @Body() auditDto: AuditDto) {
    console.log('[UsersController] updateAuditStatus:', id, auditDto);
    return this.usersService.updateAuditStatus(id, auditDto);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateData: any) {
    console.log('[UsersController] updateUser:', id, updateData);
    return this.usersService.updateUser(id, updateData);
  }
}
