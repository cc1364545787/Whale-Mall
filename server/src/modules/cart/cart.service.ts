import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class CartService {
  async getCartByUserId(userId: string) {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('cart_items')
      .select('*, products(*, brands(*), categories(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[CartService] getCartByUserId error:', error);
      return { code: 500, msg: '获取购物车失败', data: null };
    }

    // 检查商品是否有效
    const cartItems = data?.map(item => ({
      ...item,
      is_invalid: !item.products || item.products.status !== 'active',
    })) || [];

    return { code: 200, msg: 'success', data: cartItems };
  }

  async addToCart(addToCartDto: { userId: string; productId: string; quantity?: number }) {
    const client = getSupabaseClient();

    // 检查购物车中是否已有该商品
    const { data: existingItem } = await client
      .from('cart_items')
      .select('*')
      .eq('user_id', addToCartDto.userId)
      .eq('product_id', addToCartDto.productId)
      .single();

    if (existingItem) {
      // 更新数量
      const newQuantity = existingItem.quantity + (addToCartDto.quantity || 1);
      const { data, error } = await client
        .from('cart_items')
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) {
        console.error('[CartService] update cart item error:', error);
        return { code: 500, msg: '更新购物车失败', data: null };
      }

      return { code: 200, msg: 'success', data };
    }

    // 获取商品价格
    const { data: product } = await client
      .from('products')
      .select('price')
      .eq('id', addToCartDto.productId)
      .single();

    // 新增购物车项
    const { data, error } = await client
      .from('cart_items')
      .insert({
        user_id: addToCartDto.userId,
        product_id: addToCartDto.productId,
        quantity: addToCartDto.quantity || 1,
        price: product?.price || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('[CartService] addToCart error:', error);
      return { code: 500, msg: '添加到购物车失败', data: null };
    }

    return { code: 200, msg: 'success', data };
  }

  async updateCartItem(id: string, quantity: number) {
    const client = getSupabaseClient();

    if (quantity <= 0) {
      // 数量为0时删除
      const { error } = await client
        .from('cart_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[CartService] delete cart item error:', error);
        return { code: 500, msg: '删除购物车项失败', data: null };
      }

      return { code: 200, msg: 'success', data: null };
    }

    const { data, error } = await client
      .from('cart_items')
      .update({
        quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[CartService] updateCartItem error:', error);
      return { code: 500, msg: '更新购物车失败', data: null };
    }

    return { code: 200, msg: 'success', data };
  }

  async removeFromCart(id: string, userId: string) {
    const client = getSupabaseClient();

    const { error } = await client
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('[CartService] removeFromCart error:', error);
      return { code: 500, msg: '删除购物车项失败', data: null };
    }

    return { code: 200, msg: 'success', data: null };
  }

  async clearCart(userId: string) {
    const client = getSupabaseClient();

    const { error } = await client
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('[CartService] clearCart error:', error);
      return { code: 500, msg: '清空购物车失败', data: null };
    }

    return { code: 200, msg: 'success', data: null };
  }

  async checkAndUpdateInvalidItems(userId: string) {
    const client = getSupabaseClient();

    // 获取购物车商品
    const { data: cartItems } = await client
      .from('cart_items')
      .select('id, product_id, products(status)')
      .eq('user_id', userId);

    if (!cartItems || cartItems.length === 0) {
      return { code: 200, msg: 'success', data: { invalidCount: 0 } };
    }

    // 标记失效商品
    const invalidIds = cartItems
      .filter((item: any) => !item.products || item.products.status !== 'active')
      .map((item: any) => item.id);

    if (invalidIds.length > 0) {
      await client
        .from('cart_items')
        .update({ is_invalid: true })
        .in('id', invalidIds);
    }

    return { code: 200, msg: 'success', data: { invalidCount: invalidIds.length } };
  }
}
