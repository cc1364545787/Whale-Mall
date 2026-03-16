export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/login/index',
    'pages/audit/index',
    'pages/detail/index',
    'pages/cart/index',
    'pages/orders/index',
    'pages/order-detail/index',
    'pages/address/index',
    'pages/address-edit/index',
    'pages/profile/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '数码汇',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#1890ff',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: './assets/tabbar/home.png',
        selectedIconPath: './assets/tabbar/home-active.png',
      },
      {
        pagePath: 'pages/cart/index',
        text: '购物车',
        iconPath: './assets/tabbar/cart.png',
        selectedIconPath: './assets/tabbar/cart-active.png',
      },
      {
        pagePath: 'pages/orders/index',
        text: '订单',
        iconPath: './assets/tabbar/order.png',
        selectedIconPath: './assets/tabbar/order-active.png',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: './assets/tabbar/user.png',
        selectedIconPath: './assets/tabbar/user-active.png',
      },
    ],
  },
})
