import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductsService } from './products.service';
import { IsString, IsOptional, IsNotEmpty, IsNumber, IsBoolean, IsEnum } from 'class-validator';

class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  brandId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  marketPrice?: number;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsString()
  mainImage?: string;

  @IsOptional()
  tags?: any;

  @IsOptional()
  specs?: any;

  @IsOptional()
  @IsString()
  sourceDescription?: string;

  @IsOptional()
  @IsString()
  sourceLocation?: string;
}

class QueryProductsDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  brandId?: string;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  pageSize?: number;
}

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getProducts(@Query() query: QueryProductsDto) {
    console.log('[ProductsController] getProducts:', query);
    return this.productsService.getProducts(query);
  }

  @Get('categories')
  async getCategories() {
    console.log('[ProductsController] getCategories');
    return this.productsService.getCategories();
  }

  @Get('brands')
  async getBrands() {
    console.log('[ProductsController] getBrands');
    return this.productsService.getBrands();
  }

  @Get(':id')
  async getProduct(@Param('id') id: string) {
    console.log('[ProductsController] getProduct:', id);
    return this.productsService.getProductById(id);
  }

  @Get(':id/images')
  async getProductImages(@Param('id') id: string) {
    console.log('[ProductsController] getProductImages:', id);
    return this.productsService.getProductImages(id);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createProduct(@Body() createProductDto: CreateProductDto) {
    console.log('[ProductsController] createProduct:', createProductDto);
    return this.productsService.createProduct(createProductDto);
  }

  @Put(':id')
  async updateProduct(@Param('id') id: string, @Body() updateData: any) {
    console.log('[ProductsController] updateProduct:', id, updateData);
    return this.productsService.updateProduct(id, updateData);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    console.log('[ProductsController] deleteProduct:', id);
    return this.productsService.deleteProduct(id);
  }

  @Post(':id/images')
  @HttpCode(HttpStatus.OK)
  async addProductImage(@Param('id') id: string, @Body() body: { imageUrl: string; sort?: number }) {
    console.log('[ProductsController] addProductImage:', id, body);
    return this.productsService.addProductImage(id, body.imageUrl, body.sort);
  }
}
