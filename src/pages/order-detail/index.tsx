import { View, Text, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import { useRouter, useDidShow } from '@tarojs/taro'
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
  paid_at: string
  shipped_at: string
  logistics_company: string
  logistics_no: string
  address_snapshot: any
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

const OrderDetailPage = () => {
  const router = useRouter()
  const { } = useUserStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  const orderId = router.params.id

  useDidShow(() => {
    if (orderId) {
      loadOrder()
    }
  })

  const loadOrder = async () => {
    try {
      const res = await Network.request({
        url: `/api/orders/${orderId}`,
      })

      if (res.data?.code === 200 && res.data?.data) {
        setOrder(res.data.data)
      }
    } catch (error) {
      console.error('[OrderDetail] loadOrder error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: '待支付', color: 'text-orange-500', bgColor: 'bg-orange-50', icon: '⏳' }
      case 'paid':
        return { label: '待发货', color: 'text-blue-500', bgColor: 'bg-blue-50', icon: '📦' }
      case 'shipped':
        return { label: '待收货', color: 'text-purple-500', bgColor: 'bg-purple-50', icon: '🚚' }
      case 'completed':
        return { label: '已完成', color: 'text-green-500', bgColor: 'bg-green-50', icon: '✅' }
      case 'cancelled':
        return { label: '已取消', color: 'text-gray-500', bgColor: 'bg-gray-100', icon: '❌' }
      default:
        return { label: '未知', color: 'text-gray-500', bgColor: 'bg-gray-100', icon: '❓' }
    }
  }

  if (loading) {
    return (
      <View className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Text className="text-gray-400">加载中...</Text>
      </View>
    )
  }

  if (!order) {
    return (
      <View className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Text className="text-4xl mb-4">📋</Text>
        <Text className="text-gray-500">订单不存在</Text>
      </View>
    )
  }

  const statusInfo = getStatusInfo(order.status)

  return (
    <View className="min-h-screen bg-gray-50">
      <ScrollView scrollY className="h-screen">
        {/* 状态区域 */}
        <View className={`${statusInfo.bgColor} px-4 py-6`}>
          <View className="flex flex-col items-center">
            <Text className="text-4xl mb-2">{statusInfo.icon}</Text>
            <Text className={`text-xl font-bold ${statusInfo.color} mb-1`}>
              {statusInfo.label}
            </Text>
            {order.status === 'shipped' && order.logistics_no && (
              <Text className="text-sm text-gray-600">
                物流单号：{order.logistics_no}
              </Text>
            )}
          </View>
        </View>

        {/* 收货地址 */}
        {order.address_snapshot && (
          <View className="bg-white px-4 py-4 mb-2">
            <View className="flex flex-row items-start">
              <Text className="text-xl mr-3">📍</Text>
              <View className="flex-1">
                <View className="flex flex-row items-center mb-1">
                  <Text className="font-medium text-gray-900 mr-2">
                    {order.address_snapshot.receiver_name}
                  </Text>
                  <Text className="text-gray-600">
                    {order.address_snapshot.receiver_phone}
                  </Text>
                </View>
                <Text className="text-sm text-gray-500">
                  {order.address_snapshot.province}
                  {order.address_snapshot.city}
                  {order.address_snapshot.district}
                  {order.address_snapshot.detail_address}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 商品列表 */}
        <View className="bg-white px-4 py-4 mb-2">
          <Text className="block text-base font-semibold text-gray-900 mb-4">
            商品信息
          </Text>
          {order.order_items?.map((item, idx) => (
            <View
              key={idx}
              className={`flex flex-row ${idx > 0 ? 'mt-3 pt-3 border-t border-gray-100' : ''}`}
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
        </View>

        {/* 订单信息 */}
        <View className="bg-white px-4 py-4 mb-2">
          <Text className="block text-base font-semibold text-gray-900 mb-4">
            订单信息
          </Text>
          <View className="space-y-2">
            <View className="flex flex-row justify-between py-2">
              <Text className="text-sm text-gray-500">订单编号</Text>
              <Text className="text-sm text-gray-900">{order.order_no}</Text>
            </View>
            <View className="flex flex-row justify-between py-2">
              <Text className="text-sm text-gray-500">创建时间</Text>
              <Text className="text-sm text-gray-900">
                {new Date(order.created_at).toLocaleString()}
              </Text>
            </View>
            {order.paid_at && (
              <View className="flex flex-row justify-between py-2">
                <Text className="text-sm text-gray-500">支付时间</Text>
                <Text className="text-sm text-gray-900">
                  {new Date(order.paid_at).toLocaleString()}
                </Text>
              </View>
            )}
            {order.shipped_at && (
              <View className="flex flex-row justify-between py-2">
                <Text className="text-sm text-gray-500">发货时间</Text>
                <Text className="text-sm text-gray-900">
                  {new Date(order.shipped_at).toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 金额明细 */}
        <View className="bg-white px-4 py-4 mb-2">
          <Text className="block text-base font-semibold text-gray-900 mb-4">
            金额明细
          </Text>
          <View className="space-y-2">
            <View className="flex flex-row justify-between py-2">
              <Text className="text-sm text-gray-500">商品总额</Text>
              <Text className="text-sm text-gray-900">¥{order.total_amount}</Text>
            </View>
            <View className="flex flex-row justify-between py-2">
              <Text className="text-sm text-gray-500">运费</Text>
              <Text className="text-sm text-gray-900">¥0.00</Text>
            </View>
            <View className="flex flex-row justify-between py-2 border-t border-gray-100">
              <Text className="text-sm font-medium text-gray-900">实付金额</Text>
              <Text className="text-lg font-bold text-orange-500">
                ¥{order.pay_amount}
              </Text>
            </View>
          </View>
        </View>

        {/* 发货说明 */}
        <View className="bg-white px-4 py-4 mb-2">
          <Text className="block text-base font-semibold text-gray-900 mb-2">
            发货说明
          </Text>
          <Text className="block text-sm text-gray-600">
            18:00 前下单当日发货，18:00 后下单次日发货。发货后可在订单详情查看物流信息。
          </Text>
        </View>

        {/* 底部安全区 */}
        <View className="h-20" />
      </ScrollView>
    </View>
  )
}

export default OrderDetailPage
