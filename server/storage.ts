import { 
  type Category, type InsertCategory,
  type Restaurant, type InsertRestaurant,
  type MenuItem, type InsertMenuItem,
  type Order, type InsertOrder,
  type SpecialOffer, type InsertSpecialOffer,
  type User, type InsertUser,
  type UiSettings, type InsertUiSettings,
  type AdminUser, type InsertAdminUser,
  type AdminSession, type InsertAdminSession
} from "../shared/schema";

export interface IStorage {
  // Admin Authentication
  createAdminUser(adminUser: InsertAdminUser): Promise<AdminUser>;
  getAdminByEmail(email: string): Promise<AdminUser | undefined>;
  createAdminSession(session: InsertAdminSession): Promise<AdminSession>;
  getAdminSession(token: string): Promise<AdminSession | undefined>;
  deleteAdminSession(token: string): Promise<boolean>;

  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;

  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Restaurants
  getRestaurants(): Promise<Restaurant[]>;
  getRestaurant(id: string): Promise<Restaurant | undefined>;
  getRestaurantsByCategory(categoryId: string): Promise<Restaurant[]>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  updateRestaurant(id: string, restaurant: Partial<InsertRestaurant>): Promise<Restaurant | undefined>;
  deleteRestaurant(id: string): Promise<boolean>;

  // Menu Items
  getMenuItems(restaurantId: string): Promise<MenuItem[]>;
  getMenuItem(id: string): Promise<MenuItem | undefined>;
  createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: string, menuItem: Partial<InsertMenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: string): Promise<boolean>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByRestaurant(restaurantId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined>;

  // Drivers
  getDrivers(): Promise<AdminUser[]>;
  getDriver(id: string): Promise<AdminUser | undefined>;
  getAvailableDrivers(): Promise<AdminUser[]>;
  createDriver(driver: InsertAdminUser): Promise<AdminUser>;
  updateDriver(id: string, driver: Partial<InsertAdminUser>): Promise<AdminUser | undefined>;
  deleteDriver(id: string): Promise<boolean>;

  // Special Offers
  getSpecialOffers(): Promise<SpecialOffer[]>;
  getActiveSpecialOffers(): Promise<SpecialOffer[]>;
  createSpecialOffer(offer: InsertSpecialOffer): Promise<SpecialOffer>;
  updateSpecialOffer(id: string, offer: Partial<InsertSpecialOffer>): Promise<SpecialOffer | undefined>;
  deleteSpecialOffer(id: string): Promise<boolean>;

  // UI Settings
  getUiSettings(): Promise<UiSettings[]>;
  getUiSetting(key: string): Promise<UiSettings | undefined>;
  updateUiSetting(key: string, value: string): Promise<UiSettings | undefined>;
  createUiSetting(setting: InsertUiSettings): Promise<UiSettings>;
  deleteUiSetting(key: string): Promise<boolean>;

  // Dashboard and Analytics
  getDashboardStats(): Promise<any>;
  getRecentOrders(limit?: number): Promise<Order[]>;
  getDriverOrders(driverId: string, status?: string): Promise<Order[]>;
  getAvailableOrdersForDriver(): Promise<Order[]>;
  assignOrderToDriver(orderId: string, driverId: string): Promise<Order | undefined>;
}