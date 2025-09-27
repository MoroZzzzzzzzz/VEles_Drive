import React, { useState, useEffect } from 'react';
import { 
  Car, Plus, Edit, Trash2, Eye, TrendingUp, TrendingDown,
  Search, Filter, Calendar, DollarSign, Settings, Image,
  BarChart3, AlertTriangle, CheckCircle, Clock
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { vehiclesAPI } from '../../services/api';
import { formatPrice } from '../mock';
import { Link } from 'react-router-dom';

export const InventoryManagement = ({ dealerId }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priceRange: 'all',
    category: 'all'
  });

  useEffect(() => {
    if (dealerId) {
      loadVehicles();
      loadInventoryStats();
    }
  }, [dealerId, filters]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehiclesAPI.getDealerVehicles(dealerId, filters);
      setVehicles(data.vehicles || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInventoryStats = async () => {
    try {
      const data = await vehiclesAPI.getInventoryStats(dealerId);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const updateVehicleStatus = async (vehicleId, newStatus) => {
    try {
      await vehiclesAPI.updateVehicleStatus(vehicleId, { status: newStatus });
      loadVehicles();
    } catch (error) {
      console.error('Error updating vehicle status:', error);
    }
  };

  const deleteVehicle = async (vehicleId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
      try {
        await vehiclesAPI.deleteVehicle(vehicleId);
        loadVehicles();
      } catch (error) {
        console.error('Error deleting vehicle:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-600';
      case 'sold': return 'bg-gray-600';
      case 'reserved': return 'bg-yellow-600';
      case 'pending': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'available': return 'Доступен';
      case 'sold': return 'Продан';
      case 'reserved': return 'Забронирован';
      case 'pending': return 'В обработке';
      default: return status;
    }
  };

  const getPriceAnalysis = (vehicle) => {
    // Mock price analysis - in real app this would come from AI pricing engine
    const marketPrice = vehicle.price * 1.1;
    const difference = ((vehicle.price - marketPrice) / marketPrice * 100);
    
    return {
      isCompetitive: Math.abs(difference) < 5,
      difference: difference,
      recommendation: difference > 5 ? 'Снизить цену' : difference < -10 ? 'Можно повысить' : 'Оптимальная цена'
    };
  };

  const StatCard = ({ title, value, trend, icon: Icon, color = "text-white" }) => (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            {trend !== undefined && (
              <div className={`flex items-center text-sm ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trend >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Icon className="h-5 w-5 text-amber-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Всего авто"
          value={stats.total_vehicles || 0}
          icon={Car}
        />
        <StatCard
          title="Доступно"
          value={stats.available_vehicles || 0}
          trend={stats.available_trend}
          icon={CheckCircle}
          color="text-green-400"
        />
        <StatCard
          title="Средняя цена"
          value={formatPrice(stats.average_price || 0)}
          trend={stats.price_trend}
          icon={DollarSign}
          color="text-amber-400"
        />
        <StatCard
          title="Дней в продаже"
          value={stats.average_days_on_lot || 0}
          trend={stats.days_trend}
          icon={Clock}
          color="text-blue-400"
        />
      </div>

      {/* Filters and Controls */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center">
              <Car className="h-5 w-5 mr-2" />
              Управление инвентарем
            </CardTitle>
            <Link to="/dealer/vehicles/create">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Добавить авто
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по марке, модели..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <Select 
              value={filters.status} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="available">Доступны</SelectItem>
                <SelectItem value="sold">Проданы</SelectItem>
                <SelectItem value="reserved">Забронированы</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.priceRange} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Цена" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все цены</SelectItem>
                <SelectItem value="0-1000000">До 1 млн</SelectItem>
                <SelectItem value="1000000-3000000">1-3 млн</SelectItem>
                <SelectItem value="3000000-5000000">3-5 млн</SelectItem>
                <SelectItem value="5000000+">Свыше 5 млн</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.category} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                <SelectItem value="car">Легковые</SelectItem>
                <SelectItem value="suv">Внедорожники</SelectItem>
                <SelectItem value="truck">Грузовые</SelectItem>
                <SelectItem value="motorcycle">Мотоциклы</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle List */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-400">Загрузка автомобилей...</div>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-8">
              <Car className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <div className="text-gray-400 mb-2">Автомобили не найдены</div>
              <Link to="/dealer/vehicles/create">
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить первый автомобиль
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {vehicles.map((vehicle) => {
                const priceAnalysis = getPriceAnalysis(vehicle);
                return (
                  <div key={vehicle.id} className="p-6 hover:bg-gray-700/30 transition-colors">
                    <div className="flex items-start space-x-4">
                      {/* Vehicle Image */}
                      <div className="w-20 h-16 bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                        {vehicle.images && vehicle.images.length > 0 ? (
                          <img 
                            src={vehicle.images[0]} 
                            alt={`${vehicle.make} ${vehicle.model}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* Vehicle Info */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-white font-semibold text-lg">
                              {vehicle.make} {vehicle.model} {vehicle.year}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <span>{vehicle.mileage?.toLocaleString('ru-RU')} км</span>
                              <span>{vehicle.fuel_type}</span>
                              <span>{vehicle.color}</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                              {formatPrice(vehicle.price)}
                            </div>
                            <div className={`text-sm ${priceAnalysis.isCompetitive ? 'text-green-400' : 'text-yellow-400'}`}>
                              {priceAnalysis.recommendation}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge className={`${getStatusColor(vehicle.status)} text-white`}>
                              {getStatusLabel(vehicle.status)}
                            </Badge>
                            
                            {vehicle.views && (
                              <div className="flex items-center text-gray-400 text-sm">
                                <Eye className="h-4 w-4 mr-1" />
                                {vehicle.views} просмотров
                              </div>
                            )}
                            
                            {vehicle.leads_count && (
                              <div className="flex items-center text-gray-400 text-sm">
                                <BarChart3 className="h-4 w-4 mr-1" />
                                {vehicle.leads_count} обращений
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-gray-600 text-gray-300 hover:bg-gray-600"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-gray-600 text-gray-300 hover:bg-gray-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <Select 
                              value={vehicle.status}
                              onValueChange={(value) => updateVehicleStatus(vehicle.id, value)}
                            >
                              <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="available">Доступен</SelectItem>
                                <SelectItem value="reserved">Забронирован</SelectItem>
                                <SelectItem value="sold">Продан</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => deleteVehicle(vehicle.id)}
                              className="border-red-600 text-red-400 hover:bg-red-600/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};