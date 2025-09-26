import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Heart, Eye, MapPin, Fuel, Settings, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { vehiclesAPI } from '../services/api';
import { formatPrice } from '../components/mock';
import { Link } from 'react-router-dom';

export const CatalogPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Search and filter state
  const [filters, setFilters] = useState({
    category: '',
    make: '',
    model: '',
    year_from: '',
    year_to: '',
    price_from: '',
    price_to: '',
    condition: '',
    body_type: '',
    sort_by: 'date_desc'
  });

  useEffect(() => {
    loadCategories();
    loadVehicles();
  }, [filters, currentPage]);

  const loadCategories = async () => {
    try {
      const data = await vehiclesAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: currentPage,
        limit: 12
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const data = await vehiclesAPI.getVehicles(params);
      setVehicles(data.vehicles || []);
      setTotalCount(data.total || 0);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadVehicles();
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      make: '',
      model: '',
      year_from: '',
      year_to: '',
      price_from: '',
      price_to: '',
      condition: '',
      body_type: '',
      sort_by: 'date_desc'
    });
    setCurrentPage(1);
  };

  const VehicleCard = ({ vehicle }) => (
    <Card className="group bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-300 overflow-hidden backdrop-blur-sm">
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden">
          <img 
            src={vehicle.images?.[0]?.url || "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80"} 
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {vehicle.condition === 'new' && (
            <Badge className="bg-green-600 hover:bg-green-700 text-white">
              Новый
            </Badge>
          )}
          {vehicle.is_featured && (
            <Badge className="bg-amber-600 hover:bg-amber-700 text-white">
              Премиум
            </Badge>
          )}
        </div>

        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 hover:text-red-400 transition-colors"
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
            {vehicle.make} {vehicle.model}
          </h3>
          <div className="flex items-center text-gray-400 text-sm mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            {vehicle.location} • {vehicle.year} год
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          {vehicle.engine && (
            <div className="flex items-center text-gray-300">
              <Fuel className="h-4 w-4 mr-2 text-gray-500" />
              {vehicle.engine}
            </div>
          )}
          {vehicle.power && (
            <div className="flex items-center text-gray-300">
              <Settings className="h-4 w-4 mr-2 text-gray-500" />
              {vehicle.power} л.с.
            </div>
          )}
          {vehicle.mileage !== null && (
            <div className="flex items-center text-gray-300">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              {vehicle.mileage > 0 ? `${vehicle.mileage.toLocaleString('ru-RU')} км` : '0 км'}
            </div>
          )}
          {vehicle.color && (
            <div className="flex items-center text-gray-300">
              <span className="w-4 h-4 mr-2 rounded-full bg-gray-500"></span>
              {vehicle.color}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="text-3xl font-bold text-white">
            {formatPrice(vehicle.price)}
          </div>
        </div>

        <div className="flex gap-3">
          <Link to={`/vehicles/${vehicle.id}`} className="flex-1">
            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0">
              Подробнее
            </Button>
          </Link>
          <Button 
            variant="outline"
            className="px-4 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500"
          >
            Связаться
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 lg:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Каталог <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">автомобилей</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Найдите автомобиль мечты из {totalCount} предложений
          </p>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
            {/* Category */}
            {categories && (
              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent>
                  {categories.categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Make */}
            <Input
              placeholder="Марка"
              value={filters.make}
              onChange={(e) => handleFilterChange('make', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
            />

            {/* Price From */}
            <Input
              type="number"
              placeholder="Цена от"
              value={filters.price_from}
              onChange={(e) => handleFilterChange('price_from', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
            />

            {/* Price To */}
            <Input
              type="number"
              placeholder="Цена до"
              value={filters.price_to}
              onChange={(e) => handleFilterChange('price_to', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
            />

            {/* Year From */}
            <Input
              type="number"
              placeholder="Год от"
              value={filters.year_from}
              onChange={(e) => handleFilterChange('year_from', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
            />

            {/* Sort */}
            <Select value={filters.sort_by} onValueChange={(value) => handleFilterChange('sort_by', value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">По дате (новые)</SelectItem>
                <SelectItem value="price_asc">По цене (дешевые)</SelectItem>
                <SelectItem value="price_desc">По цене (дорогие)</SelectItem>
                <SelectItem value="views_desc">По популярности</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-3">
              <Button 
                onClick={handleSearch}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
              >
                <Search className="mr-2 h-4 w-4" />
                Найти
              </Button>
              <Button 
                variant="outline"
                onClick={resetFilters}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Сбросить
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-amber-600' : 'border-gray-600 text-gray-300'}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-amber-600' : 'border-gray-600 text-gray-300'}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-white text-lg">Загрузка автомобилей...</div>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 text-lg mb-4">
              Автомобили не найдены
            </div>
            <p className="text-gray-500">
              Попробуйте изменить параметры поиска или сбросить фильтры
            </p>
          </div>
        ) : (
          <>
            {/* Results Info */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-400">
                Найдено {totalCount} автомобилей
              </p>
            </div>

            {/* Vehicles Grid */}
            <div className={`grid gap-8 mb-12 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>

            {/* Pagination */}
            {totalCount > 12 && (
              <div className="flex justify-center">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="border-gray-600 text-gray-300"
                  >
                    Назад
                  </Button>
                  <span className="flex items-center px-4 text-white">
                    {currentPage} из {Math.ceil(totalCount / 12)}
                  </span>
                  <Button
                    variant="outline"
                    disabled={currentPage >= Math.ceil(totalCount / 12)}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="border-gray-600 text-gray-300"
                  >
                    Далее
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};