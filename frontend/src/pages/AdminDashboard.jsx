import React, { useState, useEffect } from 'react';
import { Users, Car, Building, TrendingUp, Eye, CheckCircle, XCircle, Edit, Settings, BarChart3 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 1247,
    totalDealers: 48,
    totalVehicles: 892,
    pendingApprovals: 15,
    monthlyRevenue: 2450000,
    platformViews: 18500
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [user]);

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Доступ запрещен</h1>
          <p className="text-gray-400">У вас нет прав администратора</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 lg:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Админ <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">панель</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Управление платформой VELES DRIVE
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Пользователи</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-green-400">+12% за месяц</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Дилеры</CardTitle>
              <Building className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalDealers}</div>
              <p className="text-xs text-green-400">+3 новых</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Автомобили</CardTitle>
              <Car className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalVehicles}</div>
              <p className="text-xs text-gray-400">активных объявлений</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">На модерации</CardTitle>
              <Eye className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.pendingApprovals}</div>
              <p className="text-xs text-orange-400">требует внимания</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Доход</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {(stats.monthlyRevenue / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-green-400">+18% за месяц</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Просмотры</CardTitle>
              <Eye className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {(stats.platformViews / 1000).toFixed(0)}K
              </div>
              <p className="text-xs text-purple-400">за неделю</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="moderation" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900 mb-8">
            <TabsTrigger value="moderation" className="text-white data-[state=active]:bg-amber-600">
              Модерация
            </TabsTrigger>
            <TabsTrigger value="users" className="text-white data-[state=active]:bg-amber-600">
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-amber-600">
              Аналитика
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-white data-[state=active]:bg-amber-600">
              Настройки
            </TabsTrigger>
          </TabsList>

          {/* Moderation Tab */}
          <TabsContent value="moderation">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pending Vehicles */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Автомобили на модерации</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Mock moderation items */}
                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="flex items-center space-x-4">
                        <img 
                          src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=100&q=80"
                          alt="BMW X5"
                          className="w-16 h-12 object-cover rounded"
                        />
                        <div>
                          <h3 className="text-white font-medium">BMW X5 2024</h3>
                          <p className="text-gray-400 text-sm">15,000,000 ₽</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-600 text-red-400">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="flex items-center space-x-4">
                        <img 
                          src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=100&q=80"
                          alt="Ferrari 488"
                          className="w-16 h-12 object-cover rounded"
                        />
                        <div>
                          <h3 className="text-white font-medium">Ferrari 488 GTB</h3>
                          <p className="text-gray-400 text-sm">25,000,000 ₽</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-600 text-red-400">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Dealers */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Дилеры на верификации</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div>
                        <h3 className="text-white font-medium">Автоцентр Премиум</h3>
                        <p className="text-gray-400 text-sm">Люксовые автомобили</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Верифицировать
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-600 text-red-400">
                          Отклонить
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Управление пользователями</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Управление пользователями
                  </h3>
                  <p className="text-gray-400">
                    Здесь будет список всех пользователей с возможностью управления
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Аналитика платформы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Детальная аналитика
                  </h3>
                  <p className="text-gray-400">
                    Здесь будут графики посещаемости, конверсии, доходов и другие метрики
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Настройки платформы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white font-medium mb-4">Общие настройки</h3>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" defaultChecked className="form-checkbox" />
                        <span className="text-gray-300">Автомодерация новых объявлений</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" defaultChecked className="form-checkbox" />
                        <span className="text-gray-300">Email уведомления администраторам</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="form-checkbox" />
                        <span className="text-gray-300">Режим обслуживания</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-4">Комиссии и тарифы</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-gray-300 text-sm">Базовая комиссия (%)</label>
                        <input 
                          type="number" 
                          defaultValue="5" 
                          className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="text-gray-300 text-sm">Премиум размещение (₽)</label>
                        <input 
                          type="number" 
                          defaultValue="5000" 
                          className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="text-gray-300 text-sm">Лимит объявлений</label>
                        <input 
                          type="number" 
                          defaultValue="50" 
                          className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};