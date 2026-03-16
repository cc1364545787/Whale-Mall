export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '收货地址',
    })
  : {
      navigationBarTitleText: '收货地址',
    }
