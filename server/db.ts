import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { 
  adminUsers, adminSessions, categories, restaurants, 
  menuItems, orders, specialOffers, uiSettings,
  type AdminUser, type InsertAdminUser,
  type AdminSession, type InsertAdminSession,
  type Category, type InsertCategory,
  type Restaurant, type InsertRestaurant,
  type MenuItem, type InsertMenuItem,
  type Order, type InsertOrder,
  type SpecialOffer, type InsertSpecialOffer,
  type UiSettings, type InsertUiSettings,
  type User, type InsertUser,
  users
} from "../shared/schema";
import { IStorage } from "./storage";
import { eq, and, desc, sql, isNull, or, like } from "drizzle-orm";

// Database connection
let db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!db) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be defined in environment variables");
    }
    const sqlClient = neon(process.env.DATABASE_URL);
    db = drizzle(sqlClient);
  }
  return db;
}

export class DatabaseStorage implements IStorage {
  get db() {
    return getDb();
  }

  // Admin Authentication
  async createAdminUser(adminUser: InsertAdminUser): Promise<AdminUser> {
    try {
      const [newAdmin] = await this.db.insert(adminUsers).values(adminUser).returning();
      return newAdmin;
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw new Error('Failed to create admin user');
    }
  }

  async getAdminByEmail(email: string): Promise<AdminUser | undefined> {
    try {
      const [admin] = await this.db.select().from(adminUsers).where(eq(adminUsers.email, email));
      return admin;
    } catch (error) {
      console.error('Error getting admin by email:', error);
      return undefined;
    }
  }

  async createAdminSession(session: InsertAdminSession): Promise<AdminSession> {
    try {
      const [newSession] = await this.db.insert(adminSessions).values(session).returning();
      return newSession;
    } catch (error) {
      console.error('Error creating admin session:', error);
      throw new Error('Failed to create admin session');
    }
  }

  async getAdminSession(token: string): Promise<AdminSession | undefined> {
    try {
      const [session] = await this.db.select().from(adminSessions).where(eq(adminSessions.token, token));
      return session;
    } catch (error) {
      console.error('Error getting admin session:', error);
      return undefined;
    }
  }

  async deleteAdminSession(token: string): Promise<boolean> {
    try {
      const result = await this.db.delete(adminSessions).where(eq(adminSessions.token, token));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting admin session:', error);
      return false;
    }
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await this.db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await this.db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const [newUser] = await this.db.insert(users).values(user).returning();
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const [updated] = await this.db.update(users).set(userData).where(eq(users.id, id)).returning();
      return updated;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      return await this.db.select().from(categories).where(eq(categories.isActive, true));
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    try {
      const [newCategory] = await this.db.insert(categories).values(category).returning();
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category');
    }
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    try {
      const [updated] = await this.db.update(categories).set(category).where(eq(categories.id, id)).returning();
      return updated;
    } catch (error) {
      console.error('Error updating category:', error);
      return undefined;
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      const result = await this.db.delete(categories).where(eq(categories.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  }

  // Restaurants
  async getRestaurants(): Promise<Restaurant[]> {
    try {
      return await this.db.select().from(restaurants);
    } catch (error) {
      console.error('Error getting restaurants:', error);
      return [];
    }
  }

  async getRestaurant(id: string): Promise<Restaurant | undefined> {
    try {
      const [restaurant] = await this.db.select().from(restaurants).where(eq(restaurants.id, id));
      return restaurant;
    } catch (error) {
      console.error('Error getting restaurant:', error);
      return undefined;
    }
  }

  async getRestaurantsByCategory(categoryId: string): Promise<Restaurant[]> {
    try {
      return await this.db.select().from(restaurants).where(eq(restaurants.categoryId, categoryId));
    } catch (error) {
      console.error('Error getting restaurants by category:', error);
      return [];
    }
  }

  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    try {
      const [newRestaurant] = await this.db.insert(restaurants).values(restaurant).returning();
      return newRestaurant;
    } catch (error) {
      console.error('Error creating restaurant:', error);
      throw new Error('Failed to create restaurant');
    }
  }

  async updateRestaurant(id: string, restaurant: Partial<InsertRestaurant>): Promise<Restaurant | undefined> {
    try {
      const [updated] = await this.db.update(restaurants).set(restaurant).where(eq(restaurants.id, id)).returning();
      return updated;
    } catch (error) {
      console.error('Error updating restaurant:', error);
      return undefined;
    }
  }

  async deleteRestaurant(id: string): Promise<boolean> {
    try {
      // Delete related menu items first
      await this.db.delete(menuItems).where(eq(menuItems.restaurantId, id));
      
      const result = await this.db.delete(restaurants).where(eq(restaurants.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      return false;
    }
  }

  // Menu Items
  async getMenuItems(restaurantId: string): Promise<MenuItem[]> {
    try {
      return await this.db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId));
    } catch (error) {
      console.error('Error getting menu items:', error);
      return [];
    }
  }

  async getMenuItem(id: string): Promise<MenuItem | undefined> {
    try {
      const [item] = await this.db.select().from(menuItems).where(eq(menuItems.id, id));
      return item;
    } catch (error) {
      console.error('Error getting menu item:', error);
      return undefined;
    }
  }

  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    try {
      const [newItem] = await this.db.insert(menuItems).values(menuItem).returning();
      return newItem;
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw new Error('Failed to create menu item');
    }
  }

  async updateMenuItem(id: string, menuItem: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    try {
      const [updated] = await this.db.update(menuItems).set(menuItem).where(eq(menuItems.id, id)).returning();
      return updated;
    } catch (error) {
      console.error('Error updating menu item:', error);
      return undefined;
    }
  }

  async deleteMenuItem(id: string): Promise<boolean> {
    try {
      const result = await this.db.delete(menuItems).where(eq(menuItems.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting menu item:', error);
      return false;
    }
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    try {
      return await this.db.select().from(orders).orderBy(desc(orders.createdAt));
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  async getOrder(id: string): Promise<Order | undefined> {
    try {
      const [order] = await this.db.select().from(orders).where(eq(orders.id, id));
      return order;
    } catch (error) {
      console.error('Error getting order:', error);
      return undefined;
    }
  }

  async getOrdersByRestaurant(restaurantId: string): Promise<Order[]> {
    try {
      return await this.db.select().from(orders)
        .where(eq(orders.restaurantId, restaurantId))
        .orderBy(desc(orders.createdAt));
    } catch (error) {
      console.error('Error getting orders by restaurant:', error);
      return [];
    }
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    try {
      const [newOrder] = await this.db.insert(orders).values(order).returning();
      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined> {
    try {
      const updateData = { ...order, updatedAt: new Date() };
      const [updated] = await this.db.update(orders).set(updateData).where(eq(orders.id, id)).returning();
      return updated;
    } catch (error) {
      console.error('Error updating order:', error);
      return undefined;
    }
  }

  // Drivers (using adminUsers with userType = 'driver')
  async getDrivers(): Promise<AdminUser[]> {
    try {
      return await this.db.select().from(adminUsers).where(eq(adminUsers.userType, 'driver'));
    } catch (error) {
      console.error('Error getting drivers:', error);
      return [];
    }
  }

  async getDriver(id: string): Promise<AdminUser | undefined> {
    try {
      const [driver] = await this.db.select().from(adminUsers).where(
        and(eq(adminUsers.id, id), eq(adminUsers.userType, 'driver'))
      );
      return driver;
    } catch (error) {
      console.error('Error getting driver:', error);
      return undefined;
    }
  }

  async getAvailableDrivers(): Promise<AdminUser[]> {
    try {
      return await this.db.select().from(adminUsers).where(
        and(
          eq(adminUsers.userType, 'driver'),
          eq(adminUsers.isActive, true)
        )
      );
    } catch (error) {
      console.error('Error getting available drivers:', error);
      return [];
    }
  }

  async createDriver(driver: InsertAdminUser): Promise<AdminUser> {
    try {
      const driverWithType = { ...driver, userType: 'driver' as const };
      const [newDriver] = await this.db.insert(adminUsers).values(driverWithType).returning();
      return newDriver;
    } catch (error) {
      console.error('Error creating driver:', error);
      throw new Error('Failed to create driver');
    }
  }

  async updateDriver(id: string, driver: Partial<InsertAdminUser>): Promise<AdminUser | undefined> {
    try {
      const [updated] = await this.db.update(adminUsers).set(driver).where(
        and(eq(adminUsers.id, id), eq(adminUsers.userType, 'driver'))
      ).returning();
      return updated;
    } catch (error) {
      console.error('Error updating driver:', error);
      return undefined;
    }
  }

  async deleteDriver(id: string): Promise<boolean> {
    try {
      const result = await this.db.delete(adminUsers).where(
        and(eq(adminUsers.id, id), eq(adminUsers.userType, 'driver'))
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting driver:', error);
      return false;
    }
  }

  // Special Offers
  async getSpecialOffers(): Promise<SpecialOffer[]> {
    try {
      return await this.db.select().from(specialOffers).orderBy(desc(specialOffers.createdAt));
    } catch (error) {
      console.error('Error getting special offers:', error);
      return [];
    }
  }

  async getActiveSpecialOffers(): Promise<SpecialOffer[]> {
    try {
      return await this.db.select().from(specialOffers)
        .where(eq(specialOffers.isActive, true))
        .orderBy(desc(specialOffers.createdAt));
    } catch (error) {
      console.error('Error getting active special offers:', error);
      return [];
    }
  }

  async createSpecialOffer(offer: InsertSpecialOffer): Promise<SpecialOffer> {
    try {
      const [newOffer] = await this.db.insert(specialOffers).values(offer).returning();
      return newOffer;
    } catch (error) {
      console.error('Error creating special offer:', error);
      throw new Error('Failed to create special offer');
    }
  }

  async updateSpecialOffer(id: string, offer: Partial<InsertSpecialOffer>): Promise<SpecialOffer | undefined> {
    try {
      const [updated] = await this.db.update(specialOffers).set(offer).where(eq(specialOffers.id, id)).returning();
      return updated;
    } catch (error) {
      console.error('Error updating special offer:', error);
      return undefined;
    }
  }

  async deleteSpecialOffer(id: string): Promise<boolean> {
    try {
      const result = await this.db.delete(specialOffers).where(eq(specialOffers.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting special offer:', error);
      return false;
    }
  }

  // UI Settings
  async getUiSettings(): Promise<UiSettings[]> {
    try {
      return await this.db.select().from(uiSettings).where(eq(uiSettings.isActive, true));
    } catch (error) {
      console.error('Error getting UI settings:', error);
      return [];
    }
  }

  async getUiSetting(key: string): Promise<UiSettings | undefined> {
    try {
      const [setting] = await this.db.select().from(uiSettings).where(eq(uiSettings.key, key));
      return setting;
    } catch (error) {
      console.error('Error getting UI setting:', error);
      return undefined;
    }
  }

  async updateUiSetting(key: string, value: string): Promise<UiSettings | undefined> {
    try {
      const [updated] = await this.db.update(uiSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(uiSettings.key, key))
        .returning();
      return updated;
    } catch (error) {
      console.error('Error updating UI setting:', error);
      return undefined;
    }
  }

  async createUiSetting(setting: InsertUiSettings): Promise<UiSettings> {
    try {
      const [newSetting] = await this.db.insert(uiSettings).values(setting).returning();
      return newSetting;
    } catch (error) {
      console.error('Error creating UI setting:', error);
      throw new Error('Failed to create UI setting');
    }
  }

  async deleteUiSetting(key: string): Promise<boolean> {
    try {
      const result = await this.db.delete(uiSettings).where(eq(uiSettings.key, key));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting UI setting:', error);
      return false;
    }
  }

  // Dashboard Analytics
  async getDashboardStats(): Promise<any> {
    try {
      const [stats] = await this.db.select({
        totalOrders: sql<number>`COUNT(*)`,
        totalRestaurants: sql<number>`(SELECT COUNT(*) FROM ${restaurants})`,
        totalDrivers: sql<number>`(SELECT COUNT(*) FROM ${adminUsers} WHERE user_type = 'driver')`,
        activeDrivers: sql<number>`(SELECT COUNT(*) FROM ${adminUsers} WHERE user_type = 'driver' AND is_active = true)`,
        pendingOrders: sql<number>`COUNT(CASE WHEN status = 'pending' THEN 1 END)`,
        todayOrders: sql<number>`COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END)`,
        totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN status = 'delivered' THEN CAST(total_amount AS DECIMAL) END), 0)`,
        todayRevenue: sql<number>`COALESCE(SUM(CASE WHEN status = 'delivered' AND DATE(created_at) = CURRENT_DATE THEN CAST(total_amount AS DECIMAL) END), 0)`
      }).from(orders);

      return stats;
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        totalOrders: 0,
        totalRestaurants: 0,
        totalDrivers: 0,
        activeDrivers: 0,
        pendingOrders: 0,
        todayOrders: 0,
        totalRevenue: 0,
        todayRevenue: 0
      };
    }
  }

  async getRecentOrders(limit: number = 10): Promise<Order[]> {
    try {
      return await this.db.select().from(orders)
        .orderBy(desc(orders.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Error getting recent orders:', error);
      return [];
    }
  }

  // Driver specific methods
  async getDriverOrders(driverId: string, status?: string): Promise<Order[]> {
    try {
      let query = this.db.select().from(orders).where(eq(orders.driverId, driverId));
      
      if (status) {
        query = query.where(and(eq(orders.driverId, driverId), eq(orders.status, status)));
      }
      
      return await query.orderBy(desc(orders.createdAt));
    } catch (error) {
      console.error('Error getting driver orders:', error);
      return [];
    }
  }

  async getAvailableOrdersForDriver(): Promise<Order[]> {
    try {
      return await this.db.select().from(orders)
        .where(and(
          eq(orders.status, 'confirmed'),
          isNull(orders.driverId)
        ))
        .orderBy(desc(orders.createdAt))
        .limit(20);
    } catch (error) {
      console.error('Error getting available orders for driver:', error);
      return [];
    }
  }

  async assignOrderToDriver(orderId: string, driverId: string): Promise<Order | undefined> {
    try {
      const [updated] = await this.db.update(orders)
        .set({ 
          driverId, 
          status: 'assigned',
          updatedAt: new Date()
        })
        .where(eq(orders.id, orderId))
        .returning();
      return updated;
    } catch (error) {
      console.error('Error assigning order to driver:', error);
      return undefined;
    }
  }
}

export const dbStorage = new DatabaseStorage();