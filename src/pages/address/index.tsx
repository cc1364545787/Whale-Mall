import { View, Text, ScrollView, Button } from '@tarojs/components'
import { useState } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import './index.css'

interface Address {
  id: string
  receiver_name: string
  receiver_phone: string
  province: string
  city: string
  district: string
  detail_address: string
  is_default: boolean
}

const AddressPage = () => {
  const router = useRouter()
  const { user, isLoggedIn, isApproved } = useUserStore()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [selectMode, setSelectMode] = useState(false)

  useDidShow(() => {
    if (!isLoggedIn || !isApproved) {
      Taro.redirectTo({ url: '/pages/login/index' })
      return
    }

    // 检查是否是选择地址模式
    if (router.params.select === '1') {
      setSelectMode(true)
    }

    loadAddresses()
  })

  const loadAddresses = async () => {
    if (!user?.id) return

    try {
      const res = await Network.request({
        url: `/api/addresses/user/${user.id}`,
      })

      if (res.data?.code === 200 && res.data?.data) {
        setAddresses(res.data.data)
      }
    } catch (error) {
      console.error('[Address] loadAddresses error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAddress = () => {
    Taro.navigateTo({ url: '/pages/address-edit/index' })
  }

  const handleEditAddress = (id: string) => {
    Taro.navigateTo({ url: `/pages/address-edit/index?id=${id}` })
  }

  const handleDeleteAddress = async (id: string) => {
    Taro.showModal({
      title: '删除地址',
      content: '确定要删除此地址吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await Network.request({
              url: `/api/addresses/${id}`,
              method: 'DELETE',
              data: { userId: user?.id },
            })

            if (result.data?.code === 200) {
              Taro.showToast({ title: '已删除', icon: 'success' })
              loadAddresses()
            }
          } catch (error) {
            Taro.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      },
    })
  }

  const handleSetDefault = async (id: string) => {
    try {
      const res = await Network.request({
        url: `/api/addresses/${id}/default`,
        method: 'PUT',
        data: { userId: user?.id },
      })

      if (res.data?.code === 200) {
        Taro.showToast({ title: '设置成功', icon: 'success' })
        loadAddresses()
      }
    } catch (error) {
      Taro.showToast({ title: '设置失败', icon: 'none' })
    }
  }

  const handleSelectAddress = (address: Address) => {
    if (!selectMode) return

    // 保存选中的地址
    Taro.setStorageSync('selected_address', JSON.stringify(address))
    
    // 返回购物车或订单页面进行结算
    // 这里简化处理，实际应该返回上一页
    Taro.navigateBack()
  }

  if (loading) {
    return (
      <View className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Text className="text-gray-400">加载中...</Text>
      </View>
    )
  }

  return (
    <View className="min-h-screen bg-gray-50 pb-20">
      {/* 提示 */}
      {selectMode && (
        <View className="bg-blue-50 px-4 py-3">
          <Text className="text-sm text-blue-600">请选择收货地址</Text>
        </View>
      )}

      {/* 地址列表 */}
      <ScrollView scrollY className="h-screen">
        {addresses.length === 0 ? (
          <View className="flex flex-col items-center justify-center py-32">
            <Text className="text-5xl mb-4">📍</Text>
            <Text className="text-gray-500 mb-4">暂无收货地址</Text>
            <Button
              className="bg-blue-500 text-white rounded-full px-8"
              onClick={handleAddAddress}
            >
              添加地址
            </Button>
          </View>
        ) : (
          <View className="p-4 space-y-3">
            {addresses.map(address => (
              <View
                key={address.id}
                className="bg-white rounded-xl p-4"
                onClick={() => selectMode && handleSelectAddress(address)}
              >
                {/* 默认标签 */}
                {address.is_default && (
                  <View className="flex flex-row items-center mb-2">
                    <View className="bg-blue-500 px-2 py-0.5 rounded">
                      <Text className="text-xs text-white">默认</Text>
                    </View>
                  </View>
                )}

                {/* 收货人信息 */}
                <View className="flex flex-row items-center mb-2">
                  <Text className="font-medium text-gray-900 mr-3">
                    {address.receiver_name}
                  </Text>
                  <Text className="text-gray-600">{address.receiver_phone}</Text>
                </View>

                {/* 详细地址 */}
                <Text className="block text-sm text-gray-500 mb-3">
                  {address.province}
                  {address.city}
                  {address.district}
                  {address.detail_address}
                </Text>

                {/* 操作按钮 */}
                {!selectMode && (
                  <View className="flex flex-row justify-between items-center border-t border-gray-100 pt-3">
                    <View
                      className="flex flex-row items-center"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      <View
                        className={`w-4 h-4 rounded-full border-2 mr-2 flex items-center justify-center ${
                          address.is_default
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {address.is_default && (
                          <Text className="text-white text-xs">✓</Text>
                        )}
                      </View>
                      <Text className="text-sm text-gray-600">设为默认</Text>
                    </View>

                    <View className="flex flex-row">
                      <Text
                        className="text-sm text-blue-500 mr-4"
                        onClick={() => handleEditAddress(address.id)}
                      >
                        编辑
                      </Text>
                      <Text
                        className="text-sm text-red-500"
                        onClick={() => handleDeleteAddress(address.id)}
                      >
                        删除
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* 底部安全区 */}
        <View className="h-20" />
      </ScrollView>

      {/* 添加地址按钮 */}
      {!selectMode && (
        <View
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '12px 16px',
            backgroundColor: '#fff',
            borderTop: '1px solid #e5e5e5',
          }}
        >
          <Button
            className="w-full bg-blue-500 text-white rounded-xl py-3"
            onClick={handleAddAddress}
          >
            添加收货地址
          </Button>
        </View>
      )}
    </View>
  )
}

export default AddressPage
