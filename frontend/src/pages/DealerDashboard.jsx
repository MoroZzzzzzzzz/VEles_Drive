import React, { useState, useEffect } from 'react';
import { Car, Users, TrendingUp, DollarSign, Plus, Edit, Eye, Trash2, BarChart3, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { vehiclesAPI, dealersAPI } from '../services/api';
import { formatPrice } from '../components/mock';
import { Link, useNavigate } from 'react-router-dom';
import { InventoryManagement } from '../components/Dealer/InventoryManagement';
import { LeadsManagement } from '../components/Dealer/LeadsManagement';
import { Analytics } from '../components/Dealer/Analytics';

export const DealerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dealerProfile, setDealerProfile] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    totalViews: 0,
    totalLeads: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'dealer') {
      navigate('/');
      return;
    }
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dealer profile
      const dealerData = await dealersAPI.getDealers({ limit: 100 });
      const currentDealer = dealerData.dealers?.find(d => d.user_id === user.id);
      
      if (currentDealer) {
        setDealerProfile(currentDealer);
        
        // Load dealer vehicles
        const vehiclesData = await dealersAPI.getDealerVehicles(currentDealer.id);
        setVehicles(vehiclesData.vehicles || []);
        
        // Calculate stats
        const totalVehicles = vehiclesData.vehicles?.length || 0;
        const activeVehicles = vehiclesData.vehicles?.filter(v => v.is_available).length || 0;
        const totalViews = vehiclesData.vehicles?.reduce((sum, v) => sum + (v.views_count || 0), 0) || 0;
        
        setStats({
          totalVehicles,
          activeVehicles,
          totalViews,
          totalLeads: Math.floor(totalViews * 0.15), // Примерный расчет лидов
          revenue: vehiclesData.vehicles?.reduce((sum, v) => sum + (v.price || 0), 0) || 0
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVehicle = () => {
    navigate('/dealer/vehicles/create');
  };

  const handleEditVehicle = (vehicleId) => {
    navigate(`/dealer/vehicles/${vehicleId}/edit`);
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
      try {
        await vehiclesAPI.deleteVehicle(vehicleId);
        await loadDashboardData();
      } catch (error) {
        console.error('Error deleting vehicle:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-white text-lg">Загрузка панели дилера...</div>
      </div>
    );
  }

  if (!dealerProfile) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Профиль дилера не найден</h1>
          <p className="text-gray-400 mb-6">Пожалуйста, создайте профиль дилера</p>
          <Button 
            onClick={() => navigate('/dealer/setup')}
            className="bg-gradient-to-r from-amber-500 to-orange-600"
          >
            Создать профиль дилера
          </Button>
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
            ERP <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Панель дилера</span>
          </h1>
          <p className="text-gray-400 text-lg">
            {dealerProfile.company_name} • Управление автомобилями и продажами
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Всего автомобилей</CardTitle>
              <Car className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalVehicles}</div>
              <p className="text-xs text-green-400">
                {stats.activeVehicles} активных
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Просмотры</CardTitle>
              <Eye className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalViews}</div>
              <p className="text-xs text-gray-400">
                за все время
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Лиды</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalLeads}</div>
              <p className="text-xs text-green-400">
                +12% за месяц
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Общая стоимость</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatPrice(stats.revenue)}</div>
              <p className="text-xs text-gray-400">
                в наличии
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gray-900 mb-8">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-amber-600">
              Обзор
            </TabsTrigger>
            <TabsTrigger value="inventory" className="text-white data-[state=active]:bg-amber-600">
              Инвентарь
            </TabsTrigger>
            <TabsTrigger value="leads" className="text-white data-[state=active]:bg-amber-600">
              Лиды
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-amber-600">
              Аналитика
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-white data-[state=active]:bg-amber-600">
              Настройки
            </TabsTrigger>
          </TabsList>

          {/* Vehicles Management */}
          <TabsContent value="vehicles">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Управление автомобилями</CardTitle>
                <Button 
                  onClick={handleCreateVehicle}
                  className="bg-gradient-to-r from-amber-500 to-orange-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить автомобиль
                </Button>
              </CardHeader>
              <CardContent>
                {vehicles.length === 0 ? (
                  <div className="text-center py-12">
                    <Car className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      У вас еще нет автомобилей
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Добавьте первый автомобиль для продажи
                    </p>
                    <Button 
                      onClick={handleCreateVehicle}
                      className="bg-gradient-to-r from-amber-500 to-orange-600"
                    >
                      Добавить автомобиль
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={vehicle.images?.[0]?.url || "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=100&q=80"} 
                            alt={`${vehicle.make} ${vehicle.model}`}
                            className="w-16 h-12 object-cover rounded"
                          />
                          <div>
                            <h3 className="text-white font-medium">
                              {vehicle.make} {vehicle.model}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {vehicle.year} • {formatPrice(vehicle.price)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <Badge className={vehicle.is_available ? 'bg-green-600' : 'bg-red-600'}>
                              {vehicle.is_available ? 'Активен' : 'Неактивен'}
                            </Badge>
                            <p className="text-gray-400 text-sm mt-1">
                              {vehicle.views_count || 0} просмотров
                            </p>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                              className="border-gray-600 text-gray-300"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditVehicle(vehicle.id)}
                              className="border-gray-600 text-gray-300"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteVehicle(vehicle.id)}
                              className="border-red-600 text-red-400 hover:bg-red-600/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Аналитика продаж</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Аналитика в разработке
                  </h3>
                  <p className="text-gray-400">
                    Здесь будут графики продаж, конверсии и другая статистика
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers */}
          <TabsContent value="customers">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">База клиентов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    CRM система в разработке
                  </h3>
                  <p className="text-gray-400">
                    Здесь будет управление клиентами и лидами
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Настройки дилера</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white font-medium mb-4">Информация о компании</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-300 text-sm">Название компании</label>
                        <p className="text-white font-medium">{dealerProfile.company_name}</p>
                      </div>
                      <div>
                        <label className="text-gray-300 text-sm">Специализация</label>
                        <p className="text-white font-medium">{dealerProfile.specialization || 'Не указано'}</p>
                      </div>
                      <div>
                        <label className="text-gray-300 text-sm">Адрес</label>
                        <p className="text-white font-medium">{dealerProfile.address || 'Не указан'}</p>
                      </div>
                      <div>
                        <label className="text-gray-300 text-sm">Телефон</label>
                        <p className="text-white font-medium">{dealerProfile.phone || 'Не указан'}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="mt-4 border-gray-600 text-gray-300"
                    >
                      Редактировать профиль
                    </Button>
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