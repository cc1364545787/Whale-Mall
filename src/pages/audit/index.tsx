import { View, Text, Image, Button, Input } from '@tarojs/components'
import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import './index.css'

const AuditPage = () => {
  const { user, shopInfo, setShopInfo, setUser } = useUserStore()
  const [step, setStep] = useState(1) // 1: 企业信息 2: 营业执照 3: 状态查看
  const [loading, setLoading] = useState(false)

  // 表单数据
  const [formData, setFormData] = useState({
    shopName: '',
    contactName: '',
    contactPhone: '',
  })
  const [licenseImageKey, setLicenseImageKey] = useState('')
  const [licenseImageUrl, setLicenseImageUrl] = useState('')

  useDidShow(() => {
    // if (!user) {
    //   Taro.redirectTo({ url: '/pages/login/index' })
    //   return
    // }

    // if (user.audit_status === 'approved') {
    //   Taro.switchTab({ url: '/pages/index/index' })
    //   return
    // }
    
    // Taro.switchTab({ url: '/pages/index/index' })

    loadShopInfo()
  })

  const loadShopInfo = async () => {
    if (!user?.id) return

    try {
      const res = await Network.request({
        url: `/api/users/shop/${user.id}`,
      })

      if (res.data?.code === 200 && res.data?.data) {
        const shop = res.data.data
        setShopInfo(shop)
        setFormData({
          shopName: shop.shop_name || '',
          contactName: shop.contact_name || '',
          contactPhone: shop.contact_phone || '',
        })
        if (shop.license_image_url) {
          setLicenseImageUrl(shop.license_image_url)
          setLicenseImageKey(shop.license_image_key)
        }
        if (shop.shop_name) {
          setStep(3) // 已提交，查看状态
        }
      }
    } catch (error) {
      console.error('[Audit] loadShopInfo error:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNextStep = () => {
    if (!formData.shopName.trim()) {
      Taro.showToast({ title: '请输入企业名称', icon: 'none' })
      return
    }
    if (!formData.contactName.trim()) {
      Taro.showToast({ title: '请输入联系人', icon: 'none' })
      return
    }
    if (!formData.contactPhone.trim()) {
      Taro.showToast({ title: '请输入联系电话', icon: 'none' })
      return
    }
    setStep(2)
  }

  const handleChooseLicense = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      })

      const tempFilePath = res.tempFilePaths[0]
      Taro.showToast({ title: '上传中...', icon: 'loading' })

      const uploadRes = await Network.uploadFile({
        url: '/api/upload',
        filePath: tempFilePath,
        name: 'file',
      })

      const uploadData = typeof uploadRes.data === 'string' ? JSON.parse(uploadRes.data) : uploadRes.data
      if (uploadData?.code === 200 && uploadData?.data) {
        setLicenseImageKey(uploadData.data.key)
        setLicenseImageUrl(uploadData.data.url)
        Taro.showToast({ title: '上传成功', icon: 'success' })
      } else {
        Taro.showToast({ title: '上传失败', icon: 'none' })
      }
    } catch (error) {
      console.error('[Audit] chooseImage error:', error)
      Taro.showToast({ title: '上传失败', icon: 'none' })
    }
  }

  const handleSubmit = async () => {
    // --- 已注释：取消营业执照上传限制 ---
    // if (!licenseImageUrl) {
    //   Taro.showToast({ title: '请上传营业执照', icon: 'none' })
    //   return
    // }

    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/users/shop',
        method: 'POST',
        data: {
          userId: user?.id,
          shopName: formData.shopName,
          contactName: formData.contactName,
          contactPhone: formData.contactPhone,
          licenseImageKey: licenseImageKey || 'skip_test_key', // 填充占位符
          licenseImageUrl: licenseImageUrl || 'skip_test_url', // 填充占位符
        },
      })

      if (res.data?.code === 200) {
        // 更新用户状态为待审核
        await Network.request({
          url: `/api/users/${user?.id}`,
          method: 'PUT',
          data: { audit_status: 'pending' },
        })

        setUser({ ...user!, audit_status: 'pending' })
        Taro.setStorageSync('user', JSON.stringify({ ...user, audit_status: 'pending' }))
        
        Taro.showToast({ title: '提交成功', icon: 'success' })
        setTimeout(() => {
          setStep(3)
        }, 1000)
      } else {
        Taro.showToast({ title: '提交失败', icon: 'none' })
      }
    } catch (error) {
      console.error('[Audit] submit error:', error)
      Taro.showToast({ title: '提交失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = () => {
    switch (user?.audit_status) {
      case 'pending':
        return {
          icon: '⏳',
          title: '审核中',
          desc: '您的资质正在审核中，请耐心等待',
          color: 'text-orange-500',
          bgColor: 'bg-orange-50',
        }
      case 'approved':
        return {
          icon: '✅',
          title: '审核通过',
          desc: '恭喜！您已成为平台认证商家',
          color: 'text-green-500',
          bgColor: 'bg-green-50',
        }
      case 'rejected':
        return {
          icon: '❌',
          title: '审核未通过',
          desc: shopInfo?.audit_remark || '请检查资质信息后重新提交',
          color: 'text-red-500',
          bgColor: 'bg-red-50',
        }
      default:
        return {
          icon: '📝',
          title: '待提交',
          desc: '请完善企业信息并上传营业执照',
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
        }
    }
  }

  const statusInfo = getStatusInfo()

  // 状态查看页
  if (step === 3) {
    return (
      <View className="min-h-screen bg-gray-50 px-4 py-6">
        {/* 状态卡片 */}
        <View className={`${statusInfo.bgColor} rounded-2xl p-6 mb-6`}>
          <View className="flex flex-col items-center">
            <Text className="text-5xl mb-3">{statusInfo.icon}</Text>
            <Text className={`block text-xl font-bold ${statusInfo.color} mb-2`}>
              {statusInfo.title}
            </Text>
            <Text className="block text-gray-600 text-center text-sm">
              {statusInfo.desc}
            </Text>
          </View>
        </View>

        {/* 企业信息 */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="block text-base font-semibold text-gray-900 mb-4">
            企业信息
          </Text>
          <View className="space-y-3">
            <View className="flex flex-row justify-between">
              <Text className="text-gray-500">企业名称</Text>
              <Text className="text-gray-900">{formData.shopName}</Text>
            </View>
            <View className="flex flex-row justify-between">
              <Text className="text-gray-500">联系人</Text>
              <Text className="text-gray-900">{formData.contactName}</Text>
            </View>
            <View className="flex flex-row justify-between">
              <Text className="text-gray-500">联系电话</Text>
              <Text className="text-gray-900">{formData.contactPhone}</Text>
            </View>
          </View>
        </View>

        {/* 营业执照 */}
        <View className="bg-white rounded-xl p-4">
          <Text className="block text-base font-semibold text-gray-900 mb-4">
            营业执照
          </Text>
          {licenseImageUrl && licenseImageUrl !== 'skip_test_url' ? (
            <Image
              className="w-full h-48 rounded-lg"
              src={licenseImageUrl}
              mode="aspectFit"
            />
          ) : (
            <View className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <Text className="text-gray-400">测试阶段：未上传图片</Text>
            </View>
          )}
        </View>

        {/* 操作按钮 */}
        {user?.audit_status === 'rejected' && (
          <View className="mt-6">
            <Button
              className="w-full bg-blue-500 text-white rounded-xl py-3"
              onClick={() => setStep(1)}
            >
              重新提交
            </Button>
          </View>
        )}
      </View>
    )
  }

  // 企业信息填写页
  if (step === 1) {
    return (
      <View className="min-h-screen bg-gray-50 px-4 py-6">
        <View className="bg-white rounded-xl p-4">
          <Text className="block text-base font-semibold text-gray-900 mb-6">
            填写企业信息
          </Text>

          {/* 企业名称 */}
          <View className="mb-4">
            <Text className="block text-sm text-gray-600 mb-2">
              企业/门店名称 <Text className="text-red-500">*</Text>
            </Text>
            <View className="bg-gray-50 rounded-lg px-4 py-3">
              <Input
                className="w-full bg-transparent text-base"
                placeholder="请输入营业执照上的企业名称"
                value={formData.shopName}
                onInput={(e) => handleInputChange('shopName', e.detail.value)}
              />
            </View>
          </View>

          {/* 联系人 */}
          <View className="mb-4">
            <Text className="block text-sm text-gray-600 mb-2">
              联系人 <Text className="text-red-500">*</Text>
            </Text>
            <View className="bg-gray-50 rounded-lg px-4 py-3">
              <Input
                className="w-full bg-transparent text-base"
                placeholder="请输入联系人姓名"
                value={formData.contactName}
                onInput={(e) => handleInputChange('contactName', e.detail.value)}
              />
            </View>
          </View>

          {/* 联系电话 */}
          <View className="mb-6">
            <Text className="block text-sm text-gray-600 mb-2">
              联系电话 <Text className="text-red-500">*</Text>
            </Text>
            <View className="bg-gray-50 rounded-lg px-4 py-3">
              <Input
                className="w-full bg-transparent text-base"
                placeholder="请输入联系电话"
                type="number"
                value={formData.contactPhone}
                onInput={(e) => handleInputChange('contactPhone', e.detail.value)}
              />
            </View>
          </View>

          <Button
            className="w-full bg-blue-500 text-white rounded-xl py-3"
            onClick={handleNextStep}
          >
            下一步
          </Button>
        </View>
      </View>
    )
  }

  // 营业执照上传页
  return (
    <View className="min-h-screen bg-gray-50 px-4 py-6">
      <View className="bg-white rounded-xl p-4">
        <Text className="block text-base font-semibold text-gray-900 mb-6">
          上传营业执照
        </Text>

        {/* 上传区域 */}
        <View
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center mb-4 overflow-hidden"
          onClick={handleChooseLicense}
        >
          {licenseImageUrl && licenseImageUrl !== 'skip_test_url' ? (
            <Image
              className="w-full h-full"
              src={licenseImageUrl}
              mode="aspectFit"
            />
          ) : (
            <>
              <Text className="text-4xl mb-2">📷</Text>
              <Text className="text-gray-500">直接点击“提交审核”即可跳过</Text>
              <Text className="text-gray-400 text-xs mt-1">
                (测试阶段可选上传)
              </Text>
            </>
          )}
        </View>

        <Text className="block text-gray-500 text-xs mb-6 text-center">
          请确保营业执照清晰完整，信息可辨认
        </Text>

        <View className="flex flex-row gap-3">
          <Button
            className="flex-1 bg-white border border-gray-300 text-gray-700 rounded-xl py-3"
            onClick={() => setStep(1)}
          >
            上一步
          </Button>
          <Button
            className="flex-1 bg-blue-500 text-white rounded-xl py-3"
            onClick={handleSubmit}
            loading={loading}
            disabled={loading}
          >
            提交审核
          </Button>
        </View>
      </View>
    </View>
  )
}

export default AuditPage