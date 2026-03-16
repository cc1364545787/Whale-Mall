import { View, Text, Button } from '@tarojs/components'
import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import './index.css'

const LoginPage = () => {
  const [loading, setLoading] = useState(false)
  const { setUser, isLoggedIn, isApproved } = useUserStore()

  useDidShow(() => {
    if (isLoggedIn) {
      // --- 修改：注释掉阻拦逻辑，强制跳转首页 ---
      // if (isApproved) {
        Taro.switchTab({ url: '/pages/index/index' })
      // } else {
      //   Taro.redirectTo({ url: '/pages/audit/index' })
      // }
    }
  })

  const handleWechatLogin = async () => {
    setLoading(true)
    try {
      // 模拟微信登录流程
      const mockOpenid = `openid_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
      const res = await Network.request({
        url: '/api/users/login',
        method: 'POST',
        data: {
          openid: mockOpenid,
          nickname: '微信用户',
          avatar: 'https://lf-coze-web-cdn.coze.cn/obj/eden-cn/lm-lgvj/ljhwZthlaukjlkulzlp/coze-coding/icon/coze-coding.gif'
        }
      })

      console.log('[Login] response:', res.data)
      if (res.data?.code === 200 && res.data?.data) {
        const userData = res.data.data
        setUser(userData)
        Taro.setStorageSync('user', JSON.stringify(userData))
        
        // --- 修改：登录成功后不判断状态，直接进首页 ---
        // if (userData.audit_status === 'approved') {
          Taro.switchTab({ url: '/pages/index/index' })
        // } else {
        //   Taro.redirectTo({ url: '/pages/audit/index' })
        // }
      } else {
        Taro.showToast({ title: '登录失败', icon: 'none' })
      }
    } catch (error) {
      console.error('[Login] error:', error)
      Taro.showToast({ title: '登录失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-600 flex flex-col">
      {/* Logo 区域 */}
      <View className="flex-1 flex flex-col items-center justify-center px-6 pt-20">
        <View className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg">
          <Text className="text-4xl">📱</Text>
        </View>
        <Text className="block text-2xl font-bold text-white mb-2">数码汇</Text>
        <Text className="block text-blue-100 text-center text-sm">
          B端同行门店二手数码调货平台
        </Text>
      </View>

      {/* 登录区域 */}
      <View className="bg-white rounded-t-3xl px-6 py-10">
        <Text className="block text-xl font-semibold text-gray-900 mb-6 text-center">
          欢迎登录
        </Text>

        {/* 微信登录按钮 */}
        <Button
          className="w-full bg-green-500 text-white rounded-xl py-4 font-medium text-base flex items-center justify-center"
          onClick={handleWechatLogin}
          loading={loading}
          disabled={loading}
        >
          <Text className="text-white text-lg mr-2">微信</Text>
          <Text className="text-white">一键登录</Text>
        </Button>

        <Text className="block text-gray-400 text-xs text-center mt-6">
          登录即表示同意《用户协议》和《隐私政策》
        </Text>

        {/* 平台说明 */}
        <View className="mt-8 pt-6 border-t border-gray-100">
          <Text className="block text-gray-500 text-xs text-center mb-4">
            平台准入要求
          </Text>
          <View className="flex flex-row justify-around">
            <View className="flex flex-col items-center">
              <View className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                <Text className="text-lg">📋</Text>
              </View>
              <Text className="block text-xs text-gray-600">营业执照</Text>
            </View>
            <View className="flex flex-col items-center">
              <View className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                <Text className="text-lg">🏪</Text>
              </View>
              <Text className="block text-xs text-gray-600">实体门店</Text>
            </View>
            <View className="flex flex-col items-center">
              <View className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                <Text className="text-lg">📱</Text>
              </View>
              <Text className="block text-xs text-gray-600">手机验证</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

export default LoginPage