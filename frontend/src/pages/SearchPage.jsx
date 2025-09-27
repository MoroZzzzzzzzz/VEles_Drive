import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Grid, List, SlidersHorizontal, MapPin,
  Car, DollarSign, Calendar, Gauge, Fuel, Settings,
  Heart, ArrowLeftRight, Eye, ArrowUpDown
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Slider } from '../components/ui/slider';
import { SimpleVehicleModal } from '../components/SimpleVehicleModal';
import { LoanCalculator } from '../components/Buyer/LoanCalculator';
import { vehiclesAPI } from '../services/api';
import { formatPrice } from '../components/mock';
import { useSearchParams, useNavigate } from 'react-router-dom';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    make: searchParams.get('make') || 'all',
    bodyType: searchParams.get('body_type') || 'all',
    priceMin: parseInt(searchParams.get('price_min')) || 0,
    priceMax: parseInt(searchParams.get('price_max')) || 10000000,
    yearMin: parseInt(searchParams.get('year_min')) || 1990,
    yearMax: parseInt(searchParams.get('year_max')) || new Date().getFullYear(),
    mileageMax: parseInt(searchParams.get('mileage_max')) || 300000,
    fuelType: searchParams.get('fuel_type') || 'all',
    transmission: searchParams.get('transmission') || 'all',
    condition: searchParams.get('condition') || 'all',
    features: searchParams.get('features')?.split(',') || [],
    location: searchParams.get('location') || '',
    dealerType: searchParams.get('dealer_type') || 'all'
  });

  const [sortBy, setSortBy] = useState('relevance');
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  const carMakes = [
    'Toyota', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen',
    'Hyundai', 'Kia', 'Nissan', 'Honda', 'Mazda', 'LADA'
  ];
  
  const bodyTypes = [
    'Седан', 'Хэтчбек', 'Универсал', 'Внедорожник', 'Купе',
    'Кабриолет', 'Минивэн', 'Пикап', 'Компактвэн'
  ];

  const features = [
    'Кондиционер', 'Подогрев сидений', 'Навигация', 'Камера заднего вида',
    'Парктроники', 'Кожаный салон', 'Люк', 'Ксенон/LED', 'Круиз-контроль'
  ];

  useEffect(() => {
    searchVehicles();
  }, [filters, sortBy, currentPage]);

  const searchVehicles = async () => {
    try {
      setLoading(true);
      const searchFilters = {
        ...filters,
        sort: sortBy,
        page: currentPage,
        limit: viewMode === 'grid' ? 12 : 20
      };
      
      const data = await vehiclesAPI.searchVehicles(searchFilters);
      setVehicles(data.vehicles || []);
      setTotalResults(data.total || 0);
    } catch (error) {
      console.error('Error searching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '' && value !== 0) {
        params.set(key, value.toString());
      }
    });
    navigate(`/search?${params.toString()}`, { replace: true });
  };

  const resetFilters = () => {
    const resetFilters = {
      search: '',
      make: 'all',
      bodyType: 'all',
      priceMin: 0,
      priceMax: 10000000,
      yearMin: 1990,
      yearMax: new Date().getFullYear(),
      mileageMax: 300000,
      fuelType: 'all',
      transmission: 'all',
      condition: 'all',
      features: [],
      location: '',
      dealerType: 'all'
    };
    setFilters(resetFilters);
    navigate('/search');
  };

  const FiltersPanel = () => (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Фильтры
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-gray-400 hover:text-white"
          >
            Сбросить
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range */}
        <div className="space-y-3">
          <label className="text-gray-300 font-medium">Цена</label>
          <div className="space-y-2">
            <Slider
              value={[filters.priceMin, filters.priceMax]}
              onValueChange={([min, max]) => updateFilters({ priceMin: min, priceMax: max })}
              max={10000000}
              min={0}
              step={100000}
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>{formatPrice(filters.priceMin)}</span>
              <span>{formatPrice(filters.priceMax)}</span>
            </div>
          </div>
        </div>

        {/* Year Range */}
        <div className="space-y-3">
          <label className="text-gray-300 font-medium">Год выпуска</label>
          <div className="space-y-2">
            <Slider
              value={[filters.yearMin, filters.yearMax]}
              onValueChange={([min, max]) => updateFilters({ yearMin: min, yearMax: max })}
              max={new Date().getFullYear()}
              min={1990}
              step={1}
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>{filters.yearMin}</span>
              <span>{filters.yearMax}</span>
            </div>
          </div>
        </div>

        {/* Mileage */}
        <div className="space-y-3">
          <label className="text-gray-300 font-medium">Пробег до</label>
          <div className="space-y-2">
            <Slider
              value={[filters.mileageMax]}
              onValueChange={([max]) => updateFilters({ mileageMax: max })}
              max={300000}
              min={0}
              step={10000}
            />
            <div className="text-sm text-gray-400">
              {filters.mileageMax.toLocaleString('ru-RU')} км
            </div>
          </div>
        </div>

        {/* Make */}
        <div className="space-y-2">
          <label className="text-gray-300 font-medium">Марка</label>
          <Select value={filters.make} onValueChange={(value) => updateFilters({ make: value })}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Выберите марку" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все марки</SelectItem>
              {carMakes.map(make => (
                <SelectItem key={make} value={make}>{make}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Body Type */}
        <div className="space-y-2">
          <label className="text-gray-300 font-medium">Тип кузова</label>
          <Select value={filters.bodyType} onValueChange={(value) => updateFilters({ bodyType: value })}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Тип кузова" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все типы</SelectItem>
              {bodyTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fuel Type */}
        <div className="space-y-2">
          <label className="text-gray-300 font-medium">Тип топлива</label>
          <Select value={filters.fuelType} onValueChange={(value) => updateFilters({ fuelType: value })}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Тип топлива" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Любое</SelectItem>
              <SelectItem value="petrol">Бензин</SelectItem>
              <SelectItem value="diesel">Дизель</SelectItem>
              <SelectItem value="hybrid">Гибрид</SelectItem>
              <SelectItem value="electric">Электро</SelectItem>
              <SelectItem value="gas">Газ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transmission */}
        <div className="space-y-2">
          <label className="text-gray-300 font-medium">КПП</label>
          <Select value={filters.transmission} onValueChange={(value) => updateFilters({ transmission: value })}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Коробка передач" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Любая</SelectItem>
              <SelectItem value="manual">Механика</SelectItem>
              <SelectItem value="automatic">Автомат</SelectItem>
              <SelectItem value="cvt">Вариатор</SelectItem>
              <SelectItem value="robot">Робот</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Features */}
        <div className="space-y-3">
          <label className="text-gray-300 font-medium">Дополнительные опции</label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {features.map(feature => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={feature}
                  checked={filters.features.includes(feature)}
                  onCheckedChange={(checked) => {
                    const newFeatures = checked
                      ? [...filters.features, feature]
                      : filters.features.filter(f => f !== feature);
                    updateFilters({ features: newFeatures });
                  }}
                />
                <label htmlFor={feature} className="text-gray-300 text-sm">
                  {feature}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Dealer Type */}
        <div className="space-y-2">
          <label className="text-gray-300 font-medium">Тип продавца</label>
          <Select value={filters.dealerType} onValueChange={(value) => updateFilters({ dealerType: value })}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Тип продавца" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="dealer">Дилеры</SelectItem>
              <SelectItem value="private">Частные</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  const VehicleCard = ({ vehicle }) => (
    <Card 
      className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all duration-200 cursor-pointer group"
      onClick={() => setSelectedVehicle(vehicle)}
    >
      <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
        {vehicle.images && vehicle.images.length > 0 ? (
          <img 
            src={vehicle.images[0]} 
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <Car className="h-12 w-12 text-gray-500" />
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="text-white font-semibold text-lg group-hover:text-amber-400 transition-colors">
            {vehicle.make} {vehicle.model}
          </h3>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-white">
              {formatPrice(vehicle.price)}
            </span>
            {vehicle.isNew && (
              <Badge className="bg-green-600 text-white">Новый</Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {vehicle.year} год
            </div>
            <div className="flex items-center">
              <Gauge className="h-3 w-3 mr-1" />
              {vehicle.mileage?.toLocaleString('ru-RU')} км
            </div>
            <div className="flex items-center">
              <Fuel className="h-3 w-3 mr-1" />
              {vehicle.engine}
            </div>
            <div className="flex items-center">
              <Settings className="h-3 w-3 mr-1" />
              {vehicle.transmission}
            </div>
          </div>
          
          <div className="flex items-center text-gray-400 text-sm">
            <MapPin className="h-3 w-3 mr-1" />
            {vehicle.location} • {vehicle.dealer}
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-400">
                <Heart className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-blue-400">
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              size="sm"
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
            >
              <Eye className="h-4 w-4 mr-1" />
              Подробнее
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск по марке, модели, VIN..."
                  value={filters.search}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowCalculator(!showCalculator)}
                className="border-gray-600 text-gray-300"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Калькулятор
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-gray-600 text-gray-300 lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Фильтры
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-gray-400">
              Найдено {totalResults.toLocaleString('ru-RU')} автомобилей
            </p>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">По релевантности</SelectItem>
                <SelectItem value="price_asc">Цена: по возрастанию</SelectItem>
                <SelectItem value="price_desc">Цена: по убыванию</SelectItem>
                <SelectItem value="year_desc">Год: новые первыми</SelectItem>
                <SelectItem value="mileage_asc">Пробег: меньше первыми</SelectItem>
                <SelectItem value="date_desc">Дата: новые объявления</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <FiltersPanel />
          </div>

          {/* Results */}
          <div className="flex-1">
            {showCalculator && (
              <div className="mb-8">
                <LoanCalculator />
              </div>
            )}
            
            {loading ? (
              <div className="text-center py-12">
                <div className="text-gray-400">Поиск автомобилей...</div>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-12">
                <Car className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Автомобили не найдены
                </h3>
                <p className="text-gray-400 mb-4">
                  Попробуйте изменить параметры поиска
                </p>
                <Button onClick={resetFilters} variant="outline">
                  Сбросить фильтры
                </Button>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {vehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Detail Modal */}
        <VehicleDetailModal
          vehicle={selectedVehicle}
          open={!!selectedVehicle}
          onOpenChange={() => setSelectedVehicle(null)}
          onContact={(vehicle) => console.log('Contact dealer', vehicle)}
          onFavorite={(vehicleId) => console.log('Add to favorites', vehicleId)}
          onCompare={(vehicleId) => console.log('Add to compare', vehicleId)}
        />
      </div>
    </div>
  );
};