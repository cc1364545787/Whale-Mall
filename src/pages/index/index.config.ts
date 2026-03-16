export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '数码汇',
      enablePullDownRefresh: true,
      backgroundTextStyle: 'dark',
    })
  : {
      navigationBarTitleText: '数码汇',
      enablePullDownRefresh: true,
      backgroundTextStyle: 'dark',
    }
