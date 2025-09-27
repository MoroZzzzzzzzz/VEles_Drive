import React, { useState, useEffect } from 'react';
import { Heart, Eye, MapPin, Fuel, Settings, Calendar, MessageCircle, ArrowLeftRight, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { mockCars, formatPrice } from './mock';
import { VehicleDetailModal } from './VehicleDetailModal';
import { useAuth } from '../contexts/AuthContext';
import { favoritesAPI, messagesAPI, compareAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';

export const FeaturedCars = () => {
  const featuredCars = mockCars.filter(car => car.isFeatured).slice(0, 6);

  const handleCarClick = (carId) => {
    console.log('Открыть автомобиль:', carId);
  };

  const handleFavorite = (carId) => {
    console.log('Добавить в избранное:', carId);
  };

  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Популярные <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">автомобили</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Самые востребованные модели премиум класса от ведущих мировых производителей
          </p>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCars.map((car) => (
            <Card key={car.id} className="group bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-300 overflow-hidden backdrop-blur-sm">
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
                    <Badge className="bg-green-600 hover:bg-green-700 text-white">
                      Новый
                    </Badge>
                  )}
                  <Badge className="bg-amber-600 hover:bg-amber-700 text-white">
                    Премиум
                  </Badge>
                </div>

                {/* Actions */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 hover:text-red-400 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavorite(car.id);
                    }}
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
                    onClick={() => handleCarClick(car.id)}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
                  >
                    Подробнее
                  </Button>
                  <Button 
                    variant="outline"
                    className="px-4 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500"
                  >
                    Связаться
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
    </section>
  );
};