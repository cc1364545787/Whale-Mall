import { create } from 'zustand'
import Taro from '@tarojs/taro'

interface User {
  id: string
  openid: string
  phone?: string
  nickname?: string
  avatar?: string
  audit_status: 'pending' | 'approved' | 'rejected'
  can_view_price: boolean
  role: string
}

interface ShopInfo {
  id: string
  shop_name: string
  contact_name?: string
  contact_phone?: string
  license_image_url?: string
  audit_remark?: string
}

interface UserState {
  user: User | null
  shopInfo: ShopInfo | null
  token: string | null
  isLoggedIn: boolean
  isApproved: boolean
  setUser: (user: User | null) => void
  setShopInfo: (shopInfo: ShopInfo | null) => void
  setToken: (token: string | null) => void
  logout: () => void
  loadUserFromStorage: () => Promise<void>
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  shopInfo: null,
  token: null,
  isLoggedIn: false,
  isApproved: false,

  setUser: (user) => set({ 
    user, 
    isLoggedIn: !!user,
    isApproved: user?.audit_status === 'approved'
  }),

  setShopInfo: (shopInfo) => set({ shopInfo }),

  setToken: (token) => {
    if (token) {
      Taro.setStorageSync('token', token)
    } else {
      Taro.removeStorageSync('token')
    }
    set({ token })
  },

  logout: () => {
    Taro.removeStorageSync('token')
    Taro.removeStorageSync('user')
    set({ 
      user: null, 
      shopInfo: null,
      token: null, 
      isLoggedIn: false,
      isApproved: false 
    })
  },

  loadUserFromStorage: async () => {
    try {
      const token = Taro.getStorageSync('token')
      const userData = Taro.getStorageSync('user')
      if (token && userData) {
        const user = JSON.parse(userData)
        set({ 
          token, 
          user,
          isLoggedIn: true,
          isApproved: user?.audit_status === 'approved'
        })
      }
    } catch (e) {
      console.error('Load user from storage error:', e)
    }
  },
}))
