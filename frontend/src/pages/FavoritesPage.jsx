import React, { useState, useEffect } from 'react';
import { Heart, Trash2, Eye, MapPin, Calendar, Fuel, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { favoritesAPI } from '../services/api';
import { formatPrice } from '../components/mock';
import { Link } from 'react-router-dom';

export const FavoritesPage = () => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await favoritesAPI.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromFavorites = async (vehicleId) => {
    try {
      await favoritesAPI.removeFromFavorites(vehicleId);
      setFavorites(prev => prev.filter(vehicle => vehicle.id !== vehicleId));
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Войдите в аккаунт</h1>
          <p className="text-gray-400 mb-6">
            Чтобы сохранять понравившиеся автомобили, необходимо войти в систему
          </p>
          <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
            Войти в аккаунт
          </Button>
        </div>
      </div>
    );
  }

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
            onClick={() => handleRemoveFromFavorites(vehicle.id)}
            className="h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
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
            <Heart className="inline h-10 w-10 text-red-500 mr-3" />
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Избранное</span>
          </h1>
          <p className="text-gray-400 text-lg">
            {favorites.length} сохраненных автомобилей
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-white text-lg">Загрузка избранного...</div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-24 w-24 text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Ваш список избранного пуст
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Сохраняйте понравившиеся автомобили, чтобы быстро к ним вернуться. 
              Нажимайте на иконку сердечка в каталоге.
            </p>
            <Link to="/catalog">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-3 text-lg">
                Перейти к каталогу
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Filter Options */}
            <div className="flex justify-between items-center mb-8">
              <div className="text-gray-300">
                Показано {favorites.length} из {favorites.length} автомобилей
              </div>
              <Button 
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Сравнить выбранные
              </Button>
            </div>

            {/* Favorites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {favorites.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Очистить список
              </Button>
              <Link to="/catalog">
                <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                  Найти еще автомобили
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};