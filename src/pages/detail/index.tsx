import { View, Text, Image, ScrollView, Button } from '@tarojs/components'
import { useState } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import './index.css'

interface Product {
  id: string
  name: string
  price: string
  market_price: string
  main_image: string
  description: string
  tags: Array<{ label: string; type: string }>
  specs: Record<string, string>
  source_description: string
  brands?: { name: string }
  categories?: { name: string }
}

const DetailPage = () => {
  const router = useRouter()
  const { user } = useUserStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)

  const productId = router.params.id

  useDidShow(() => {
    if (productId) {
      loadProduct()
      loadProductImages()
    }
  })

  const loadProduct = async () => {
    try {
      const res = await Network.request({
        url: `/api/products/${productId}`,
      })

      if (res.data?.code === 200 && res.data?.data) {
        setProduct(res.data.data)
      }
    } catch (error) {
      console.error('[Detail] loadProduct error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProductImages = async () => {
    try {
      const res = await Network.request({
        url: `/api/products/${productId}/images`,
      })

      if (res.data?.code === 200 && res.data?.data) {
        setImages(res.data.data.map((img: any) => img.image_url))
      }
    } catch (error) {
      console.error('[Detail] loadProductImages error:', error)
    }
  }

  const handleAddToCart = async () => {
    if (!user?.id) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    setAddingToCart(true)
    try {
      const res = await Network.request({
        url: '/api/cart',
        method: 'POST',
        data: {
          userId: user.id,
          productId: productId,
          quantity: 1,
        },
      })

      if (res.data?.code === 200) {
        Taro.showToast({ title: '已加入购物车', icon: 'success' })
      } else {
        Taro.showToast({ title: '添加失败', icon: 'none' })
      }
    } catch (error) {
      console.error('[Detail] addToCart error:', error)
      Taro.showToast({ title: '添加失败', icon: 'none' })
    } finally {
      setAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    if (!user?.id) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    // 先加入购物车
    await handleAddToCart()
    
    // 跳转到购物车
    Taro.switchTab({ url: '/pages/cart/index' })
  }

  const handleContactService = () => {
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
  }

  const getTagStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-600'
      case 'warning':
        return 'bg-orange-50 text-orange-600'
      case 'error':
        return 'bg-red-50 text-red-600'
      default:
        return 'bg-blue-50 text-blue-600'
    }
  }

  if (loading) {
    return (
      <View className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Text className="text-gray-400">加载中...</Text>
      </View>
    )
  }

  if (!product) {
    return (
      <View className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Text className="text-4xl mb-4">📦</Text>
        <Text className="text-gray-500">商品不存在</Text>
      </View>
    )
  }

  return (
    <View className="min-h-screen bg-gray-50 pb-24">
      {/* 商品图片轮播 */}
      <View className="bg-white">
        <Image
          className="w-full h-80"
          src={product.main_image || images[0] || 'https://via.placeholder.com/400'}
          mode="aspectFill"
        />
      </View>

      <ScrollView scrollY className="flex-1">
        {/* 商品信息 */}
        <View className="bg-white px-4 py-4 mb-2">
          {/* 价格 */}
          <View className="flex flex-row items-baseline mb-3">
            <Text className="text-3xl font-bold text-orange-500 mr-2">
              ¥{product.price}
            </Text>
            {product.market_price && (
              <Text className="text-sm text-gray-400 line-through">
                市场价 ¥{product.market_price}
              </Text>
            )}
          </View>

          {/* 标题 */}
          <Text className="block text-lg font-semibold text-gray-900 mb-2">
            {product.name}
          </Text>

          {/* 品牌和分类 */}
          <Text className="block text-sm text-gray-500 mb-3">
            {product.brands?.name || ''} · {product.categories?.name || ''}
          </Text>

          {/* 标签 */}
          {product.tags && product.tags.length > 0 && (
            <View className="flex flex-row flex-wrap gap-2">
              {product.tags.map((tag: any, idx: number) => (
                <View
                  key={idx}
                  className={`px-2 py-1 rounded text-xs ${getTagStyle(tag.type)}`}
                >
                  {tag.label}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 技术参数 */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <View className="bg-white px-4 py-4 mb-2">
            <Text className="block text-base font-semibold text-gray-900 mb-3">
              技术参数
            </Text>
            <View className="space-y-2">
              {Object.entries(product.specs).map(([key, value]) => (
                <View key={key} className="flex flex-row justify-between py-2 border-b border-gray-100">
                  <Text className="text-gray-500 text-sm">{key}</Text>
                  <Text className="text-gray-900 text-sm">{value as string}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 商品描述 */}
        {product.description && (
          <View className="bg-white px-4 py-4 mb-2">
            <Text className="block text-base font-semibold text-gray-900 mb-3">
              商品描述
            </Text>
            <Text className="block text-sm text-gray-600 leading-relaxed">
              {product.description}
            </Text>
          </View>
        )}

        {/* 货源说明 */}
        {product.source_description && (
          <View className="bg-white px-4 py-4 mb-2">
            <Text className="block text-base font-semibold text-gray-900 mb-3">
              货源说明
            </Text>
            <Text className="block text-sm text-gray-600 leading-relaxed">
              {product.source_description}
            </Text>
          </View>
        )}

        {/* 服务说明 */}
        <View className="bg-white px-4 py-4 mb-2">
          <Text className="block text-base font-semibold text-gray-900 mb-3">
            服务说明
          </Text>
          <View className="space-y-2">
            <View className="flex flex-row items-center">
              <Text className="text-green-500 mr-2">✓</Text>
              <Text className="text-sm text-gray-600">正品保障，假一赔十</Text>
            </View>
            <View className="flex flex-row items-center">
              <Text className="text-green-500 mr-2">✓</Text>
              <Text className="text-sm text-gray-600">支持7天无理由退换货</Text>
            </View>
            <View className="flex flex-row items-center">
              <Text className="text-green-500 mr-2">✓</Text>
              <Text className="text-sm text-gray-600">18:00前下单当日发货</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 底部操作栏 */}
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
        {/* 客服 */}
        <View
          className="flex flex-col items-center mr-4"
          onClick={handleContactService}
        >
          <Text className="text-xl">💬</Text>
          <Text className="text-xs text-gray-600">客服</Text>
        </View>

        {/* 购物车 */}
        <View
          className="flex flex-col items-center mr-4"
          onClick={() => Taro.switchTab({ url: '/pages/cart/index' })}
        >
          <Text className="text-xl">🛒</Text>
          <Text className="text-xs text-gray-600">购物车</Text>
        </View>

        {/* 加入购物车 */}
        <View
          style={{ flex: 1, marginRight: '8px' }}
        >
          <Button
            className="w-full bg-orange-500 text-white rounded-full py-3"
            onClick={handleAddToCart}
            loading={addingToCart}
          >
            加入购物车
          </Button>
        </View>

        {/* 立即购买 */}
        <View style={{ flex: 1 }}>
          <Button
            className="w-full bg-blue-500 text-white rounded-full py-3"
            onClick={handleBuyNow}
          >
            立即购买
          </Button>
        </View>
      </View>
    </View>
  )
}

export default DetailPage
