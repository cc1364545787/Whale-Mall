export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '编辑地址',
    })
  : {
      navigationBarTitleText: '编辑地址',
    }
