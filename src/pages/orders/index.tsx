import { View, Text, ScrollView, Button } from '@tarojs/components'
import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import './index.css'

interface Order {
  id: string
  order_no: string
  total_amount: string
  pay_amount: string
  status: string
  created_at: string
  order_items: Array<{
    id: string
    product_id: string
    quantity: number
    price: string
    products?: {
      name: string
      main_image: string
    }
  }>
}

const OrdersPage = () => {
  const { user, isLoggedIn, isApproved } = useUserStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待支付' },
    { key: 'paid', label: '待发货' },
    { key: 'shipped', label: '待收货' },
    { key: 'completed', label: '已完成' },
  ]

  useDidShow(() => {
    // if (!isLoggedIn || !isApproved) {
    //   Taro.redirectTo({ url: '/pages/login/index' })
    //   return
    // }
    loadOrders()
  })

  const loadOrders = async (status?: string) => {
    if (!user?.id) return

    try {
      const res = await Network.request({
        url: `/api/orders/user/${user.id}`,
        data: {
          status: status && status !== 'all' ? status : undefined,
          page: 1,
          pageSize: 20,
        },
      })

      if (res.data?.code === 200 && res.data?.data) {
        setOrders(res.data.data.list || [])
      }
    } catch (error) {
      console.error('[Orders] loadOrders error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setLoading(true)
    loadOrders(tab)
  }

  const handleOrderClick = (orderId: string) => {
    Taro.navigateTo({ url: `/pages/order-detail/index?id=${orderId}` })
  }

  const handleCancelOrder = async (orderId: string) => {
    Taro.showModal({
      title: '取消订单',
      content: '确定要取消此订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await Network.request({
              url: `/api/orders/${orderId}/cancel`,
              method: 'POST',
              data: { userId: user?.id },
            })

            if (result.data?.code === 200) {
              Taro.showToast({ title: '订单已取消', icon: 'success' })
              loadOrders(activeTab)
            }
          } catch (error) {
            Taro.showToast({ title: '取消失败', icon: 'none' })
          }
        }
      },
    })
  }

  const handleConfirmReceive = async (orderId: string) => {
    Taro.showModal({
      title: '确认收货',
      content: '确定已收到商品吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await Network.request({
              url: `/api/orders/${orderId}/confirm`,
              method: 'POST',
              data: { userId: user?.id },
            })

            if (result.data?.code === 200) {
              Taro.showToast({ title: '确认成功', icon: 'success' })
              loadOrders(activeTab)
            }
          } catch (error) {
            Taro.showToast({ title: '操作失败', icon: 'none' })
          }
        }
      },
    })
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: '待支付', color: 'text-orange-500', bgColor: 'bg-orange-50' }
      case 'paid':
        return { label: '待发货', color: 'text-blue-500', bgColor: 'bg-blue-50' }
      case 'shipped':
        return { label: '待收货', color: 'text-purple-500', bgColor: 'bg-purple-50' }
      case 'completed':
        return { label: '已完成', color: 'text-green-500', bgColor: 'bg-green-50' }
      case 'cancelled':
        return { label: '已取消', color: 'text-gray-500', bgColor: 'bg-gray-100' }
      default:
        return { label: '未知', color: 'text-gray-500', bgColor: 'bg-gray-100' }
    }
  }

  if (loading) {
    return (
      <View className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Text className="text-gray-400">加载中...</Text>
      </View>
    )
  }

  return (
    <View className="min-h-screen bg-gray-50">
      {/* Tab 栏 */}
      <View className="bg-white flex flex-row">
        {tabs.map(tab => (
          <View
            key={tab.key}
            className={`flex-1 py-3 flex items-center justify-center ${
              activeTab === tab.key ? 'border-b-2 border-blue-500' : ''
            }`}
            onClick={() => handleTabChange(tab.key)}
          >
            <Text
              className={`text-sm ${
                activeTab === tab.key ? 'text-blue-500 font-medium' : 'text-gray-600'
              }`}
            >
              {tab.label}
            </Text>
          </View>
        ))}
      </View>

      {/* 订单列表 */}
      <ScrollView scrollY className="h-screen">
        {orders.length === 0 ? (
          <View className="flex flex-col items-center justify-center py-32">
            <Text className="text-5xl mb-4">📋</Text>
            <Text className="text-gray-500 mb-4">暂无订单</Text>
            <Button
              className="bg-blue-500 text-white rounded-full px-8"
              onClick={() => Taro.switchTab({ url: '/pages/index/index' })}
            >
              去购物
            </Button>
          </View>
        ) : (
          <View className="p-4 space-y-3">
            {orders.map(order => {
              const statusInfo = getStatusInfo(order.status)
              return (
                <View
                  key={order.id}
                  className="bg-white rounded-xl overflow-hidden"
                  onClick={() => handleOrderClick(order.id)}
                >
                  {/* 订单头部 */}
                  <View className="flex flex-row justify-between items-center px-4 py-3 border-b border-gray-100">
                    <Text className="text-sm text-gray-500">
                      订单号：{order.order_no}
                    </Text>
                    <Text className={`text-sm font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </Text>
                  </View>

                  {/* 商品列表 */}
                  {order.order_items?.map((item, idx) => (
                    <View
                      key={idx}
                      className={`flex flex-row px-4 py-3 ${
                        idx > 0 ? 'border-t border-gray-50' : ''
                      }`}
                    >
                      <View className="w-16 h-16 bg-gray-100 rounded-lg mr-3 flex items-center justify-center">
                        <Text className="text-2xl">📱</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="block text-sm font-medium text-gray-900 mb-1">
                          {item.products?.name || '商品'}
                        </Text>
                        <View className="flex flex-row justify-between items-center">
                          <Text className="text-sm text-gray-500">x{item.quantity}</Text>
                          <Text className="text-sm font-medium text-gray-900">
                            ¥{item.price}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}

                  {/* 订单底部 */}
                  <View className="flex flex-row justify-between items-center px-4 py-3 border-t border-gray-100">
                    <Text className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString()}
                    </Text>
                    <View className="flex flex-row items-center">
                      <Text className="text-sm text-gray-700 mr-2">
                        共{order.order_items?.length || 0}件 合计：
                      </Text>
                      <Text className="text-lg font-bold text-orange-500">
                        ¥{order.pay_amount}
                      </Text>
                    </View>
                  </View>

                  {/* 操作按钮 */}
                  {order.status === 'pending' && (
                    <View className="flex flex-row justify-end px-4 py-3 border-t border-gray-100">
                      <Button
                        className="px-4 py-1 text-sm bg-gray-100 text-gray-700 rounded-full mr-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCancelOrder(order.id)
                        }}
                      >
                        取消订单
                      </Button>
                      <Button className="px-4 py-1 text-sm bg-blue-500 text-white rounded-full">
                        去支付
                      </Button>
                    </View>
                  )}

                  {order.status === 'shipped' && (
                    <View className="flex flex-row justify-end px-4 py-3 border-t border-gray-100">
                      <Button
                        className="px-4 py-1 text-sm bg-blue-500 text-white rounded-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleConfirmReceive(order.id)
                        }}
                      >
                        确认收货
                      </Button>
                    </View>
                  )}
                </View>
              )
            })}
          </View>
        )}

        {/* 底部安全区 */}
        <View className="h-20" />
      </ScrollView>
    </View>
  )
}

export default OrdersPage
