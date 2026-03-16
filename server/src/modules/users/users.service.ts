import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class UsersService {
  async login(loginDto: { openid: string; nickname?: string; avatar?: string }) {
    const client = getSupabaseClient();

    // 查找是否已有用户
    const { data: existingUsers, error: findError } = await client
      .from('users')
      .select('*')
      .eq('openid', loginDto.openid)
      .limit(1);

    if (findError) {
      console.error('[UsersService] find user error:', findError);
      return { code: 500, msg: '查询用户失败', data: null };
    }

    let user = existingUsers?.[0];

    if (!user) {
      // 创建新用户
      const { data: newUser, error: createError } = await client
        .from('users')
        .insert({
          openid: loginDto.openid,
          nickname: loginDto.nickname || '微信用户',
          avatar: loginDto.avatar,
          audit_status: 'pending',
          can_view_price: false,
          role: 'user',
        })
        .select()
        .single();

      if (createError) {
        console.error('[UsersService] create user error:', createError);
        return { code: 500, msg: '创建用户失败', data: null };
      }
      user = newUser;
    } else {
      // 更新用户信息
      if (loginDto.nickname || loginDto.avatar) {
        const { data: updatedUser, error: updateError } = await client
          .from('users')
          .update({
            nickname: loginDto.nickname || user.nickname,
            avatar: loginDto.avatar || user.avatar,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
          .select()
          .single();

        if (!updateError && updatedUser) {
          user = updatedUser;
        }
      }
    }

    return { code: 200, msg: 'success', data: user };
  }

  async bindPhone(bindPhoneDto: { userId: string; phone: string }) {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('users')
      .update({
        phone: bindPhoneDto.phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bindPhoneDto.userId)
      .select()
      .single();

    if (error) {
      console.error('[UsersService] bindPhone error:', error);
      return { code: 500, msg: '绑定手机号失败', data: null };
    }

    return { code: 200, msg: 'success', data };
  }

  async getUserById(id: string) {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[UsersService] getUserById error:', error);
      return { code: 500, msg: '获取用户信息失败', data: null };
    }

    return { code: 200, msg: 'success', data };
  }

  async getShopInfo(userId: string) {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('shop_info')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[UsersService] getShopInfo error:', error);
      return { code: 500, msg: '获取店铺信息失败', data: null };
    }

    return { code: 200, msg: 'success', data: data || null };
  }

  async createOrUpdateShop(updateShopDto: {
    userId: string;
    shopName: string;
    contactName?: string;
    contactPhone?: string;
    licenseImageKey?: string;
    licenseImageUrl?: string;
  }) {
    const client = getSupabaseClient();

    // 检查是否已有店铺信息
    const { data: existingShop } = await client
      .from('shop_info')
      .select('*')
      .eq('user_id', updateShopDto.userId)
      .single();

    if (existingShop) {
      // 更新
      const { data, error } = await client
        .from('shop_info')
        .update({
          shop_name: updateShopDto.shopName,
          contact_name: updateShopDto.contactName,
          contact_phone: updateShopDto.contactPhone,
          license_image_key: updateShopDto.licenseImageKey,
          license_image_url: updateShopDto.licenseImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', updateShopDto.userId)
        .select()
        .single();

      if (error) {
        console.error('[UsersService] update shop error:', error);
        return { code: 500, msg: '更新店铺信息失败', data: null };
      }

      return { code: 200, msg: 'success', data };
    } else {
      // 创建
      const { data, error } = await client
        .from('shop_info')
        .insert({
          user_id: updateShopDto.userId,
          shop_name: updateShopDto.shopName,
          contact_name: updateShopDto.contactName,
          contact_phone: updateShopDto.contactPhone,
          license_image_key: updateShopDto.licenseImageKey,
          license_image_url: updateShopDto.licenseImageUrl,
        })
        .select()
        .single();

      if (error) {
        console.error('[UsersService] create shop error:', error);
        return { code: 500, msg: '创建店铺信息失败', data: null };
      }

      return { code: 200, msg: 'success', data };
    }
  }

  async updateAuditStatus(id: string, auditDto: { auditStatus: string; auditRemark?: string }) {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('users')
      .update({
        audit_status: auditDto.auditStatus,
        can_view_price: auditDto.auditStatus === 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[UsersService] updateAuditStatus error:', error);
      return { code: 500, msg: '更新审核状态失败', data: null };
    }

    // 更新店铺信息的审核备注
    if (auditDto.auditRemark) {
      await client
        .from('shop_info')
        .update({
          audit_remark: auditDto.auditRemark,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', id);
    }

    return { code: 200, msg: 'success', data };
  }

  async updateUser(id: string, updateData: any) {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('users')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[UsersService] updateUser error:', error);
      return { code: 500, msg: '更新用户信息失败', data: null };
    }

    return { code: 200, msg: 'success', data };
  }
}
