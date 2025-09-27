import React, { useState, useEffect } from 'react';
import { Search, Filter, Car, Heart, MapPin, Phone, Star, Calendar, Fuel, Gauge } from 'lucide-react';
import { Button } from '../components/ui/button';
import { vehiclesAPI } from '../services/api';
import { FadeInUp } from '../components/Animations/FadeInUp';
import { SimpleVehicleModal } from '../components/SimpleVehicleModal';

export const CatalogPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    priceFrom: '',
    priceTo: '',
    yearFrom: '',
    yearTo: '',
    make: '',
    bodyType: ''
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehiclesAPI.getAll({ page: 1, limit: 20 });
      setVehicles(data.vehicles || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const mockVehicles = [
    {
      id: '1',
      make: 'BMW',
      model: 'X7',
      year: 2023,
      price: 8500000,
      mileage: 15000,
      fuel_type: 'Бензин',
      transmission: 'Автомат',
      body_type: 'Внедорожник',
      color: 'Черный',
      images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=800&h=600&fit=crop'],
      description: 'BMW X7 - флагманский внедорожник с превосходным комфортом',
      dealer: { company_name: 'BMW Премиум', rating: 4.9, phone: '+7 (495) 123-45-67' }
    },
    {
      id: '2',
      make: 'Mercedes-Benz',
      model: 'S-Class',
      year: 2023,
      price: 12000000,
      mileage: 8000,
      fuel_type: 'Бензин',
      transmission: 'Автомат',
      body_type: 'Седан',
      color: 'Белый',
      images: ['https://images.unsplash.com/photo-1563720223185-11003d516935?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=800&h=600&fit=crop'],
      description: 'Mercedes-Benz S-Class - эталон роскоши и технологий',
      dealer: { company_name: 'Mercedes Центр', rating: 4.8, phone: '+7 (495) 234-56-78' }
    },
    {
      id: '3',
      make: 'Porsche',
      model: '911',
      year: 2022,
      price: 15000000,
      mileage: 5000,
      fuel_type: 'Бензин',
      transmission: 'Автомат',
      body_type: 'Купе',
      color: 'Красный',
      images: ['https://images.unsplash.com/photo-1544829099-b9a0c5303bea?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=800&h=600&fit=crop'],
      description: 'Porsche 911 - легендарный спорткар с непревзойденными характеристиками',
      dealer: { company_name: 'Porsche Центр', rating: 4.9, phone: '+7 (495) 345-67-89' }
    }
  ];

  const displayVehicles = vehicles.length > 0 ? vehicles : mockVehicles;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 lg:px-6 py-8">
        {/* Header */}
        <FadeInUp>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Каталог автомобилей
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Премиум автомобили от проверенных дилеров. Более 1000 автомобилей в наличии
            </p>
          </div>
        </FadeInUp>

        {/* Search and Filters */}
        <FadeInUp delay={0.1}>
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Поиск по марке, модели..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Цена от"
                  value={filters.priceFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceFrom: e.target.value }))}
                  className="w-32 px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="number"
                  placeholder="до"
                  value={filters.priceTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceTo: e.target.value }))}
                  className="w-32 px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Filter Button */}
              <Button
                onClick={() => setFilterOpen(!filterOpen)}
                variant="outline"
                className="px-6 py-3"
              >
                <Filter className="h-5 w-5 mr-2" />
                Фильтры
              </Button>
            </div>
          </div>
        </FadeInUp>

        {/* Vehicle Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayVehicles.map((vehicle, index) => (
              <FadeInUp key={vehicle.id} delay={index * 0.1}>
                <div
                  onClick={() => handleVehicleClick(vehicle)}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
                >
                  {/* Vehicle Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={vehicle.images?.[0] || 'https://images.unsplash.com/photo-1555215695-3004980ad54e'}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <div className="absolute top-4 right-4">
                      <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-50 transition-colors">
                        <Heart className="h-5 w-5 text-gray-600 hover:text-red-500 transition-colors" />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                        {vehicle.body_type}
                      </span>
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {vehicle.year}
                        </span>
                        <span className="flex items-center gap-1">
                          <Gauge className="h-4 w-4" />
                          {vehicle.mileage?.toLocaleString()} км
                        </span>
                        <span className="flex items-center gap-1">
                          <Fuel className="h-4 w-4" />
                          {vehicle.fuel_type}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-2xl font-bold text-orange-600 mb-2">
                        {formatPrice(vehicle.price)}
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {vehicle.description}
                      </p>
                    </div>

                    {/* Dealer Info */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Car className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {vehicle.dealer?.company_name}
                            </p>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-gray-500">
                                {vehicle.dealer?.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="w-8 h-8 bg-gray-100 hover:bg-orange-100 rounded-lg flex items-center justify-center transition-colors">
                            <Phone className="h-4 w-4 text-gray-600 hover:text-orange-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        )}

        {/* Load More */}
        <FadeInUp delay={0.3}>
          <div className="text-center mt-12">
            <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
              Загрузить еще
            </Button>
          </div>
        </FadeInUp>
      </div>

      {/* Vehicle Detail Modal */}
      {selectedVehicle && (
        <SimpleVehicleModal
          vehicle={selectedVehicle}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </div>
  );
};