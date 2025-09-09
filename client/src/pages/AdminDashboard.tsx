import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  BarChart3, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Settings, 
  LogOut,
  Package,
  Truck,
  Store,
  Eye,
  Edit,
  Trash2,
  Star,
  Grid,
  Cog
} from 'lucide-react';
import RestaurantSections from './RestaurantSections';
import RatingsManagement from './RatingsManagement';
import SpecialOffers from './SpecialOffers';
import WalletManagement from './WalletManagement';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const stats = [
    { title: 'إجمالي الطلبات', value: '2,345', icon: ShoppingBag, color: 'text-blue-600' },
    { title: 'العملاء النشطين', value: '1,234', icon: Users, color: 'text-green-600' },
    { title: 'إجمالي المبيعات', value: '₪45,678', icon: DollarSign, color: 'text-orange-600' },
    { title: 'السائقين المتاحين', value: '23', icon: Truck, color: 'text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">لوحة التحكم</h1>
                <p className="text-sm text-gray-500">إدارة نظام التوصيل</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-10">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="orders">الطلبات</TabsTrigger>
            <TabsTrigger value="restaurants">المطاعم</TabsTrigger>
            <TabsTrigger value="sections">أقسام المطاعم</TabsTrigger>
            <TabsTrigger value="drivers">السائقين</TabsTrigger>
            <TabsTrigger value="categories">الفئات</TabsTrigger>
            <TabsTrigger value="offers">العروض</TabsTrigger>
            <TabsTrigger value="wallets">المحافظ</TabsTrigger>
            <TabsTrigger value="ratings">التقييمات</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    الطلبات الحديثة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((order) => (
                      <div key={order} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">طلب #{1000 + order}</p>
                          <p className="text-sm text-gray-600">مطعم الوزيكو للعربكة</p>
                        </div>
                        <Badge variant="secondary">قيد التحضير</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    السائقين النشطين
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['أحمد محمد', 'علي حسن', 'سارة أحمد'].map((driver, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{driver}</p>
                          <p className="text-sm text-gray-600">متاح للتوصيل</p>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          نشط
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إدارة الطلبات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((order) => (
                    <div key={order} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">طلب #{1000 + order}</p>
                            <p className="text-sm text-gray-600">محمد أحمد - 05{order}1234567</p>
                          </div>
                          <Badge variant={order % 2 === 0 ? "default" : "secondary"}>
                            {order % 2 === 0 ? "مؤكد" : "قيد المراجعة"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">₪{50 + order * 10} - منذ {order} ساعات</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="restaurants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إدارة المطاعم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['مطعم الوزيكو للعربكة', 'حلويات الشام', 'مقهى العروبة'].map((restaurant, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Store className="h-8 w-8 text-gray-400" />
                        <div>
                          <p className="font-medium">{restaurant}</p>
                          <p className="text-sm text-gray-600">{15 + index} عنصر في القائمة</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          مفتوح
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drivers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إدارة السائقين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['أحمد محمد', 'علي حسن', 'سارة أحمد', 'محمد علي'].map((driver, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Truck className="h-8 w-8 text-gray-400" />
                        <div>
                          <p className="font-medium">{driver}</p>
                          <p className="text-sm text-gray-600">05{index + 1}1234567</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={index % 2 === 0 ? "default" : "secondary"} 
                               className={index % 2 === 0 ? "bg-green-100 text-green-800" : ""}>
                          {index % 2 === 0 ? "متاح" : "مشغول"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إدارة الفئات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['مطاعم', 'مقاهي', 'حلويات', 'سوبرماركت', 'صيدليات'].map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Package className="h-8 w-8 text-gray-400" />
                        <div>
                          <p className="font-medium">{category}</p>
                          <p className="text-sm text-gray-600">{5 + index * 2} مطعم</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          نشط
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sections" className="space-y-6">
            <RestaurantSections />
          </TabsContent>

          <TabsContent value="offers" className="space-y-6">
            <SpecialOffers />
          </TabsContent>

          <TabsContent value="wallets" className="space-y-6">
            <WalletManagement />
          </TabsContent>

          <TabsContent value="ratings" className="space-y-6">
            <RatingsManagement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cog className="h-5 w-5" />
                  إعدادات النظام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">إعدادات التوصيل</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span>رسوم التوصيل الأساسية</span>
                        <span className="font-semibold">5.00 شيكل</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span>رسوم التوصيل لكل كيلومتر</span>
                        <span className="font-semibold">1.50 شيكل</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span>الحد الأدنى للطلبات</span>
                        <span className="font-semibold">15.00 شيكل</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">إعدادات الدفع</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span>المحفظة الإلكترونية</span>
                        <Badge className="bg-green-100 text-green-800">مفعل</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span>الدفع النقدي</span>
                        <Badge className="bg-green-100 text-green-800">مفعل</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span>الدفع بالبطاقة</span>
                        <Badge variant="secondary">غير مفعل</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};