import React, { useState, useEffect } from 'react';
import { Heart, Eye, MapPin, Fuel, Settings, Calendar, MessageCircle, ArrowLeftRight, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { mockCars, formatPrice } from './mock';
import { SimpleVehicleModal } from './SimpleVehicleModal';
import { useAuth } from '../contexts/AuthContext';
import { favoritesAPI, messagesAPI, compareAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';

export const FeaturedCars = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [featuredCars, setFeaturedCars] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loadingActions, setLoadingActions] = useState({});

  useEffect(() => {
    // Enhance mock cars with dealer info
    const enhancedCars = mockCars.filter(car => car.isFeatured).slice(0, 6).map(car => ({
      ...car,
      dealerInfo: {
        name: car.dealer,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        reviewCount: Math.floor(Math.random() * 50) + 10,
        address: car.location + ", улица Автомобильная, 123",
        phone: "+7 (495) 123-45-67",
        email: "info@dealer.ru",
        workingHours: "Пн-Пт: 9:00-20:00, Сб-Вс: 10:00-18:00"
      }
    }));
    setFeaturedCars(enhancedCars);
  }, []);

  const handleCarClick = (car) => {
    setSelectedVehicle(car);
    setIsDetailModalOpen(true);
  };

  const handleFavorite = async (carId) => {
    if (!isAuthenticated) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите в аккаунт для добавления в избранное",
        variant: "destructive"
      });
      return;
    }

    setLoadingActions(prev => ({ ...prev, [`favorite_${carId}`]: true }));
    
    try {
      await favoritesAPI.addToFavorites(carId);
      toast({
        title: "Добавлено в избранное",
        description: "Автомобиль успешно добавлен в избранное",
      });
    } catch (error) {
      console.error('Add to favorites error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить в избранное",
        variant: "destructive"
      });
    } finally {
      setLoadingActions(prev => ({ ...prev, [`favorite_${carId}`]: false }));
    }
  };

  const handleCompare = async (carId) => {
    if (!isAuthenticated) {
      toast({
        title: "Требуется авторизация", 
        description: "Войдите в аккаунт для добавления к сравнению",
        variant: "destructive"
      });
      return;
    }

    setLoadingActions(prev => ({ ...prev, [`compare_${carId}`]: true }));
    
    try {
      await compareAPI.addToCompare([carId]);
      toast({
        title: "Добавлено к сравнению",
        description: "Автомобиль добавлен к списку сравнения",
      });
    } catch (error) {
      console.error('Add to compare error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить к сравнению",
        variant: "destructive"
      });
    } finally {
      setLoadingActions(prev => ({ ...prev, [`compare_${carId}`]: false }));
    }
  };

  const handleContact = async (vehicle) => {
    if (!isAuthenticated) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите в аккаунт для связи с продавцом",
        variant: "destructive"
      });
      return;
    }

    setLoadingActions(prev => ({ ...prev, [`contact_${vehicle.id}`]: true }));
    
    try {
      const message = `Здравствуйте! Интересует автомобиль ${vehicle.make} ${vehicle.model} ${vehicle.year} года. Можно узнать подробности?`;
      await messagesAPI.sendMessage({
        recipient_id: "dealer-id", // This should be the actual dealer ID
        message: message,
        vehicle_id: vehicle.id
      });
      
      toast({
        title: "Сообщение отправлено",
        description: "Ваше сообщение отправлено продавцу",
      });
      setIsDetailModalOpen(false);
    } catch (error) {
      console.error('Send message error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive"
      });
    } finally {
      setLoadingActions(prev => ({ ...prev, [`contact_${vehicle.id}`]: false }));
    }
  };

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Эксклюзивная <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">коллекция</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Премиальные спорткары и суперкары от легендарных производителей
          </p>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCars.map((car) => (
            <Card key={car.id} className="group bg-gray-900/30 border border-gray-800/50 hover:border-orange-500/50 transition-all duration-500 overflow-hidden backdrop-blur-md shadow-2xl shadow-black/50 hover:shadow-orange-500/20">
              <div className="relative">
                {/* Car Image */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={car.images[0]} 
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {car.isNew && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
                      Новый
                    </Badge>
                  )}
                  <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-black font-bold shadow-lg">
                    Премиум
                  </Badge>
                </div>

                {/* Actions */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={loadingActions[`favorite_${car.id}`]}
                    className="h-10 w-10 rounded-full bg-black/70 backdrop-blur-md border border-orange-500/30 text-orange-300 hover:bg-orange-500 hover:text-white transition-all duration-300 disabled:opacity-50 shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavorite(car.id);
                    }}
                  >
                    {loadingActions[`favorite_${car.id}`] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Heart className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={loadingActions[`compare_${car.id}`]}
                    className="h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors disabled:opacity-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCompare(car.id);
                    }}
                  >
                    {loadingActions[`compare_${car.id}`] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowLeftRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <CardContent 
                className="p-6 cursor-pointer" 
                onClick={() => handleCarClick(car)}
              >
                {/* Car Info */}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                    {car.make} {car.model}
                  </h3>
                  <div className="flex items-center text-gray-400 text-sm mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    {car.location} • {car.dealer}
                  </div>
                </div>

                {/* Specifications */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="flex items-center text-gray-300">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    {car.year} год
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Fuel className="h-4 w-4 mr-2 text-gray-500" />
                    {car.engine}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Settings className="h-4 w-4 mr-2 text-gray-500" />
                    {car.power} л.с.
                  </div>
                  <div className="flex items-center text-gray-300">
                    <span className="w-4 h-4 mr-2 rounded-full bg-gray-500"></span>
                    {car.color}
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-3xl font-bold text-white">
                      {formatPrice(car.price)}
                    </div>
                    {car.mileage > 0 && (
                      <div className="text-sm text-gray-400">
                        {car.mileage.toLocaleString('ru-RU')} км
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCarClick(car);
                    }}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Подробнее
                  </Button>
                  <Button 
                    variant="outline"
                    disabled={loadingActions[`contact_${car.id}`] || !isAuthenticated}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContact(car);
                    }}
                    className="px-4 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500 disabled:opacity-50"
                  >
                    {loadingActions[`contact_${car.id}`] ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <MessageCircle className="h-4 w-4 mr-2" />
                    )}
                    {isAuthenticated ? 'Связаться' : 'Войдите'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button 
            variant="outline"
            size="lg"
            className="bg-transparent border-2 border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-white px-12 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
          >
            Смотреть все автомобили
          </Button>
        </div>
      </div>
      
      {/* Vehicle Detail Modal */}
      <SimpleVehicleModal
        vehicle={selectedVehicle}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        onContact={handleContact}
        onFavorite={handleFavorite}
        onCompare={handleCompare}
      />
    </section>
  );
};