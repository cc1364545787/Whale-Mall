# 数码汇 - B端二手数码交易平台设计指南

## 品牌定位

- **应用名称**: 数码汇
- **定位**: B端同行门店二手数码产品调货平台
- **设计风格**: 专业商务、简洁高效、信任感强
- **目标用户**: 二手数码门店老板、采购人员（需营业执照准入）

## 配色方案

### 主色板（商务蓝）
- **主色**: `#1890ff` - `bg-blue-500` / `text-blue-500`
- **主色深**: `#096dd9` - `bg-blue-600` / `text-blue-600`
- **主色浅**: `#40a9ff` - `bg-blue-400` / `text-blue-400`

### 中性色
- **标题**: `#1a1a1a` - `text-gray-900`
- **正文**: `#333333` - `text-gray-800`
- **次要文字**: `#666666` - `text-gray-600`
- **辅助文字**: `#999999` - `text-gray-500`
- **禁用/占位**: `#cccccc` - `text-gray-400`
- **边框/分割**: `#e5e5e5` - `border-gray-200`
- **背景灰**: `#f5f5f5` - `bg-gray-100`
- **白色背景**: `#ffffff` - `bg-white`

### 语义色
- **成功/盈利**: `#52c41a` - `text-green-500`
- **警告/价格**: `#fa8c16` - `text-orange-500`
- **错误/降**: `#ff4d4f` - `text-red-500`
- **信息**: `#1890ff` - `text-blue-500`

## 字体规范

| 层级 | 字号 | 字重 | 用途 |
|------|------|------|------|
| H1 | `text-2xl` (24px) | `font-bold` | 页面标题 |
| H2 | `text-xl` (20px) | `font-semibold` | 模块标题 |
| H3 | `text-lg` (18px) | `font-semibold` | 卡片标题 |
| Body | `text-base` (16px) | `font-normal` | 正文内容 |
| Small | `text-sm` (14px) | `font-normal` | 辅助信息 |
| Caption | `text-xs` (12px) | `font-normal` | 标签、时间 |

## 间距系统

- **页面边距**: `px-4` (16px)
- **模块间距**: `mb-6` (24px)
- **卡片内边距**: `p-4` (16px)
- **列表项间距**: `gap-3` (12px)
- **元素间距**: `gap-2` (8px)

## 组件规范

### 按钮样式

```tsx
// 主按钮
<Button className="w-full bg-blue-500 text-white rounded-lg py-3 font-medium">
  立即登录
</Button>

// 次按钮
<Button className="w-full bg-white border border-gray-300 text-gray-700 rounded-lg py-3 font-medium">
  取消
</Button>

// 禁用态
<Button className="w-full bg-gray-300 text-gray-500 rounded-lg py-3 font-medium" disabled>
  不可用
</Button>

// 小按钮
<Button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">
  确认
</Button>
```

### 卡片容器

```tsx
<View className="bg-white rounded-xl p-4 shadow-sm">
  {/* 内容 */}
</View>
```

### 输入框

```tsx
// 使用 View 包裹（H5 兼容）
<View className="bg-gray-50 rounded-lg px-4 py-3">
  <Input className="w-full bg-transparent text-base" placeholder="请输入" />
</View>
```

### 商品卡片

```tsx
<View className="bg-white rounded-xl overflow-hidden shadow-sm">
  <Image className="w-full h-40" src={image} mode="aspectFill" />
  <View className="p-3">
    <Text className="block text-base font-medium text-gray-900 truncate">{name}</Text>
    <Text className="block text-sm text-gray-500 mt-1">{brand} · {category}</Text>
    <View className="flex flex-row items-center justify-between mt-2">
      <Text className="text-lg font-bold text-orange-500">¥{price}</Text>
      <Text className="text-xs text-green-500 bg-green-50 px-2 py-1 rounded">可调货</Text>
    </View>
  </View>
</View>
```

### 状态标签

```tsx
// 审核状态
<Text className="text-xs px-2 py-1 rounded bg-orange-50 text-orange-500">待审核</Text>
<Text className="text-xs px-2 py-1 rounded bg-green-50 text-green-500">已通过</Text>
<Text className="text-xs px-2 py-1 rounded bg-red-50 text-red-500">已驳回</Text>

// 订单状态
<Text className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-500">待支付</Text>
<Text className="text-xs px-2 py-1 rounded bg-orange-50 text-orange-500">待发货</Text>
<Text className="text-xs px-2 py-1 rounded bg-purple-50 text-purple-500">待收货</Text>
<Text className="text-xs px-2 py-1 rounded bg-green-50 text-green-500">已完成</Text>
```

### 空状态组件

```tsx
<View className="flex flex-col items-center justify-center py-20">
  <Image className="w-24 h-24" src={emptyIcon} />
  <Text className="block text-gray-500 mt-4">暂无数据</Text>
</View>
```

## 导航结构

### TabBar 配置

```typescript
// app.config.ts
tabBar: {
  color: '#999999',
  selectedColor: '#1890ff',
  backgroundColor: '#ffffff',
  borderStyle: 'black',
  list: [
    { pagePath: 'pages/index/index', text: '首页', iconPath: './assets/tabbar/home.png', selectedIconPath: './assets/tabbar/home-active.png' },
    { pagePath: 'pages/cart/index', text: '购物车', iconPath: './assets/tabbar/cart.png', selectedIconPath: './assets/tabbar/cart-active.png' },
    { pagePath: 'pages/orders/index', text: '订单', iconPath: './assets/tabbar/order.png', selectedIconPath: './assets/tabbar/order-active.png' },
    { pagePath: 'pages/profile/index', text: '我的', iconPath: './assets/tabbar/user.png', selectedIconPath: './assets/tabbar/user-active.png' }
  ]
}
```

### 页面跳转规范

- TabBar 页面跳转: `Taro.switchTab({ url: '/pages/index/index' })`
- 普通页面跳转: `Taro.navigateTo({ url: '/pages/detail/index?id=1' })`
- 返回上一页: `Taro.navigateBack()`

## 小程序约束

### 包体积优化
- 图片使用 CDN 链接或对象存储
- 避免使用大型第三方库
- 按需加载组件

### 性能优化
- 列表使用 `ScrollView` + 虚拟列表
- 图片使用 `mode="aspectFill"` + 懒加载
- 避免深层嵌套和频繁 setState

### 跨端兼容
- 所有垂直 Text 添加 `block` 类
- Input/Button 使用 View 包裹
- Fixed 定位使用 inline style
- 检测平台做原生组件降级

## 页面清单

### 主要页面
1. **登录页** `/pages/login/index` - 微信授权、手机号绑定
2. **审核页** `/pages/audit/index` - 企业信息填写、营业执照上传、状态查看
3. **首页** `/pages/index/index` - 商品列表、分类筛选、搜索
4. **商品详情** `/pages/detail/index` - 商品信息、属性标签、客服咨询
5. **购物车** `/pages/cart/index` - 商品管理、结算
6. **订单列表** `/pages/orders/index` - 订单状态筛选
7. **订单详情** `/pages/order-detail/index` - 物流追踪、售后申请
8. **地址管理** `/pages/address/index` - 地址增删改查
9. **个人中心** `/pages/profile/index` - 资料修改、退出登录

### 辅助页面
10. **搜索页** `/pages/search/index` - 搜索结果
11. **售后申请** `/pages/after-sale/index` - 售后流程
