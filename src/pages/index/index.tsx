import { View, Text, Image, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import Taro, { useDidShow, usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import './index.css'

interface Product {
  id: string
  name: string
  price: string
  market_price: string
  main_image: string
  tags: Array<{ label: string; type: string }>
  brands?: { name: string }
  categories?: { name: string }
}

interface Category {
  id: string
  name: string
  icon: string
}

interface Brand {
  id: string
  name: string
  logo: string
}

const IndexPage = () => {
  const { isLoggedIn, isApproved } = useUserStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [activeBrand, setActiveBrand] = useState<string>('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useDidShow(() => {
    checkLoginStatus()
    loadCategories()
    loadBrands()
    loadProducts(true)
  })

  usePullDownRefresh(() => {
    loadProducts(true).then(() => {
      Taro.stopPullDownRefresh()
    })
  })

  useReachBottom(() => {
    if (hasMore && !loading) {
      loadProducts(false)
    }
  })

  const checkLoginStatus = () => {
    if (!isLoggedIn) {
      Taro.redirectTo({ url: '/pages/login/index' })
      return
    }
    if (!isApproved) {
      Taro.redirectTo({ url: '/pages/audit/index' })
    }
  }

  const loadCategories = async () => {
    try {
      const res = await Network.request({ url: '/api/products/categories' })
      if (res.data?.code === 200 && res.data?.data) {
        setCategories(res.data.data)
      }
    } catch (error) {
      console.error('[Index] loadCategories error:', error)
    }
  }

  const loadBrands = async () => {
    try {
      const res = await Network.request({ url: '/api/products/brands' })
      if (res.data?.code === 200 && res.data?.data) {
        setBrands(res.data.data)
      }
    } catch (error) {
      console.error('[Index] loadBrands error:', error)
    }
  }

  const loadProducts = async (refresh: boolean = false) => {
    if (loading) return
    setLoading(true)

    try {
      const currentPage = refresh ? 1 : page
      const res = await Network.request({
        url: '/api/products',
        data: {
          categoryId: activeCategory || undefined,
          brandId: activeBrand || undefined,
          page: currentPage,
          pageSize: 10,
        },
      })

      console.log('[Index] loadProducts response:', res.data)

      if (res.data?.code === 200 && res.data?.data) {
        const { list, total: totalCount } = res.data.data
        if (refresh) {
          setProducts(list || [])
        } else {
          setProducts(prev => [...prev, ...(list || [])])
        }
        setTotal(totalCount || 0)
        setPage(currentPage + 1)
        setHasMore((list?.length || 0) >= 10)
      }
    } catch (error) {
      console.error('[Index] loadProducts error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(activeCategory === categoryId ? '' : categoryId)
    setPage(1)
    setTimeout(() => loadProducts(true), 100)
  }

  const handleBrandClick = (brandId: string) => {
    setActiveBrand(activeBrand === brandId ? '' : brandId)
    setPage(1)
    setTimeout(() => loadProducts(true), 100)
  }

  const handleProductClick = (productId: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${productId}` })
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

  return (
    <View className="min-h-screen bg-gray-50">
      {/* 搜索栏 */}
      <View className="bg-white px-4 py-3">
        <View
          className="bg-gray-100 rounded-full px-4 py-2 flex flex-row items-center"
          onClick={() => Taro.showToast({ title: '搜索功能开发中', icon: 'none' })}
        >
          <Text className="text-gray-400 mr-2">🔍</Text>
          <Text className="text-gray-400 text-sm">搜索商品、品牌...</Text>
        </View>
      </View>

      <ScrollView scrollY className="h-screen">
        {/* 分类区域 */}
        <View className="bg-white px-4 py-4 mb-2">
          <Text className="block text-sm font-semibold text-gray-900 mb-3">商品分类</Text>
          <ScrollView scrollX className="whitespace-nowrap">
            <View className="flex flex-row gap-3">
              <View
                className={`flex flex-col items-center min-w-16 ${
                  activeCategory === '' ? 'opacity-100' : 'opacity-60'
                }`}
                onClick={() => handleCategoryClick('')}
              >
                <View
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                    activeCategory === '' ? 'bg-blue-500' : 'bg-gray-100'
                  }`}
                >
                  <Text className="text-lg">📦</Text>
                </View>
                <Text className={`text-xs ${activeCategory === '' ? 'text-blue-500 font-medium' : 'text-gray-600'}`}>
                  全部
                </Text>
              </View>
              {categories.map(cat => (
                <View
                  key={cat.id}
                  className={`flex flex-col items-center min-w-16 ${
                    activeCategory === cat.id ? 'opacity-100' : 'opacity-60'
                  }`}
                  onClick={() => handleCategoryClick(cat.id)}
                >
                  <View
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                      activeCategory === cat.id ? 'bg-blue-500' : 'bg-gray-100'
                    }`}
                  >
                    <Text className="text-lg">{cat.icon || '📱'}</Text>
                  </View>
                  <Text className={`text-xs ${activeCategory === cat.id ? 'text-blue-500 font-medium' : 'text-gray-600'}`}>
                    {cat.name}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* 品牌筛选 */}
        <View className="bg-white px-4 py-4 mb-2">
          <Text className="block text-sm font-semibold text-gray-900 mb-3">品牌筛选</Text>
          <View className="flex flex-row flex-wrap gap-2">
            <View
              className={`px-3 py-1.5 rounded-full text-xs ${
                activeBrand === '' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
              onClick={() => handleBrandClick('')}
            >
              全部品牌
            </View>
            {brands.map(brand => (
              <View
                key={brand.id}
                className={`px-3 py-1.5 rounded-full text-xs ${
                  activeBrand === brand.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => handleBrandClick(brand.id)}
              >
                {brand.name}
              </View>
            ))}
          </View>
        </View>

        {/* 商品列表 */}
        <View className="px-4 py-4">
          <View className="flex flex-row justify-between items-center mb-4">
            <Text className="block text-sm font-semibold text-gray-900">
              商品列表
            </Text>
            <Text className="block text-xs text-gray-500">
              共 {total} 件商品
            </Text>
          </View>

          <View className="flex flex-row flex-wrap gap-3">
            {products.map(product => (
              <View
                key={product.id}
                className="w-[calc(50%-6px)] bg-white rounded-xl overflow-hidden shadow-sm"
                onClick={() => handleProductClick(product.id)}
              >
                <Image
                  className="w-full h-40"
                  src={product.main_image || 'https://via.placeholder.com/200'}
                  mode="aspectFill"
                />
                <View className="p-3">
                  <Text className="block text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </Text>
                  <Text className="block text-xs text-gray-500 mt-1">
                    {product.brands?.name || ''} · {product.categories?.name || ''}
                  </Text>
                  
                  {/* 标签 */}
                  {product.tags && product.tags.length > 0 && (
                    <View className="flex flex-row flex-wrap gap-1 mt-2">
                      {product.tags.slice(0, 2).map((tag: any, idx: number) => (
                        <View
                          key={idx}
                          className={`px-1.5 py-0.5 rounded text-xs ${getTagStyle(tag.type)}`}
                        >
                          {tag.label}
                        </View>
                      ))}
                    </View>
                  )}

                  <View className="flex flex-row items-center justify-between mt-2">
                    <Text className="text-lg font-bold text-orange-500">
                      ¥{product.price}
                    </Text>
                    {product.market_price && (
                      <Text className="text-xs text-gray-400 line-through">
                        ¥{product.market_price}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* 加载更多 */}
          {loading && (
            <View className="flex items-center justify-center py-6">
              <Text className="text-gray-400 text-sm">加载中...</Text>
            </View>
          )}

          {!hasMore && products.length > 0 && (
            <View className="flex items-center justify-center py-6">
              <Text className="text-gray-400 text-sm">没有更多商品了</Text>
            </View>
          )}

          {!loading && products.length === 0 && (
            <View className="flex flex-col items-center justify-center py-20">
              <Text className="text-4xl mb-4">📦</Text>
              <Text className="text-gray-500">暂无商品</Text>
            </View>
          )}
        </View>

        {/* 底部安全区 */}
        <View className="h-20" />
      </ScrollView>
    </View>
  )
}

export default IndexPage
