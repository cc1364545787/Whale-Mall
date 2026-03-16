import { View, Text, Button, Input } from '@tarojs/components'
import { useState } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import './index.css'

const AddressEditPage = () => {
  const router = useRouter()
  const { user } = useUserStore()
  const [isEdit, setIsEdit] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    receiverName: '',
    receiverPhone: '',
    province: '',
    city: '',
    district: '',
    detailAddress: '',
    isDefault: false,
  })

  const addressId = router.params.id

  useDidShow(() => {
    if (addressId) {
      setIsEdit(true)
      loadAddress()
    }
  })

  const loadAddress = async () => {
    try {
      const res = await Network.request({
        url: `/api/addresses/${addressId}`,
      })

      if (res.data?.code === 200 && res.data?.data) {
        const addr = res.data.data
        setFormData({
          receiverName: addr.receiver_name,
          receiverPhone: addr.receiver_phone,
          province: addr.province || '',
          city: addr.city || '',
          district: addr.district || '',
          detailAddress: addr.detail_address,
          isDefault: addr.is_default,
        })
      }
    } catch (error) {
      console.error('[AddressEdit] loadAddress error:', error)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRegionChange = () => {
    // 简化处理，实际应使用地区选择器
    Taro.showActionSheet({
      itemList: ['广东省深圳市南山区', '广东省广州市天河区', '北京市朝阳区'],
      success: (res) => {
        const regions = ['广东省深圳市南山区', '广东省广州市天河区', '北京市朝阳区']
        const selected = regions[res.tapIndex]
        setFormData(prev => ({
          ...prev,
          province: selected.split('省')[0] + '省',
          city: selected.split('省')[1].split('市')[0] + '市',
          district: selected.split('市')[1],
        }))
      },
    })
  }

  const handleSave = async () => {
    // 表单验证
    if (!formData.receiverName.trim()) {
      Taro.showToast({ title: '请输入收货人姓名', icon: 'none' })
      return
    }
    if (!formData.receiverPhone.trim()) {
      Taro.showToast({ title: '请输入手机号码', icon: 'none' })
      return
    }
    if (!/^1[3-9]\d{9}$/.test(formData.receiverPhone)) {
      Taro.showToast({ title: '请输入正确的手机号码', icon: 'none' })
      return
    }
    if (!formData.detailAddress.trim()) {
      Taro.showToast({ title: '请输入详细地址', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      const data = {
        userId: user?.id,
        receiverName: formData.receiverName,
        receiverPhone: formData.receiverPhone,
        province: formData.province,
        city: formData.city,
        district: formData.district,
        detailAddress: formData.detailAddress,
        isDefault: formData.isDefault,
      }

      let res
      if (isEdit) {
        res = await Network.request({
          url: `/api/addresses/${addressId}`,
          method: 'PUT',
          data,
        })
      } else {
        res = await Network.request({
          url: '/api/addresses',
          method: 'POST',
          data,
        })
      }

      if (res.data?.code === 200) {
        Taro.showToast({ title: '保存成功', icon: 'success' })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1000)
      } else {
        Taro.showToast({ title: '保存失败', icon: 'none' })
      }
    } catch (error) {
      console.error('[AddressEdit] save error:', error)
      Taro.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="min-h-screen bg-gray-50">
      {/* 表单 */}
      <View className="bg-white p-4">
        {/* 收货人 */}
        <View className="flex flex-row items-center py-3 border-b border-gray-100">
          <Text className="w-20 text-sm text-gray-600">收货人</Text>
          <View className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
            <Input
              className="w-full bg-transparent text-sm"
              placeholder="请输入收货人姓名"
              value={formData.receiverName}
              onInput={(e) => handleInputChange('receiverName', e.detail.value)}
            />
          </View>
        </View>

        {/* 手机号 */}
        <View className="flex flex-row items-center py-3 border-b border-gray-100">
          <Text className="w-20 text-sm text-gray-600">手机号</Text>
          <View className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
            <Input
              className="w-full bg-transparent text-sm"
              placeholder="请输入手机号码"
              type="number"
              maxlength={11}
              value={formData.receiverPhone}
              onInput={(e) => handleInputChange('receiverPhone', e.detail.value)}
            />
          </View>
        </View>

        {/* 所在地区 */}
        <View
          className="flex flex-row items-center py-3 border-b border-gray-100"
          onClick={handleRegionChange}
        >
          <Text className="w-20 text-sm text-gray-600">所在地区</Text>
          <View className="flex-1 flex flex-row items-center justify-between">
            <Text className={`text-sm ${formData.province ? 'text-gray-900' : 'text-gray-400'}`}>
              {formData.province
                ? `${formData.province}${formData.city}${formData.district}`
                : '请选择省市区'}
            </Text>
            <Text className="text-gray-400">{'>'}</Text>
          </View>
        </View>

        {/* 详细地址 */}
        <View className="flex flex-row items-start py-3">
          <Text className="w-20 text-sm text-gray-600 mt-2">详细地址</Text>
          <View className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
            <Input
              className="w-full bg-transparent text-sm"
              placeholder="请输入详细地址（街道、门牌号等）"
              value={formData.detailAddress}
              onInput={(e) => handleInputChange('detailAddress', e.detail.value)}
            />
          </View>
        </View>
      </View>

      {/* 设为默认 */}
      <View className="bg-white px-4 py-4 mt-2">
        <View
          className="flex flex-row items-center justify-between"
          onClick={() => handleInputChange('isDefault', !formData.isDefault)}
        >
          <Text className="text-sm text-gray-700">设为默认收货地址</Text>
          <View
            className={`w-12 h-6 rounded-full flex items-center px-1 ${
              formData.isDefault ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <View
              className={`w-4 h-4 bg-white rounded-full transition-transform ${
                formData.isDefault ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </View>
        </View>
      </View>

      {/* 保存按钮 */}
      <View className="px-4 mt-8">
        <Button
          className="w-full bg-blue-500 text-white rounded-xl py-3"
          onClick={handleSave}
          loading={loading}
          disabled={loading}
        >
          保存
        </Button>
      </View>
    </View>
  )
}

export default AddressEditPage
