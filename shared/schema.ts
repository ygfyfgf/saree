import { pgTable, text, uuid, timestamp, boolean, integer, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: text("password").notNull(),
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
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  address: text("address").notNull(),
  details: text("details"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Categories table
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 100 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// Restaurants table
export const restaurants = pgTable("restaurants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  image: text("image").notNull(),
  rating: varchar("rating", { length: 10 }).default("0.0"),
  reviewCount: integer("review_count").default(0),
  deliveryTime: varchar("delivery_time", { length: 50 }).notNull(),
  isOpen: boolean("is_open").default(true).notNull(),
  minimumOrder: decimal("minimum_order", { precision: 10, scale: 2 }).default("0"),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).default("0"),
  categoryId: uuid("category_id").references(() => categories.id),
  openingTime: varchar("opening_time", { length: 50 }).default("08:00"),
  closingTime: varchar("closing_time", { length: 50 }).default("23:00"),
  workingDays: varchar("working_days", { length: 50 }).default("0,1,2,3,4,5,6"),
  isTemporarilyClosed: boolean("is_temporarily_closed").default(false),
  temporaryCloseReason: text("temporary_close_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Menu items table
export const menuItems = pgTable("menu_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  image: text("image").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  isSpecialOffer: boolean("is_special_offer").default(false).notNull(),
  restaurantId: uuid("restaurant_id").references(() => restaurants.id),
});

// Orders table
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerName: varchar("customer_name", { length: 100 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
  customerEmail: varchar("customer_email", { length: 100 }),
  deliveryAddress: text("delivery_address").notNull(),
  notes: text("notes"),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  items: text("items").notNull(), // JSON string
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  estimatedTime: varchar("estimated_time", { length: 50 }).default("30-45 دقيقة"),
  restaurantId: uuid("restaurant_id").references(() => restaurants.id),
  driverId: uuid("driver_id").references(() => adminUsers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Special offers table
export const specialOffers = pgTable("special_offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
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
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

export const insertUiSettingsSchema = createInsertSchema(uiSettings);
export const selectUiSettingsSchema = createSelectSchema(uiSettings);
export type UiSettings = z.infer<typeof selectUiSettingsSchema>;
export type InsertUiSettings = z.infer<typeof insertUiSettingsSchema>;

// Legacy types for backward compatibility
export type Driver = AdminUser;
export type InsertDriver = InsertAdminUser;
export const insertDriverSchema = insertAdminUserSchema;
export const selectDriverSchema = selectAdminUserSchema;