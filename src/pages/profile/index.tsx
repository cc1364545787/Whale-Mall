import { View, Text, Image, ScrollView, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import './index.css'

const ProfilePage = () => {
  const { user, shopInfo, isLoggedIn, logout } = useUserStore()

  useDidShow(() => {
    // if (!isLoggedIn) {
    //   Taro.redirectTo({ url: '/pages/login/index' })
    //   return
    // }

    loadShopInfo()
  })

  const loadShopInfo = async () => {
    if (!user?.id) return

    try {
      const res = await Network.request({
        url: `/api/users/shop/${user.id}`,
      })

      if (res.data?.code === 200 && res.data?.data) {
        // 已在 store 中处理
      }
    } catch (error) {
      console.error('[Profile] loadShopInfo error:', error)
    }
  }

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          logout()
          Taro.redirectTo({ url: '/pages/login/index' })
        }
      },
    })
  }

  const handleMenuClick = (type: string) => {
    switch (type) {
      case 'address':
        Taro.navigateTo({ url: '/pages/address/index' })
        break
      case 'audit':
        Taro.navigateTo({ url: '/pages/audit/index' })
        break
      case 'service':
        Taro.showModal({
          title: '联系客服',
          content: '客服微信：digital_hui\n点击确定复制微信号',
          success: (res) => {
            if (res.confirm) {
              Taro.setClipboardData({
                data: 'digital_hui',
                success: () => {
                  Taro.showToast({ title: '已复制微信号', icon: 'success' })
                },
              })
            }
          },
        })
        break
      case 'about':
        Taro.showModal({
          title: '关于数码汇',
          content: '数码汇 - B端同行门店二手数码产品调货平台\n\n版本：1.0.0',
          showCancel: false,
        })
        break
    }
  }

  const getStatusBadge = () => {
    switch (user?.audit_status) {
      case 'approved':
        return { text: '已认证', color: 'bg-green-500' }
      case 'pending':
        return { text: '审核中', color: 'bg-orange-500' }
      case 'rejected':
        return { text: '已驳回', color: 'bg-red-500' }
      default:
        return { text: '未认证', color: 'bg-gray-400' }
    }
  }

  const statusBadge = getStatusBadge()

  return (
    <View className="min-h-screen bg-gray-50">
      <ScrollView scrollY className="h-screen">
        {/* 用户信息区域 */}
        <View className="bg-gradient-to-b from-blue-500 to-blue-600 px-4 pt-8 pb-12">
          <View className="flex flex-row items-center">
            {/* 头像 */}
            <View className="w-16 h-16 bg-white rounded-full overflow-hidden mr-4">
              <Image
                className="w-full h-full"
                src={user?.avatar || 'https://via.placeholder.com/100'}
                mode="aspectFill"
              />
            </View>

            {/* 用户名和状态 */}
            <View className="flex-1">
              <View className="flex flex-row items-center mb-1">
                <Text className="text-lg font-semibold text-white mr-2">
                  {user?.nickname || '用户'}
                </Text>
                <View className={`${statusBadge.color} px-2 py-0.5 rounded`}>
                  <Text className="text-xs text-white">{statusBadge.text}</Text>
                </View>
              </View>
              <Text className="text-blue-100 text-sm">
                {user?.phone || '未绑定手机'}
              </Text>
            </View>
          </View>
        </View>

        {/* 店铺信息卡片 */}
        <View className="bg-white rounded-xl mx-4 -mt-6 p-4 shadow-sm mb-4">
          <View className="flex flex-row justify-between items-center mb-3">
            <Text className="font-semibold text-gray-900">店铺信息</Text>
            <Text
              className="text-sm text-blue-500"
              onClick={() => handleMenuClick('audit')}
            >
              {user?.audit_status === 'approved' ? '查看详情' : '完善信息'}
            </Text>
          </View>
          <View className="space-y-2">
            <View className="flex flex-row justify-between">
              <Text className="text-sm text-gray-500">店铺名称</Text>
              <Text className="text-sm text-gray-900">
                {shopInfo?.shop_name || '未填写'}
              </Text>
            </View>
            <View className="flex flex-row justify-between">
              <Text className="text-sm text-gray-500">联系人</Text>
              <Text className="text-sm text-gray-900">
                {shopInfo?.contact_name || '未填写'}
              </Text>
            </View>
            <View className="flex flex-row justify-between">
              <Text className="text-sm text-gray-500">联系电话</Text>
              <Text className="text-sm text-gray-900">
                {shopInfo?.contact_phone || '未填写'}
              </Text>
            </View>
          </View>
        </View>

        {/* 功能菜单 */}
        <View className="bg-white mx-4 rounded-xl overflow-hidden mb-4">
          {/* 收货地址 */}
          <View
            className="flex flex-row items-center justify-between px-4 py-4 border-b border-gray-100"
            onClick={() => handleMenuClick('address')}
          >
            <View className="flex flex-row items-center">
              <Text className="text-xl mr-3">📍</Text>
              <Text className="text-gray-900">收货地址</Text>
            </View>
            <Text className="text-gray-400">{'>'}</Text>
          </View>

          {/* 认证信息 */}
          <View
            className="flex flex-row items-center justify-between px-4 py-4 border-b border-gray-100"
            onClick={() => handleMenuClick('audit')}
          >
            <View className="flex flex-row items-center">
              <Text className="text-xl mr-3">📋</Text>
              <Text className="text-gray-900">认证信息</Text>
            </View>
            <Text className="text-gray-400">{'>'}</Text>
          </View>

          {/* 联系客服 */}
          <View
            className="flex flex-row items-center justify-between px-4 py-4 border-b border-gray-100"
            onClick={() => handleMenuClick('service')}
          >
            <View className="flex flex-row items-center">
              <Text className="text-xl mr-3">💬</Text>
              <Text className="text-gray-900">联系客服</Text>
            </View>
            <Text className="text-gray-400">{'>'}</Text>
          </View>

          {/* 关于我们 */}
          <View
            className="flex flex-row items-center justify-between px-4 py-4"
            onClick={() => handleMenuClick('about')}
          >
            <View className="flex flex-row items-center">
              <Text className="text-xl mr-3">ℹ️</Text>
              <Text className="text-gray-900">关于我们</Text>
            </View>
            <Text className="text-gray-400">{'>'}</Text>
          </View>
        </View>

        {/* 平台优势 */}
        <View className="bg-white mx-4 rounded-xl p-4 mb-4">
          <Text className="font-semibold text-gray-900 mb-4">平台优势</Text>
          <View className="grid grid-cols-2 gap-4">
            <View className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
              <Text className="text-2xl mb-1">💰</Text>
              <Text className="text-sm text-gray-700 text-center">实时报价</Text>
            </View>
            <View className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
              <Text className="text-2xl mb-1">📦</Text>
              <Text className="text-sm text-gray-700 text-center">虚拟库存</Text>
            </View>
            <View className="flex flex-col items-center p-3 bg-orange-50 rounded-lg">
              <Text className="text-2xl mb-1">🔒</Text>
              <Text className="text-sm text-gray-700 text-center">正品保障</Text>
            </View>
            <View className="flex flex-col items-center p-3 bg-purple-50 rounded-lg">
              <Text className="text-2xl mb-1">🚀</Text>
              <Text className="text-sm text-gray-700 text-center">快速发货</Text>
            </View>
          </View>
        </View>

        {/* 退出登录 */}
        <View className="px-4 mb-8">
          <Button
            className="w-full bg-white border border-gray-300 text-gray-700 rounded-xl py-3"
            onClick={handleLogout}
          >
            退出登录
          </Button>
        </View>

        {/* 底部安全区 */}
        <View className="h-20" />
      </ScrollView>
    </View>
  )
}

export default ProfilePage
