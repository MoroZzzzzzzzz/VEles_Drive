import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, Clock, Star, Car, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

// Mock map component (In real implementation, use Google Maps or Yandex Maps)
const InteractiveMap = ({ dealers, selectedDealer, onDealerSelect, userLocation }) => {
  const [mapCenter, setMapCenter] = useState(userLocation || { lat: 55.7558, lng: 37.6176 }); // Moscow center
  
  return (
    <div className="relative w-full h-full bg-gray-800 rounded-lg overflow-hidden">
      {/* Map placeholder - replace with real map API */}
      <div 
        className="w-full h-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center text-white"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        <div className="text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-amber-400" />
          <h3 className="text-xl font-bold mb-2">Интерактивная карта</h3>
          <p className="text-blue-200">Дилеры на карте Москвы</p>
        </div>
        
        {/* Dealer markers simulation */}
        <div className="absolute inset-0 pointer-events-none">
          {dealers.map((dealer, index) => (
            <div
              key={dealer.id}
              className={`absolute cursor-pointer transition-transform hover:scale-110 ${
                selectedDealer?.id === dealer.id ? 'scale-125' : ''
              }`}
              style={{
                top: `${20 + (index % 3) * 25}%`,
                left: `${15 + (index % 4) * 20}%`,
                pointerEvents: 'auto'
              }}
              onClick={() => onDealerSelect(dealer)}
            >
              <div className={`relative ${
                selectedDealer?.id === dealer.id 
                  ? 'text-amber-400' 
                  : 'text-red-500 hover:text-red-400'
              }`}>
                <MapPin className="w-8 h-8 drop-shadow-lg" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <Car className="w-2 h-2 text-gray-800" />
                </div>
              </div>
            </div>
          ))}
          
          {/* User location marker */}
          {userLocation && (
            <div
              className="absolute"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="relative">
                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                <div className="absolute -top-1 -left-1 w-6 h-6 bg-blue-400 rounded-full opacity-50 animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Map controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <Button
            size="sm"
            variant="secondary"
            className="w-10 h-10 p-0"
            title="Приблизить"
          >
            +
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="w-10 h-10 p-0"
            title="Отдалить"
          >
            −
          </Button>
        </div>
        
        {/* Current location button */}
        <Button
          size="sm"
          variant="secondary"
          className="absolute bottom-4 right-4"
          title="Моё местоположение"
        >
          <Navigation className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const DealerCard = ({ dealer, isSelected, onSelect, onGetDirections, onCall, showVehicles = false }) => {
  const formatDistance = (distance) => {
    if (!distance) return '';
    return distance < 1 ? `${Math.round(distance * 1000)} м` : `${distance.toFixed(1)} км`;
  };

  return (
    <Card className={`cursor-pointer transition-all hover:shadow-lg ${
      isSelected 
        ? 'bg-amber-500/20 border-amber-500/50' 
        : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white text-lg font-semibold">
              {dealer.company_name}
            </CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              {dealer.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-yellow-400 font-medium">{dealer.rating}</span>
                  <span className="text-gray-400 text-sm">
                    ({dealer.reviews_count || 0} отзывов)
                  </span>
                </div>
              )}
            </div>
          </div>
          {dealer.distance && (
            <Badge variant="secondary" className="text-amber-400 bg-amber-400/10">
              {formatDistance(dealer.distance)}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Address */}
        <div className="flex items-start space-x-2">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
          <div>
            <p className="text-gray-300 text-sm">
              {dealer.address}, {dealer.city}
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="flex items-center space-x-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <p className="text-gray-300 text-sm">{dealer.phone}</p>
        </div>

        {/* Working hours */}
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <p className="text-gray-300 text-sm">
            {dealer.working_hours || 'Ежедневно 9:00 - 21:00'}
          </p>
        </div>

        {/* Specialization */}
        {dealer.specialization && (
          <div>
            <p className="text-gray-400 text-xs mb-1">Специализация:</p>
            <p className="text-amber-400 text-sm">{dealer.specialization}</p>
          </div>
        )}

        {/* Vehicle count */}
        {showVehicles && dealer.vehicles_count && (
          <div className="flex items-center space-x-2">
            <Car className="w-4 h-4 text-gray-400" />
            <p className="text-gray-300 text-sm">
              {dealer.vehicles_count} автомобилей в наличии
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onGetDirections(dealer)}
            className="flex-1 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
          >
            <Navigation className="w-3 h-3 mr-1" />
            Маршрут
          </Button>
          <Button
            size="sm"
            onClick={() => onCall(dealer)}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Phone className="w-3 h-3 mr-1" />
            Позвонить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const DealersMap = ({ dealers = [], className = "" }) => {
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchRadius, setSearchRadius] = useState(50); // km

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    setIsLoadingLocation(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(location);
            // Here you would normally calculate distances to dealers
            console.log('User location:', location);
          },
          (error) => {
            console.warn('Location access denied:', error);
            // Default to Moscow center
            setUserLocation({ lat: 55.7558, lng: 37.6176 });
          }
        );
      }
    } catch (error) {
      console.warn('Geolocation error:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleGetDirections = (dealer) => {
    const query = encodeURIComponent(`${dealer.address}, ${dealer.city}`);
    // Open in Yandex Maps (more popular in Russia)
    window.open(`https://yandex.ru/maps/?text=${query}`, '_blank');
  };

  const handleCall = (dealer) => {
    window.location.href = `tel:${dealer.phone}`;
  };

  const handleDealerSelect = (dealer) => {
    setSelectedDealer(dealer);
  };

  // Mock dealers with locations if empty
  const mockDealers = dealers.length === 0 ? [
    {
      id: '1',
      company_name: 'BMW Центр Москва',
      address: 'Волгоградский проспект, 43к1',
      city: 'Москва',
      phone: '+7 (495) 123-45-67',
      rating: 4.8,
      reviews_count: 245,
      specialization: 'BMW, MINI',
      vehicles_count: 45,
      distance: 2.3
    },
    {
      id: '2', 
      company_name: 'Mercedes-Benz Москва',
      address: 'Ленинградское шоссе, 16А',
      city: 'Москва',
      phone: '+7 (495) 234-56-78',
      rating: 4.6,
      reviews_count: 189,
      specialization: 'Mercedes-Benz, AMG',
      vehicles_count: 32,
      distance: 5.7
    },
    {
      id: '3',
      company_name: 'Audi Центр Варшавка',
      address: 'Варшавское шоссе, 170Гс1',
      city: 'Москва', 
      phone: '+7 (495) 345-67-89',
      rating: 4.7,
      reviews_count: 156,
      specialization: 'Audi, Audi Sport',
      vehicles_count: 28,
      distance: 8.1
    }
  ] : dealers;

  return (
    <div className={`flex flex-col lg:flex-row gap-6 ${className}`}>
      {/* Map */}
      <div className="flex-1 h-96 lg:h-[600px]">
        <InteractiveMap
          dealers={mockDealers}
          selectedDealer={selectedDealer}
          onDealerSelect={handleDealerSelect}
          userLocation={userLocation}
        />
      </div>

      {/* Dealers List */}
      <div className="w-full lg:w-96">
        <div className="sticky top-4 space-y-4 max-h-[600px] overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-lg font-semibold">
              Дилеры ({mockDealers.length})
            </h3>
            {userLocation && (
              <Button
                size="sm"
                variant="outline"
                onClick={getUserLocation}
                disabled={isLoadingLocation}
                className="border-amber-500/30 text-amber-400"
              >
                {isLoadingLocation ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-amber-400"></div>
                ) : (
                  <Navigation className="w-3 h-3" />
                )}
              </Button>
            )}
          </div>

          {/* Search radius */}
          <div className="bg-gray-800 rounded-lg p-3">
            <label className="text-gray-400 text-sm mb-2 block">
              Радиус поиска: {searchRadius} км
            </label>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Dealers list */}
          <div className="space-y-3">
            {mockDealers.map((dealer) => (
              <div
                key={dealer.id}
                onClick={() => handleDealerSelect(dealer)}
              >
                <DealerCard
                  dealer={dealer}
                  isSelected={selectedDealer?.id === dealer.id}
                  onSelect={() => handleDealerSelect(dealer)}
                  onGetDirections={handleGetDirections}
                  onCall={handleCall}
                  showVehicles={true}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact dealer info for vehicle pages
export const DealerLocationCard = ({ dealer }) => {
  const handleGetDirections = () => {
    const query = encodeURIComponent(`${dealer.address}, ${dealer.city}`);
    window.open(`https://yandex.ru/maps/?text=${query}`, '_blank');
  };

  const handleCall = () => {
    window.location.href = `tel:${dealer.phone}`;
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white text-lg">Местоположение дилера</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <DealerCard
          dealer={dealer}
          onGetDirections={handleGetDirections}
          onCall={handleCall}
        />
      </CardContent>
    </Card>
  );
};