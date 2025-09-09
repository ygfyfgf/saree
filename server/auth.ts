import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { dbStorage } from './db';
import { type InsertAdminUser, type InsertAdminSession } from '../shared/schema';

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, 10);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  async loginAdmin(email: string, password: string): Promise<{ success: boolean; token?: string; userType?: string; message?: string }> {
    try {
      const admin = await dbStorage.getAdminByEmail(email);
      if (!admin) {
        return { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
      }

      if (!admin.isActive) {
        return { success: false, message: 'الحساب غير مفعل' };
      }

      const isPasswordValid = await this.verifyPassword(password, admin.password);
      if (!isPasswordValid) {
        return { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
      }

      const token = randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

      const sessionData: InsertAdminSession = {
        adminId: admin.id,
        token,
        userType: admin.userType,
        expiresAt
      };

      await dbStorage.createAdminSession(sessionData);
      
      return { 
        success: true, 
        token, 
        userType: admin.userType,
        message: 'تم تسجيل الدخول بنجاح'
      };
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      return { success: false, message: 'حدث خطأ في الخادم' };
    }
  }

  async loginDriver(phone: string, password: string): Promise<{ success: boolean; token?: string; userType?: string; driverId?: string; message?: string }> {
    try {
      // Find driver by phone (stored in email field for drivers)
      const drivers = await dbStorage.getDrivers();
      const driver = drivers.find(d => d.email === phone);
      
      if (!driver) {
        return { success: false, message: 'رقم الهاتف أو كلمة المرور غير صحيحة' };
      }

      if (!driver.isActive) {
        return { success: false, message: 'الحساب غير مفعل' };
      }

      const isPasswordValid = await this.verifyPassword(password, driver.password);
      if (!isPasswordValid) {
        return { success: false, message: 'رقم الهاتف أو كلمة المرور غير صحيحة' };
      }

      const token = randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

      const sessionData: InsertAdminSession = {
        adminId: driver.id,
        token,
        userType: 'driver',
        expiresAt
      };

      await dbStorage.createAdminSession(sessionData);
      
      return { 
        success: true, 
        token, 
        userType: 'driver',
        driverId: driver.id,
        message: 'تم تسجيل الدخول بنجاح'
      };
    } catch (error) {
      console.error('خطأ في تسجيل دخول السائق:', error);
      return { success: false, message: 'حدث خطأ في الخادم' };
    }
  }

  async validateSession(token: string): Promise<{ valid: boolean; userType?: string; adminId?: string }> {
    try {
      const session = await dbStorage.getAdminSession(token);
      if (!session) {
        return { valid: false };
      }

      if (new Date() > session.expiresAt) {
        await dbStorage.deleteAdminSession(token);
        return { valid: false };
      }

      return { 
        valid: true, 
        userType: session.userType, 
        adminId: session.adminId || undefined 
      };
    } catch (error) {
      console.error('خطأ في التحقق من الجلسة:', error);
      return { valid: false };
    }
  }

  async logout(token: string): Promise<boolean> {
    try {
      return await dbStorage.deleteAdminSession(token);
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
      return false;
    }
  }

  async createDefaultAdmin(): Promise<void> {
    try {
      const existingAdmin = await dbStorage.getAdminByEmail('aymenpro124@gmail.com');
      if (!existingAdmin) {
        const adminPassword = '777146387';
        const hashedPassword = await this.hashPassword(adminPassword);
        
        const defaultAdmin: InsertAdminUser = {
          name: 'مدير النظام الرئيسي',
          email: 'aymenpro124@gmail.com',
          password: hashedPassword,
          userType: 'admin',
          isActive: true
        };

        await dbStorage.createAdminUser(defaultAdmin);
        console.log('✅ تم إنشاء المدير الافتراضي بنجاح');
      }

      // Create default driver
      const drivers = await dbStorage.getDrivers();
      const existingDriver = drivers.find(d => d.email === '+967771234567');
      
      if (!existingDriver) {
        const driverPassword = 'password123';
        const hashedDriverPassword = await this.hashPassword(driverPassword);
        
        const defaultDriver: InsertAdminUser = {
          name: 'سائق تجريبي',
          email: '+967771234567', // Using email field for phone
          password: hashedDriverPassword,
          userType: 'driver',
          isActive: true
        };

        await dbStorage.createDriver(defaultDriver);
        console.log('✅ تم إنشاء السائق التجريبي بنجاح');
      }
    } catch (error) {
      console.error('خطأ في إنشاء المستخدمين الافتراضيين:', error);
    }
  }
}

export const authService = new AuthService();