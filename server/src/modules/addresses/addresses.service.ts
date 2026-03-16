import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class AddressesService {
  async getAddressesByUserId(userId: string) {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[AddressesService] getAddressesByUserId error:', error);
      return { code: 500, msg: '获取地址列表失败', data: null };
    }

    return { code: 200, msg: 'success', data };
  }

  async getAddressById(id: string) {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('addresses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[AddressesService] getAddressById error:', error);
      return { code: 500, msg: '获取地址详情失败', data: null };
    }

    return { code: 200, msg: 'success', data };
  }

  async createAddress(createAddressDto: {
    userId: string;
    receiverName: string;
    receiverPhone: string;
    province?: string;
    city?: string;
    district?: string;
    detailAddress: string;
    isDefault?: boolean;
  }) {
    const client = getSupabaseClient();

    // 如果设置为默认，先取消其他默认地址
    if (createAddressDto.isDefault) {
      await client
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', createAddressDto.userId);
    }

    const { data, error } = await client
      .from('addresses')
      .insert({
        user_id: createAddressDto.userId,
        receiver_name: createAddressDto.receiverName,
        receiver_phone: createAddressDto.receiverPhone,
        province: createAddressDto.province,
        city: createAddressDto.city,
        district: createAddressDto.district,
        detail_address: createAddressDto.detailAddress,
        is_default: createAddressDto.isDefault || false,
      })
      .select()
      .single();

    if (error) {
      console.error('[AddressesService] createAddress error:', error);
      return { code: 500, msg: '创建地址失败', data: null };
    }

    return { code: 200, msg: 'success', data };
  }

  async updateAddress(id: string, updateData: any) {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('addresses')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[AddressesService] updateAddress error:', error);
      return { code: 500, msg: '更新地址失败', data: null };
    }

    return { code: 200, msg: 'success', data };
  }

  async deleteAddress(id: string, userId: string) {
    const client = getSupabaseClient();

    const { error } = await client
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('[AddressesService] deleteAddress error:', error);
      return { code: 500, msg: '删除地址失败', data: null };
    }

    return { code: 200, msg: 'success', data: null };
  }

  async setDefaultAddress(id: string, userId: string) {
    const client = getSupabaseClient();

    // 取消其他默认地址
    await client
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);

    // 设置当前地址为默认
    const { data, error } = await client
      .from('addresses')
      .update({ is_default: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('[AddressesService] setDefaultAddress error:', error);
      return { code: 500, msg: '设置默认地址失败', data: null };
    }

    return { code: 200, msg: 'success', data };
  }
}
