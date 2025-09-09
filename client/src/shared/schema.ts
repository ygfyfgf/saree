import { pgTable, text, uuid, timestamp, boolean, integer, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: text("password").notNull(), // تمت الإضافة
  name: text("name").notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  address: text("address"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User addresses table
export const userAddresses = pgTable("user_addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // تمت الإضافة: home, work, other
  title: varchar("title", { length: 100 }).notNull(),
  address: text("address").notNull(),
  details: text("details"), // تمت الإضافة
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Categories table
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 100 }).notNull(), // تم تغيير إلى notNull
  isActive: boolean("is_active").default(true).notNull(),
});

// Restaurants table
export const restaurants = pgTable("restaurants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  image: text("image").notNull(), // تم تغيير إلى notNull
  rating: varchar("rating", { length: 10 }).default("0.0"),
  reviewCount: integer("review_count").default(0),
  deliveryTime: varchar("delivery_time", { length: 50 }).notNull(), // تم تغيير إلى notNull
  isOpen: boolean("is_open").default(true).notNull(),
  minimumOrder: decimal("minimum_order", { precision: 10, scale: 2 }).default("0"),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).default("0"),
  categoryId: uuid("category_id").references(() => categories.id),
  openingTime: varchar("opening_time", { length: 50 }).default("08:00"), // تمت الإضافة
  closingTime: varchar("closing_time", { length: 50 }).default("23:00"), // تمت الإضافة
  workingDays: varchar("working_days", { length: 50 }).default("0,1,2,3,4,5,6"), // تمت الإضافة
  isTemporarilyClosed: boolean("is_temporarily_closed").default(false), // تمت الإضافة
  temporaryCloseReason: text("temporary_close_reason"), // تمت الإضافة
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Menu items table
export const menuItems = pgTable("menu_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  image: text("image").notNull(), // تم تغيير إلى notNull
  category: varchar("category", { length: 100 }).notNull(), // تم تغيير إلى notNull
  isAvailable: boolean("is_available").default(true).notNull(),
  isSpecialOffer: boolean("is_special_offer").default(false).notNull(),
  restaurantId: uuid("restaurant_id").references(() => restaurants.id),
});

// Drivers table
export const drivers = pgTable("drivers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  password: text("password").notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  currentLocation: varchar("current_location", { length: 200 }),
  earnings: decimal("earnings", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Orders table
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerName: varchar("customer_name", { length: 100 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
  customerEmail: varchar("customer_email", { length: 100 }),
  deliveryAddress: text("delivery_address").notNull(),
  notes: text("notes"),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // تمت الإضافة
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  items: text("items").notNull(), // JSON string
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(), // تمت الإضافة
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  estimatedTime: varchar("estimated_time", { length: 50 }).default("30-45 دقيقة"),
  restaurantId: uuid("restaurant_id").references(() => restaurants.id),
  driverId: uuid("driver_id").references(() => drivers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Special offers table
export const specialOffers = pgTable("special_offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(), // تم تغيير إلى notNull
  image: text("image").notNull(), // تمت الإضافة
  discountPercent: integer("discount_percent"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }),
  minimumOrder: decimal("minimum_order", { precision: 10, scale: 2 }).default("0"),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Admin users table
export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: text("password").notNull(),
  userType: varchar("user_type", { length: 50 }).default("admin").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Admin sessions table
export const adminSessions = pgTable("admin_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminId: uuid("admin_id").references(() => adminUsers.id).notNull(),
  token: text("token").notNull().unique(),
  userType: varchar("user_type", { length: 50 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// UI settings table
export const uiSettings = pgTable("ui_settings", {
  id: uuid("id").primaryKey().defaultRandom(), // تمت الإضافة
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true), // تمت الإضافة
  createdAt: timestamp("created_at").defaultNow().notNull(), // تمت الإضافة
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type User = z.infer<typeof selectUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const insertUserAddressSchema = createInsertSchema(userAddresses);
export const selectUserAddressSchema = createSelectSchema(userAddresses);
export type UserAddress = z.infer<typeof selectUserAddressSchema>;
export type InsertUserAddress = z.infer<typeof insertUserAddressSchema>;

export const insertCategorySchema = createInsertSchema(categories);
export const selectCategorySchema = createSelectSchema(categories);
export type Category = z.infer<typeof selectCategorySchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export const insertRestaurantSchema = createInsertSchema(restaurants);
export const selectRestaurantSchema = createSelectSchema(restaurants);
export type Restaurant = z.infer<typeof selectRestaurantSchema>;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;

export const insertMenuItemSchema = createInsertSchema(menuItems);
export const selectMenuItemSchema = createSelectSchema(menuItems);
export type MenuItem = z.infer<typeof selectMenuItemSchema>;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

export const insertOrderSchema = createInsertSchema(orders);
export const selectOrderSchema = createSelectSchema(orders);
export type Order = z.infer<typeof selectOrderSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export const insertDriverSchema = createInsertSchema(drivers);
export const selectDriverSchema = createSelectSchema(drivers);
export type Driver = z.infer<typeof selectDriverSchema>;
export type InsertDriver = z.infer<typeof insertDriverSchema>;

export const insertSpecialOfferSchema = createInsertSchema(specialOffers);
export const selectSpecialOfferSchema = createSelectSchema(specialOffers);
export type SpecialOffer = z.infer<typeof selectSpecialOfferSchema>;
export type InsertSpecialOffer = z.infer<typeof insertSpecialOfferSchema>;

export const insertAdminUserSchema = createInsertSchema(adminUsers);
export const selectAdminUserSchema = createSelectSchema(adminUsers);
export type AdminUser = z.infer<typeof selectAdminUserSchema>;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;

export const insertAdminSessionSchema = createInsertSchema(adminSessions);
export const selectAdminSessionSchema = createSelectSchema(adminSessions);
export type AdminSession = z.infer<typeof selectAdminSessionSchema>;
export type InsertAdminSession = z.infer<typeof insertAdminSessionSchema>;

// Restaurant sections table
export const restaurantSections = pgTable("restaurant_sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  restaurantId: uuid("restaurant_id").references(() => restaurants.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Ratings table
export const ratings = pgTable("ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id),
  restaurantId: uuid("restaurant_id").references(() => restaurants.id),
  customerName: varchar("customer_name", { length: 100 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isApproved: boolean("is_approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  recipientType: varchar("recipient_type", { length: 50 }).notNull(),
  recipientId: uuid("recipient_id"),
  orderId: uuid("order_id").references(() => orders.id),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Wallets table
export const wallets = pgTable("wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerPhone: varchar("customer_phone", { length: 20 }).unique().notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Wallet transactions table
export const walletTransactions = pgTable("wallet_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletId: uuid("wallet_id").references(() => wallets.id),
  type: varchar("type", { length: 50 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  orderId: uuid("order_id").references(() => orders.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// System settings table
export const systemSettings = pgTable("system_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key", { length: 100 }).unique().notNull(),
  value: text("value").notNull(),
  category: varchar("category", { length: 50 }),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Restaurant earnings table
export const restaurantEarnings = pgTable("restaurant_earnings", {
  id: uuid("id").primaryKey().defaultRandom(),
  restaurantId: uuid("restaurant_id").references(() => restaurants.id),
  ownerName: varchar("owner_name", { length: 100 }).notNull(),
  ownerPhone: varchar("owner_phone", { length: 20 }).notNull(),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0.00"),
  pendingAmount: decimal("pending_amount", { precision: 10, scale: 2 }).default("0.00"),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUiSettingsSchema = createInsertSchema(uiSettings);
export const selectUiSettingsSchema = createSelectSchema(uiSettings);
export type UiSettings = z.infer<typeof selectUiSettingsSchema>;
export type InsertUiSettings = z.infer<typeof insertUiSettingsSchema>;

export const insertRestaurantSectionSchema = createInsertSchema(restaurantSections);
export const selectRestaurantSectionSchema = createSelectSchema(restaurantSections);
export type RestaurantSection = z.infer<typeof selectRestaurantSectionSchema>;
export type InsertRestaurantSection = z.infer<typeof insertRestaurantSectionSchema>;

export const insertRatingSchema = createInsertSchema(ratings);
export const selectRatingSchema = createSelectSchema(ratings);
export type Rating = z.infer<typeof selectRatingSchema>;
export type InsertRating = z.infer<typeof insertRatingSchema>;

export const insertNotificationSchema = createInsertSchema(notifications);
export const selectNotificationSchema = createSelectSchema(notifications);
export type Notification = z.infer<typeof selectNotificationSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export const insertWalletSchema = createInsertSchema(wallets);
export const selectWalletSchema = createSelectSchema(wallets);
export type Wallet = z.infer<typeof selectWalletSchema>;
export type InsertWallet = z.infer<typeof insertWalletSchema>;

export const insertWalletTransactionSchema = createInsertSchema(walletTransactions);
export const selectWalletTransactionSchema = createSelectSchema(walletTransactions);
export type WalletTransaction = z.infer<typeof selectWalletTransactionSchema>;
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;

export const insertSystemSettingsSchema = createInsertSchema(systemSettings);
export const selectSystemSettingsSchema = createSelectSchema(systemSettings);
export type SystemSettings = z.infer<typeof selectSystemSettingsSchema>;
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;

export const insertRestaurantEarningsSchema = createInsertSchema(restaurantEarnings);
export const selectRestaurantEarningsSchema = createSelectSchema(restaurantEarnings);
export type RestaurantEarnings = z.infer<typeof selectRestaurantEarningsSchema>;
export type InsertRestaurantEarnings = z.infer<typeof insertRestaurantEarningsSchema>;