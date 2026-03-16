import { View, Text, Image, ScrollView, Button } from '@tarojs/components'
import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import './index.css'

interface CartItem {
  id: string
  quantity: number
  price: string
  is_invalid: boolean
  products: {
    id: string
    name: string
    price: string
    main_image: string
    status: string
    brands?: { name: string }
  }
}

const CartPage = () => {
  const { user, isLoggedIn, isApproved } = useUserStore()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useDidShow(() => {
    // if (!isLoggedIn || !isApproved) {
    //   Taro.redirectTo({ url: '/pages/login/index' })
    //   return
    // }
    loadCart()
  })

  const loadCart = async () => {
    if (!user?.id) return

    try {
      const res = await Network.request({
        url: `/api/cart/${user.id}`,
      })

      if (res.data?.code === 200 && res.data?.data) {
        setCartItems(res.data.data)
      }
    } catch (error) {
      console.error('[Cart] loadCart error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectItem = (itemId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId)
      }
      return [...prev, itemId]
    })
  }

  const handleSelectAll = () => {
    const validItems = cartItems.filter(item => !item.is_invalid)
    if (selectedIds.length === validItems.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(validItems.map(item => item.id))
    }
  }

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveItem(itemId)
      return
    }

    try {
      const res = await Network.request({
        url: `/api/cart/${itemId}`,
        method: 'PUT',
        data: { quantity },
      })

      if (res.data?.code === 200) {
        loadCart()
      }
    } catch (error) {
      console.error('[Cart] updateQuantity error:', error)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    try {
      const res = await Network.request({
        url: `/api/cart/${itemId}?userId=${user?.id}`,
        method: 'DELETE',
      })

      if (res.data?.code === 200) {
        setCartItems(prev => prev.filter(item => item.id !== itemId))
        setSelectedIds(prev => prev.filter(id => id !== itemId))
        Taro.showToast({ title: '已删除', icon: 'success' })
      }
    } catch (error) {
      console.error('[Cart] removeItem error:', error)
    }
  }

  const handleClearInvalid = async () => {
    const invalidItems = cartItems.filter(item => item.is_invalid)
    for (const item of invalidItems) {
      await handleRemoveItem(item.id)
    }
  }

  const calculateTotal = () => {
    return selectedIds.reduce((total, id) => {
      const item = cartItems.find(i => i.id === id)
      if (item && !item.is_invalid) {
        return total + parseFloat(item.price) * item.quantity
      }
      return total
    }, 0)
  }

  const handleCheckout = () => {
    if (selectedIds.length === 0) {
      Taro.showToast({ title: '请选择商品', icon: 'none' })
      return
    }

    // 存储选中的购物车项ID
    Taro.setStorageSync('checkout_items', JSON.stringify(selectedIds))
    Taro.navigateTo({ url: '/pages/address/index?select=1' })
  }

  const validItems = cartItems.filter(item => !item.is_invalid)
  const invalidItems = cartItems.filter(item => item.is_invalid)
  const isAllSelected = validItems.length > 0 && selectedIds.length === validItems.length

  if (loading) {
    return (
      <View className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Text className="text-gray-400">加载中...</Text>
      </View>
    )
  }

  return (
    <View className="min-h-screen bg-gray-50 pb-32">
      {/* 购物车列表 */}
      {cartItems.length === 0 ? (
        <View className="flex flex-col items-center justify-center py-32">
          <Text className="text-5xl mb-4">🛒</Text>
          <Text className="text-gray-500 mb-4">购物车是空的</Text>
          <Button
            className="bg-blue-500 text-white rounded-full px-8"
            onClick={() => Taro.switchTab({ url: '/pages/index/index' })}
          >
            去逛逛
          </Button>
        </View>
      ) : (
        <ScrollView scrollY className="h-screen">
          {/* 有效商品 */}
          {validItems.length > 0 && (
            <View className="bg-white mb-2">
              {validItems.map(item => (
                <View
                  key={item.id}
                  className="flex flex-row px-4 py-4 border-b border-gray-100"
                >
                  {/* 选择框 */}
                  <View
                    className="flex items-center justify-center w-8"
                    onClick={() => handleSelectItem(item.id)}
                  >
                    <View
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedIds.includes(item.id)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedIds.includes(item.id) && (
                        <Text className="text-white text-xs">✓</Text>
                      )}
                    </View>
                  </View>

                  {/* 商品图片 */}
                  <Image
                    className="w-20 h-20 rounded-lg mr-3"
                    src={item.products?.main_image || 'https://via.placeholder.com/100'}
                    mode="aspectFill"
                  />

                  {/* 商品信息 */}
                  <View className="flex-1">
                    <Text className="block text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                      {item.products?.name}
                    </Text>
                    <Text className="block text-xs text-gray-500 mb-2">
                      {item.products?.brands?.name || ''}
                    </Text>
                    <View className="flex flex-row items-center justify-between">
                      <Text className="text-base font-bold text-orange-500">
                        ¥{item.price}
                      </Text>

                      {/* 数量控制 */}
                      <View className="flex flex-row items-center">
                        <View
                          className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <Text className="text-gray-600">-</Text>
                        </View>
                        <Text className="mx-3 text-gray-900">{item.quantity}</Text>
                        <View
                          className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Text className="text-gray-600">+</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* 失效商品 */}
          {invalidItems.length > 0 && (
            <View className="bg-white px-4 py-4">
              <View className="flex flex-row justify-between items-center mb-3">
                <Text className="text-sm text-gray-500">失效商品</Text>
                <Text
                  className="text-sm text-blue-500"
                  onClick={handleClearInvalid}
                >
                  清空
                </Text>
              </View>
              {invalidItems.map(item => (
                <View
                  key={item.id}
                  className="flex flex-row items-center py-3 border-b border-gray-100 opacity-50"
                >
                  <Image
                    className="w-16 h-16 rounded-lg mr-3"
                    src={item.products?.main_image || 'https://via.placeholder.com/100'}
                    mode="aspectFill"
                  />
                  <View className="flex-1">
                    <Text className="block text-sm text-gray-500 mb-1">
                      {item.products?.name}
                    </Text>
                    <Text className="text-xs text-red-500">商品已下架</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* 推荐商品区域 */}
          <View className="px-4 py-6">
            <Text className="block text-sm font-semibold text-gray-900 mb-4">
              猜你喜欢
            </Text>
            <View className="flex flex-row gap-3">
              {[1, 2].map(i => (
                <View
                  key={i}
                  className="flex-1 bg-white rounded-xl overflow-hidden"
                  onClick={() => Taro.switchTab({ url: '/pages/index/index' })}
                >
                  <View className="h-24 bg-gray-100 flex items-center justify-center">
                    <Text className="text-3xl">📱</Text>
                  </View>
                  <View className="p-2">
                    <Text className="block text-xs text-gray-500">更多好货</Text>
                    <Text className="block text-sm text-orange-500 font-medium">
                      去首页逛逛
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {/* 底部结算栏 */}
      {cartItems.length > 0 && (
        <View
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '12px 16px',
            backgroundColor: '#fff',
            borderTop: '1px solid #e5e5e5',
            zIndex: 100,
          }}
        >
          {/* 全选 */}
          <View
            className="flex flex-row items-center"
            onClick={handleSelectAll}
          >
            <View
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 ${
                isAllSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
              }`}
            >
              {isAllSelected && <Text className="text-white text-xs">✓</Text>}
            </View>
            <Text className="text-sm text-gray-700">全选</Text>
          </View>

          {/* 合计 */}
          <View className="flex-1 flex flex-row items-center justify-end mr-4">
            <Text className="text-sm text-gray-700">合计：</Text>
            <Text className="text-xl font-bold text-orange-500">
              ¥{calculateTotal().toFixed(2)}
            </Text>
          </View>

          {/* 结算按钮 */}
          <Button
            className={`px-8 py-2 rounded-full ${
              selectedIds.length > 0 ? 'bg-blue-500' : 'bg-gray-300'
            } text-white`}
            onClick={handleCheckout}
            disabled={selectedIds.length === 0}
          >
            结算({selectedIds.length})
          </Button>
        </View>
      )}
    </View>
  )
}

export default CartPage
