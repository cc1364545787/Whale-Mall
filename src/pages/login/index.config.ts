export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '登录',
      navigationBarBackgroundColor: '#1890ff',
      navigationBarTextStyle: 'white',
    })
  : {
      navigationBarTitleText: '登录',
      navigationBarBackgroundColor: '#1890ff',
      navigationBarTextStyle: 'white',
    }
