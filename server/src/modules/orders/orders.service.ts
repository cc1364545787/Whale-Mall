import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class OrdersService {
  async getOrdersByUserId(userId: string, status?: string, page: number = 1, pageSize: number = 10) {
    const client = getSupabaseClient();
    const offset = (page - 1) * pageSize;

    let queryBuilder = client
      .from('orders')
      .select('*, order_items(*, products(*))', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (status) {
      queryBuilder = queryBuilder.eq('status', status);
    }

    const { data, error, count } = await queryBuilder;

    if (error) {
      console.error('[OrdersService] getOrdersByUserId error:', error);
      return { code: 500, msg: '获取订单列表失败', data: null };
    }

    return {
      code: 200,
      msg: 'success',
      data: {
        list: data,
        total: count,
        page,
        pageSize,
      },
    };
  }

  async getOrderById(id: string) {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[OrdersService] getOrderById error:', error);
      return { code: 500, msg: '获取订单详情失败', data: null };
    }

    return { code: 200, msg: 'success', data };
  }

  async createOrder(createOrderDto: { userId: string; addressId: string; cartItemIds: string[]; remark?: string }) {
    const client = getSupabaseClient();

    // 获取地址信息
    const { data: address } = await client
      .from('addresses')
      .select('*')
      .eq('id', createOrderDto.addressId)
      .single();

    if (!address) {
      return { code: 400, msg: '地址不存在', data: null };
    }

    // 获取购物车商品
    const { data: cartItems } = await client
      .from('cart_items')
      .select('*, products(*)')
      .in('id', createOrderDto.cartItemIds)
      .eq('user_id', createOrderDto.userId);

    if (!cartItems || cartItems.length === 0) {
      return { code: 400, msg: '购物车商品不存在', data: null };
    }

    // 计算总金额
    let totalAmount = 0;
    const orderItems = cartItems.map(item => {
      const price = parseFloat(item.products?.price || item.price || 0);
      totalAmount += price * item.quantity;
      return {
        product_id: item.product_id,
        product_snapshot: item.products,
        quantity: item.quantity,
        price: price,
      };
    });

    // 生成订单号
    const orderNo = `DH${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 创建订单
    const { data: order, error: orderError } = await client
      .from('orders')
      .insert({
        order_no: orderNo,
        user_id: createOrderDto.userId,
        address_snapshot: address,
        total_amount: totalAmount,
        shipping_fee: 0,
        pay_amount: totalAmount,
        status: 'pending',
        pay_status: 'unpaid',
        remark: createOrderDto.remark,
      })
      .select()
      .single();

    if (orderError) {
      console.error('[OrdersService] createOrder error:', orderError);
      return { code: 500, msg: '创建订单失败', data: null };
    }

    // 创建订单商品
    const { error: itemsError } = await client
      .from('order_items')
      .insert(orderItems.map(item => ({
        ...item,
        order_id: order.id,
      })));

    if (itemsError) {
      console.error('[OrdersService] create order items error:', itemsError);
    }

    // 删除已下单的购物车商品
    await client
      .from('cart_items')
      .delete()
      .in('id', createOrderDto.cartItemIds);

    return { code: 200, msg: 'success', data: order };
  }

  async updateOrderStatus(id: string, updateDto: { status: string; logisticsCompany?: string; logisticsNo?: string }) {
    const client = getSupabaseClient();

    const updateData: any = {
      status: updateDto.status,
      updated_at: new Date().toISOString(),
    };

    if (updateDto.status === 'paid') {
      updateData.pay_status = 'paid';
      updateData.paid_at = new Date().toISOString();
    }

    if (updateDto.status === 'shipped') {
      updateData.logistics_company = updateDto.logisticsCompany;
      updateData.logistics_no = updateDto.logisticsNo;
      updateData.shipped_at = new Date().toISOString();
    }

    const { data, error } = await client
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[OrdersService] updateOrderStatus error:', error);
      return { code: 500, msg: '更新订单状态失败', data: null };
    }

    return { code: 200, msg: 'success', data };
  }

  async cancelOrder(id: string, userId: string) {
    const client = getSupabaseClient();

    const { data: order } = await client
      .from('orders')
      .select('status')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!order) {
      return { code: 400, msg: '订单不存在', data: null };
    }

    if (order.status !== 'pending') {
      return { code: 400, msg: '订单状态不允许取消', data: null };
    }

    const { data, error } = await client
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[OrdersService] cancelOrder error:', error);
      return { code: 500, msg: '取消订单失败', data: null };
    }

    return { code: 200, msg: 'success', data };
  }

  async confirmReceive(id: string, userId: string) {
    const client = getSupabaseClient();

    const { data: order } = await client
      .from('orders')
      .select('status')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!order) {
      return { code: 400, msg: '订单不存在', data: null };
    }

    if (order.status !== 'shipped') {
      return { code: 400, msg: '订单状态不允许确认收货', data: null };
    }

    const { data, error } = await client
      .from('orders')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[OrdersService] confirmReceive error:', error);
      return { code: 500, msg: '确认收货失败', data: null };
    }

    return { code: 200, msg: 'success', data };
  }
}
