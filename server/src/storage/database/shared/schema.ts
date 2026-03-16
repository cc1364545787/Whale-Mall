import { sql } from "drizzle-orm"
import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  decimal,
  jsonb,
  index,
  serial,
} from "drizzle-orm/pg-core"

// ============ 用户相关表 ============

// 用户表
export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    openid: varchar("openid", { length: 128 }).unique(),
    unionId: varchar("union_id", { length: 128 }),
    phone: varchar("phone", { length: 20 }),
    nickname: varchar("nickname", { length: 64 }),
    avatar: varchar("avatar", { length: 512 }),
    // 审核状态: pending-待审核, approved-已通过, rejected-已驳回
    auditStatus: varchar("audit_status", { length: 20 }).default("pending"),
    // 是否可以查看价格
    canViewPrice: boolean("can_view_price").default(false),
    // 角色: user-普通用户, admin-管理员, staff-员工
    role: varchar("role", { length: 20 }).default("user"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("users_openid_idx").on(table.openid),
    index("users_phone_idx").on(table.phone),
  ]
)

// 店铺/企业信息表
export const shopInfo = pgTable(
  "shop_info",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 }).notNull(),
    // 企业/门店名称
    shopName: varchar("shop_name", { length: 128 }).notNull(),
    // 联系人
    contactName: varchar("contact_name", { length: 64 }),
    // 联系电话
    contactPhone: varchar("contact_phone", { length: 20 }),
    // 营业执照图片 key
    licenseImageKey: varchar("license_image_key", { length: 256 }),
    // 营业执照图片 URL
    licenseImageUrl: varchar("license_image_url", { length: 512 }),
    // 审核备注
    auditRemark: text("audit_remark"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("shop_info_user_id_idx").on(table.userId),
  ]
)

// ============ 商品相关表 ============

// 分类表
export const categories = pgTable("categories", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 64 }).notNull(),
  icon: varchar("icon", { length: 256 }),
  sort: integer("sort").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

// 品牌表
export const brands = pgTable("brands", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 64 }).notNull(),
  logo: varchar("logo", { length: 256 }),
  sort: integer("sort").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

// 商品表
export const products = pgTable(
  "products",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    // 商品名称
    name: varchar("name", { length: 256 }).notNull(),
    // 品牌 ID
    brandId: varchar("brand_id", { length: 36 }),
    // 分类 ID
    categoryId: varchar("category_id", { length: 36 }),
    // 商品描述
    description: text("description"),
    // 调货价（B端价格）
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    // 市场参考价
    marketPrice: decimal("market_price", { precision: 10, scale: 2 }),
    // 库存
    stock: integer("stock").default(0),
    // 主图
    mainImage: varchar("main_image", { length: 512 }),
    // 属性标签 JSON: [{ label: "全新", type: "success" }, ...]
    tags: jsonb("tags"),
    // 技术参数 JSON: { "屏幕": "6.1英寸", "存储": "128GB", ... }
    specs: jsonb("specs"),
    // 货源描述
    sourceDescription: text("source_description"),
    // 货源地址（华强北某档口等，后台可见）
    sourceLocation: varchar("source_location", { length: 256 }),
    // 商品状态: active-上架, inactive-下架
    status: varchar("status", { length: 20 }).default("active"),
    // 是否推荐
    isFeatured: boolean("is_featured").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("products_brand_id_idx").on(table.brandId),
    index("products_category_id_idx").on(table.categoryId),
    index("products_status_idx").on(table.status),
  ]
)

// 商品图片表
export const productImages = pgTable(
  "product_images",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    productId: varchar("product_id", { length: 36 }).notNull(),
    imageUrl: varchar("image_url", { length: 512 }).notNull(),
    sort: integer("sort").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("product_images_product_id_idx").on(table.productId),
  ]
)

// ============ 交易相关表 ============

// 购物车表
export const cartItems = pgTable(
  "cart_items",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 }).notNull(),
    productId: varchar("product_id", { length: 36 }).notNull(),
    quantity: integer("quantity").default(1),
    // 记录加入时的价格
    price: decimal("price", { precision: 10, scale: 2 }),
    // 是否失效（商品下架等）
    isInvalid: boolean("is_invalid").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("cart_items_user_id_idx").on(table.userId),
    index("cart_items_product_id_idx").on(table.productId),
  ]
)

// 地址表
export const addresses = pgTable(
  "addresses",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 }).notNull(),
    // 收货人
    receiverName: varchar("receiver_name", { length: 64 }).notNull(),
    // 联系电话
    receiverPhone: varchar("receiver_phone", { length: 20 }).notNull(),
    // 省市区
    province: varchar("province", { length: 64 }),
    city: varchar("city", { length: 64 }),
    district: varchar("district", { length: 64 }),
    // 详细地址
    detailAddress: varchar("detail_address", { length: 256 }).notNull(),
    // 是否默认地址
    isDefault: boolean("is_default").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("addresses_user_id_idx").on(table.userId),
  ]
)

// 订单表
export const orders = pgTable(
  "orders",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    // 订单号
    orderNo: varchar("order_no", { length: 32 }).notNull().unique(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    // 收货地址 JSON
    addressSnapshot: jsonb("address_snapshot"),
    // 商品总价
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    // 运费
    shippingFee: decimal("shipping_fee", { precision: 10, scale: 2 }).default("0"),
    // 实付金额
    payAmount: decimal("pay_amount", { precision: 10, scale: 2 }).notNull(),
    // 订单状态: pending-待支付, paid-已支付, shipped-已发货, completed-已完成, cancelled-已取消
    status: varchar("status", { length: 20 }).default("pending"),
    // 支付状态
    payStatus: varchar("pay_status", { length: 20 }).default("unpaid"),
    // 支付时间
    paidAt: timestamp("paid_at", { withTimezone: true }),
    // 发货时间
    shippedAt: timestamp("shipped_at", { withTimezone: true }),
    // 物流公司
    logisticsCompany: varchar("logistics_company", { length: 64 }),
    // 物流单号
    logisticsNo: varchar("logistics_no", { length: 64 }),
    // 备注
    remark: text("remark"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("orders_user_id_idx").on(table.userId),
    index("orders_order_no_idx").on(table.orderNo),
    index("orders_status_idx").on(table.status),
  ]
)

// 订单商品表
export const orderItems = pgTable(
  "order_items",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    orderId: varchar("order_id", { length: 36 }).notNull(),
    productId: varchar("product_id", { length: 36 }).notNull(),
    // 商品快照
    productSnapshot: jsonb("product_snapshot"),
    quantity: integer("quantity").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("order_items_order_id_idx").on(table.orderId),
  ]
)

// ============ 售后相关表 ============

// 售后申请表
export const afterSales = pgTable(
  "after_sales",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    // 售后单号
    afterSaleNo: varchar("after_sale_no", { length: 32 }).notNull().unique(),
    orderId: varchar("order_id", { length: 36 }).notNull(),
    orderItemId: varchar("order_item_id", { length: 36 }),
    userId: varchar("user_id", { length: 36 }).notNull(),
    // 售后类型: return-退货, exchange-换货
    type: varchar("type", { length: 20 }).notNull(),
    // 原因
    reason: text("reason"),
    // 描述
    description: text("description"),
    // 图片证据
    images: jsonb("images"),
    // 状态: pending-待处理, approved-已同意, rejected-已拒绝, completed-已完成
    status: varchar("status", { length: 20 }).default("pending"),
    // 处理备注
    handleRemark: text("handle_remark"),
    // 退货运费承担方: platform-平台, customer-客户
    returnShippingBy: varchar("return_shipping_by", { length: 20 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("after_sales_user_id_idx").on(table.userId),
    index("after_sales_order_id_idx").on(table.orderId),
  ]
)

// ============ 系统保留表 ============

export const healthCheck = pgTable("health_check", {
  id: serial("id").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
})

// ============ 类型导出 ============

export type User = typeof users.$inferSelect
export type ShopInfo = typeof shopInfo.$inferSelect
export type Category = typeof categories.$inferSelect
export type Brand = typeof brands.$inferSelect
export type Product = typeof products.$inferSelect
export type ProductImage = typeof productImages.$inferSelect
export type CartItem = typeof cartItems.$inferSelect
export type Address = typeof addresses.$inferSelect
export type Order = typeof orders.$inferSelect
export type OrderItem = typeof orderItems.$inferSelect
export type AfterSale = typeof afterSales.$inferSelect
