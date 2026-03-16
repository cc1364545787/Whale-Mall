import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class ProductsService {
  async getProducts(query: {
    categoryId?: string;
    brandId?: string;
    keyword?: string;
    page?: number;
    pageSize?: number;
  }) {
    const client = getSupabaseClient();
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const offset = (page - 1) * pageSize;

    // 先查询商品列表
    let queryBuilder = client
      .from('products')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (query.categoryId) {
      queryBuilder = queryBuilder.eq('category_id', query.categoryId);
    }

    if (query.brandId) {
      queryBuilder = queryBuilder.eq('brand_id', query.brandId);
    }

    if (query.keyword) {
      queryBuilder = queryBuilder.ilike('name', `%${query.keyword}%`);
    }

    const { data: products, error, count } = await queryBuilder;

    if (error) {
      console.error('[ProductsService] getProducts error:', error);
      return { code: 500, msg: '获取商品列表失败', data: null };
    }

    // 获取品牌和分类信息
    const { data: brands } = await client.from('brands').select('*');
    const { data: categories } = await client.from('categories').select('*');

    // 关联数据
    const brandMap = new Map((brands || []).map(b => [b.id, b]));
    const categoryMap = new Map((categories || []).map(c => [c.id, c]));

    const enrichedProducts = (products || []).map(p => ({
      ...p,
      brands: brandMap.get(p.brand_id) || null,
      categories: categoryMap.get(p.category_id) || null,
    }));

    return {
      code: 200,
      msg: 'success',
      data: {
        list: enrichedProducts,
        total: count,
        page,
        pageSize,
      },
    };
  }

  async getCategories() {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort', { ascending: true });

    if (error) {
      console.error('[ProductsService] getCategories error:', error);
      return { code: 500, msg: '获取分类列表失败', data: null };
    }

    return { code: 200, msg: 'success', data };
  }

  async getBrands() {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('brands')
      .select('*')
      .eq('is_active', true)
      .order('sort', { ascending: true });

    if (error) {
      console.error('[ProductsService] getBrands error:', error);
      return { code: 500, msg: '获取品牌列表失败', data: null };
    }

    return { code: 200, msg: 'success', data };
  }

  async getProductById(id: string) {
    const client = getSupabaseClient();

    const { data: product, error } = await client
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[ProductsService] getProductById error:', error);
      return { code: 500, msg: '获取商品详情失败', data: null };
    }

    // 获取品牌和分类信息
    let brand = null;
    let category = null;

    if (product.brand_id) {
      const { data: brandData } = await client
        .from('brands')
        .select('*')
        .eq('id', product.brand_id)
        .single();
      brand = brandData;
    }

    if (product.category_id) {
      const { data: categoryData } = await client
        .from('categories')
        .select('*')
        .eq('id', product.category_id)
        .single();
      category = categoryData;
    }

    return {
      code: 200,
      msg: 'success',
      data: {
        ...product,
        brands: brand,
        categories: category,
      },
    };
  }

  async getProductImages(productId: string) {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('sort', { ascending: true });

    if (error) {
      console.error('[ProductsService] getProductImages error:', error);
      return { code: 500, msg: '获取商品图片失败', data: null };
    }

    return { code: 200, msg: 'success', data };
  }

  async createProduct(createProductDto: any) {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('products')
      .insert({
        name: createProductDto.name,
        brand_id: createProductDto.brandId,
        category_id: createProductDto.categoryId,
        description: createProductDto.description,
        price: createProductDto.price,
        market_price: createProductDto.marketPrice,
        stock: createProductDto.stock || 0,
        main_image: createProductDto.mainImage,
        tags: createProductDto.tags,
        specs: createProductDto.specs,
        source_description: createProductDto.sourceDescription,
        source_location: createProductDto.sourceLocation,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('[ProductsService] createProduct error:', error);
      return { code: 500, msg: '创建商品失败', data: null };
    }

    return { code: 200, msg: 'success', data };
  }

  async updateProduct(id: string, updateData: any) {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('products')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[ProductsService] updateProduct error:', error);
      return { code: 500, msg: '更新商品失败', data: null };
    }

    return { code: 200, msg: 'success', data };
  }

  async deleteProduct(id: string) {
    const client = getSupabaseClient();

    const { error } = await client
      .from('products')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('[ProductsService] deleteProduct error:', error);
      return { code: 500, msg: '删除商品失败', data: null };
    }

    return { code: 200, msg: 'success', data: null };
  }

  async addProductImage(productId: string, imageUrl: string, sort?: number) {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('product_images')
      .insert({
        product_id: productId,
        image_url: imageUrl,
        sort: sort || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('[ProductsService] addProductImage error:', error);
      return { code: 500, msg: '添加商品图片失败', data: null };
    }

    return { code: 200, msg: 'success', data };
  }
}
