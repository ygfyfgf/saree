import type { Express } from "express";
import { createServer, type Server } from "http";
import { dbStorage } from "./db";
import { authService } from "./auth";
import { 
  insertRestaurantSchema, 
  insertMenuItemSchema, 
  insertOrderSchema, 
  insertCategorySchema, 
  insertSpecialOfferSchema,
  insertUiSettingsSchema,
  insertUserSchema
} from "../shared/schema";
import { eq, and, desc, isNull, or, like, sql } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Initialize default admin user on startup
  try {
    await authService.createDefaultAdmin();
    console.log('✅ Default admin user initialized');
  } catch (error) {
    console.error('❌ Error initializing default admin:', error);
  }

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });
  
  // Admin Authentication Routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false,
          message: "البريد الإلكتروني وكلمة المرور مطلوبان" 
        });
      }

      const loginResult = await authService.loginAdmin(email, password);
      
      if (loginResult.success) {
        res.json({
          success: true,
          token: loginResult.token,
          userType: loginResult.userType,
          message: "تم تسجيل الدخول بنجاح"
        });
      } else {
        res.status(401).json({ 
          success: false,
          message: loginResult.message 
        });
      }
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      res.status(500).json({ 
        success: false,
        message: "خطأ في الخادم" 
      });
    }
  });

  app.post("/api/admin/logout", async (req, res) => {
    try {
      const { token } = req.body;
      if (token) {
        await authService.logout(token);
      }
      res.json({ 
        success: true,
        message: "تم تسجيل الخروج بنجاح" 
      });
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
      res.status(500).json({ 
        success: false,
        message: "خطأ في الخادم" 
      });
    }
  });

  app.get("/api/admin/verify", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      
      if (!token) {
        return res.status(401).json({ 
          valid: false,
          message: "رمز التحقق مطلوب" 
        });
      }

      const validation = await authService.validateSession(token);
      
      if (validation.valid) {
        res.json({
          valid: true,
          userType: validation.userType,
          adminId: validation.adminId
        });
      } else {
        res.status(401).json({ 
          valid: false,
          message: "انتهت صلاحية الجلسة" 
        });
      }
    } catch (error) {
      console.error('خطأ في التحقق:', error);
      res.status(500).json({ 
        valid: false,
        message: "خطأ في الخادم" 
      });
    }
  });

  // Dashboard endpoint
  app.get("/api/admin/dashboard", async (req, res) => {
    try {
      const stats = await dbStorage.getDashboardStats();
      const recentOrders = await dbStorage.getRecentOrders(10);
      
      res.json({
        stats,
        recentOrders
      });
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      res.status(500).json({ message: "خطأ في جلب بيانات لوحة التحكم" });
    }
  });

  // Users
  app.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await dbStorage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      res.json(user);
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ message: "خطأ في جلب بيانات المستخدم" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await dbStorage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(400).json({ message: "بيانات المستخدم غير صحيحة" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertUserSchema.partial().parse(req.body);
      const user = await dbStorage.updateUser(id, validatedData);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      res.json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(400).json({ message: "خطأ في تحديث بيانات المستخدم" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await dbStorage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({ message: "خطأ في جلب التصنيفات" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await dbStorage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(400).json({ message: "بيانات التصنيف غير صحيحة" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertCategorySchema.partial().parse(req.body);
      const category = await dbStorage.updateCategory(id, validatedData);
      if (!category) {
        return res.status(404).json({ message: "التصنيف غير موجود" });
      }
      res.json(category);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(400).json({ message: "خطأ في تحديث التصنيف" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await dbStorage.deleteCategory(id);
      if (!success) {
        return res.status(404).json({ message: "التصنيف غير موجود" });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ message: "خطأ في حذف التصنيف" });
    }
  });

  // Restaurants
  app.get("/api/restaurants", async (req, res) => {
    try {
      const { categoryId, search } = req.query;
      let restaurants;
      
      if (categoryId && categoryId !== 'all') {
        restaurants = await dbStorage.getRestaurantsByCategory(categoryId as string);
      } else {
        restaurants = await dbStorage.getRestaurants();
      }
      
      // Apply search filter if provided
      if (search && restaurants) {
        const searchTerm = (search as string).toLowerCase();
        restaurants = restaurants.filter(restaurant => 
          restaurant.name.toLowerCase().includes(searchTerm) ||
          restaurant.description?.toLowerCase().includes(searchTerm)
        );
      }
      
      res.json(restaurants);
    } catch (error) {
      console.error('Error getting restaurants:', error);
      res.status(500).json({ message: "خطأ في جلب المطاعم" });
    }
  });

  app.get("/api/restaurants/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const restaurant = await dbStorage.getRestaurant(id);
      if (!restaurant) {
        return res.status(404).json({ message: "المطعم غير موجود" });
      }
      res.json(restaurant);
    } catch (error) {
      console.error('Error getting restaurant:', error);
      res.status(500).json({ message: "خطأ في جلب بيانات المطعم" });
    }
  });

  app.post("/api/restaurants", async (req, res) => {
    try {
      const validatedData = insertRestaurantSchema.parse(req.body);
      const restaurant = await dbStorage.createRestaurant(validatedData);
      res.status(201).json(restaurant);
    } catch (error) {
      console.error('Error creating restaurant:', error);
      res.status(400).json({ message: "بيانات المطعم غير صحيحة" });
    }
  });

  app.put("/api/restaurants/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertRestaurantSchema.partial().parse(req.body);
      const restaurant = await dbStorage.updateRestaurant(id, validatedData);
      if (!restaurant) {
        return res.status(404).json({ message: "المطعم غير موجود" });
      }
      res.json(restaurant);
    } catch (error) {
      console.error('Error updating restaurant:', error);
      res.status(400).json({ message: "خطأ في تحديث بيانات المطعم" });
    }
  });

  app.delete("/api/restaurants/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await dbStorage.deleteRestaurant(id);
      if (!success) {
        return res.status(404).json({ message: "المطعم غير موجود" });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      res.status(500).json({ message: "خطأ في حذف المطعم" });
    }
  });

  // Menu Items
  app.get("/api/restaurants/:restaurantId/menu", async (req, res) => {
    try {
      const { restaurantId } = req.params;
      const menuItems = await dbStorage.getMenuItems(restaurantId);
      res.json(menuItems);
    } catch (error) {
      console.error('Error getting menu items:', error);
      res.status(500).json({ message: "خطأ في جلب عناصر القائمة" });
    }
  });

  app.post("/api/menu-items", async (req, res) => {
    try {
      const validatedData = insertMenuItemSchema.parse(req.body);
      const menuItem = await dbStorage.createMenuItem(validatedData);
      res.status(201).json(menuItem);
    } catch (error) {
      console.error('Error creating menu item:', error);
      res.status(400).json({ message: "بيانات عنصر القائمة غير صحيحة" });
    }
  });

  app.put("/api/menu-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertMenuItemSchema.partial().parse(req.body);
      const menuItem = await dbStorage.updateMenuItem(id, validatedData);
      if (!menuItem) {
        return res.status(404).json({ message: "عنصر القائمة غير موجود" });
      }
      res.json(menuItem);
    } catch (error) {
      console.error('Error updating menu item:', error);
      res.status(400).json({ message: "خطأ في تحديث عنصر القائمة" });
    }
  });

  app.delete("/api/menu-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await dbStorage.deleteMenuItem(id);
      if (!success) {
        return res.status(404).json({ message: "عنصر القائمة غير موجود" });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      res.status(500).json({ message: "خطأ في حذف عنصر القائمة" });
    }
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    try {
      const { restaurantId, status, driverId } = req.query;
      let orders;
      
      if (driverId) {
        orders = await dbStorage.getDriverOrders(driverId as string, status as string);
      } else if (restaurantId) {
        orders = await dbStorage.getOrdersByRestaurant(restaurantId as string);
      } else {
        orders = await dbStorage.getOrders();
      }
      
      // Filter by status if provided
      if (status && status !== 'all' && !driverId) {
        orders = orders.filter(order => order.status === status);
      }
      
      res.json(orders);
    } catch (error) {
      console.error('Error getting orders:', error);
      res.status(500).json({ message: "خطأ في جلب الطلبات" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const order = await dbStorage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "الطلب غير موجود" });
      }
      res.json(order);
    } catch (error) {
      console.error('Error getting order:', error);
      res.status(500).json({ message: "خطأ في جلب بيانات الطلب" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await dbStorage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(400).json({ message: "بيانات الطلب غير صحيحة" });
    }
  });

  app.put("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertOrderSchema.partial().parse(req.body);
      const order = await dbStorage.updateOrder(id, validatedData);
      if (!order) {
        return res.status(404).json({ message: "الطلب غير موجود" });
      }
      res.json(order);
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(400).json({ message: "خطأ في تحديث الطلب" });
    }
  });

  // Drivers
  app.get("/api/drivers", async (req, res) => {
    try {
      const { available } = req.query;
      let drivers;
      
      if (available === 'true') {
        drivers = await dbStorage.getAvailableDrivers();
      } else {
        drivers = await dbStorage.getDrivers();
      }
      
      res.json(drivers);
    } catch (error) {
      console.error('Error getting drivers:', error);
      res.status(500).json({ message: "خطأ في جلب السائقين" });
    }
  });

  app.get("/api/drivers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const driver = await dbStorage.getDriver(id);
      if (!driver) {
        return res.status(404).json({ message: "السائق غير موجود" });
      }
      res.json(driver);
    } catch (error) {
      console.error('Error getting driver:', error);
      res.status(500).json({ message: "خطأ في جلب بيانات السائق" });
    }
  });

  app.post("/api/drivers", async (req, res) => {
    try {
      // Hash password before creating driver
      if (req.body.password) {
        req.body.password = await authService.hashPassword(req.body.password);
      }
      
      const driver = await dbStorage.createDriver(req.body);
      res.status(201).json(driver);
    } catch (error) {
      console.error('Error creating driver:', error);
      res.status(400).json({ message: "خطأ في إنشاء السائق" });
    }
  });

  app.put("/api/drivers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Hash password if provided
      if (req.body.password) {
        req.body.password = await authService.hashPassword(req.body.password);
      }
      
      const driver = await dbStorage.updateDriver(id, req.body);
      if (!driver) {
        return res.status(404).json({ message: "السائق غير موجود" });
      }
      res.json(driver);
    } catch (error) {
      console.error('Error updating driver:', error);
      res.status(400).json({ message: "خطأ في تحديث بيانات السائق" });
    }
  });

  app.delete("/api/drivers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await dbStorage.deleteDriver(id);
      if (!success) {
        return res.status(404).json({ message: "السائق غير موجود" });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting driver:', error);
      res.status(500).json({ message: "خطأ في حذف السائق" });
    }
  });

  // Special Offers
  app.get("/api/special-offers", async (req, res) => {
    try {
      const { active } = req.query;
      let offers;
      
      if (active === 'true') {
        offers = await dbStorage.getActiveSpecialOffers();
      } else {
        offers = await dbStorage.getSpecialOffers();
      }
      
      res.json(offers);
    } catch (error) {
      console.error('Error getting special offers:', error);
      res.status(500).json({ message: "خطأ في جلب العروض الخاصة" });
    }
  });

  app.post("/api/special-offers", async (req, res) => {
    try {
      const validatedData = insertSpecialOfferSchema.parse(req.body);
      const offer = await dbStorage.createSpecialOffer(validatedData);
      res.status(201).json(offer);
    } catch (error) {
      console.error('Error creating special offer:', error);
      res.status(400).json({ message: "بيانات العرض غير صحيحة" });
    }
  });

  app.put("/api/special-offers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertSpecialOfferSchema.partial().parse(req.body);
      const offer = await dbStorage.updateSpecialOffer(id, validatedData);
      if (!offer) {
        return res.status(404).json({ message: "العرض غير موجود" });
      }
      res.json(offer);
    } catch (error) {
      console.error('Error updating special offer:', error);
      res.status(400).json({ message: "خطأ في تحديث العرض" });
    }
  });

  app.delete("/api/special-offers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await dbStorage.deleteSpecialOffer(id);
      if (!success) {
        return res.status(404).json({ message: "العرض غير موجود" });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting special offer:', error);
      res.status(500).json({ message: "خطأ في حذف العرض" });
    }
  });

  // UI Settings Routes
  app.get("/api/ui-settings", async (req, res) => {
    try {
      const settings = await dbStorage.getUiSettings();
      res.json(settings);
    } catch (error) {
      console.error('خطأ في جلب إعدادات الواجهة:', error);
      res.status(500).json({ message: "خطأ في جلب إعدادات الواجهة" });
    }
  });

  app.get("/api/ui-settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const setting = await dbStorage.getUiSetting(key);
      if (!setting) {
        return res.status(404).json({ message: "الإعداد غير موجود" });
      }
      res.json(setting);
    } catch (error) {
      console.error('خطأ في جلب إعداد الواجهة:', error);
      res.status(500).json({ message: "خطأ في جلب إعداد الواجهة" });
    }
  });

  app.put("/api/ui-settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      
      if (value === undefined || value === null) {
        return res.status(400).json({ message: "قيمة الإعداد مطلوبة" });
      }

      let updated = await dbStorage.updateUiSetting(key, value.toString());
      
      // If setting doesn't exist, create it
      if (!updated) {
        updated = await dbStorage.createUiSetting({
          key,
          value: value.toString(),
          description: `Auto-created setting for ${key}`,
          isActive: true
        });
      }
      
      res.json(updated);
    } catch (error) {
      console.error('خطأ في تحديث إعداد الواجهة:', error);
      res.status(500).json({ message: "خطأ في تحديث إعداد الواجهة" });
    }
  });

  // Driver-specific endpoints
  app.get("/api/drivers/:id/available-orders", async (req, res) => {
    try {
      const availableOrders = await dbStorage.getAvailableOrdersForDriver();
      res.json(availableOrders);
    } catch (error) {
      console.error('Error getting available orders:', error);
      res.status(500).json({ message: "خطأ في جلب الطلبات المتاحة" });
    }
  });

  app.get("/api/drivers/:id/orders", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.query;
      
      const driverOrders = await dbStorage.getDriverOrders(id, status as string);
      res.json(driverOrders);
    } catch (error) {
      console.error('Error getting driver orders:', error);
      res.status(500).json({ message: "خطأ في جلب طلبات السائق" });
    }
  });

  app.put("/api/drivers/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, latitude, longitude } = req.body;
      
      const updateData: any = {
        isActive: status === 'available'
      };
      
      if (latitude && longitude) {
        updateData.currentLocation = `${latitude},${longitude}`;
      }
      
      const driver = await dbStorage.updateDriver(id, updateData);
      
      if (!driver) {
        return res.status(404).json({ message: "السائق غير موجود" });
      }
      
      res.json(driver);
    } catch (error) {
      console.error('Error updating driver status:', error);
      res.status(400).json({ message: "خطأ في تحديث حالة السائق" });
    }
  });

  app.post("/api/drivers/:id/accept-order", async (req, res) => {
    try {
      const { id: driverId } = req.params;
      const { orderId } = req.body;
      
      const updatedOrder = await dbStorage.assignOrderToDriver(orderId, driverId);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "الطلب غير موجود أو غير متاح" });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      console.error('Error accepting order:', error);
      res.status(400).json({ message: "خطأ في قبول الطلب" });
    }
  });

  app.post("/api/drivers/:id/complete-order", async (req, res) => {
    try {
      const { id: driverId } = req.params;
      const { orderId } = req.body;
      
      // Update order status to delivered
      const updatedOrder = await dbStorage.updateOrder(orderId, { 
        status: 'delivered'
      });
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "الطلب غير موجود" });
      }
      
      // Update driver availability
      await dbStorage.updateDriver(driverId, { isActive: true });
      
      res.json(updatedOrder);
    } catch (error) {
      console.error('Error completing order:', error);
      res.status(400).json({ message: "خطأ في إكمال الطلب" });
    }
  });

  app.get("/api/drivers/:id/stats", async (req, res) => {
    try {
      const { id } = req.params;
      const { period = 'today' } = req.query;
      
      // Get driver orders for statistics
      const driverOrders = await dbStorage.getDriverOrders(id);
      
      let filteredOrders = driverOrders;
      const now = new Date();
      
      switch (period) {
        case 'today':
          filteredOrders = driverOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate.toDateString() === now.toDateString();
          });
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filteredOrders = driverOrders.filter(order => 
            new Date(order.createdAt) >= weekAgo
          );
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filteredOrders = driverOrders.filter(order => 
            new Date(order.createdAt) >= monthAgo
          );
          break;
      }
      
      const completedOrders = filteredOrders.filter(order => order.status === 'delivered');
      const totalEarnings = completedOrders.reduce((sum, order) => {
        return sum + (parseFloat(order.deliveryFee || '0') * 0.8); // 80% commission
      }, 0);
      
      const stats = {
        totalOrders: filteredOrders.length,
        completedOrders: completedOrders.length,
        totalEarnings,
        avgOrderValue: completedOrders.length > 0 ? 
          completedOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount || '0'), 0) / completedOrders.length : 0,
        period,
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error getting driver stats:', error);
      res.status(500).json({ message: "خطأ في جلب إحصائيات السائق" });
    }
  });

  // Search endpoint
  app.get("/api/search", async (req, res) => {
    try {
      const { q, type = 'all' } = req.query;
      
      if (!q) {
        return res.json({ restaurants: [], menuItems: [] });
      }

      const searchTerm = q as string;
      let results: any = {};

      if (type === 'all' || type === 'restaurants') {
        const allRestaurants = await dbStorage.getRestaurants();
        results.restaurants = allRestaurants.filter(restaurant =>
          restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          restaurant.description?.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 10);
      }

      if (type === 'all' || type === 'menu') {
        // Get all menu items and filter
        const allRestaurants = await dbStorage.getRestaurants();
        const allMenuItems = [];
        
        for (const restaurant of allRestaurants) {
          const items = await dbStorage.getMenuItems(restaurant.id);
          allMenuItems.push(...items);
        }
        
        results.menuItems = allMenuItems.filter(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 20);
      }

      res.json(results);
    } catch (error) {
      console.error('Error in search:', error);
      res.status(500).json({ message: "خطأ في البحث" });
    }
  });

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
  });

  const httpServer = createServer(app);
  return httpServer;
}