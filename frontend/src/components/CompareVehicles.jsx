import React, { useState, useEffect } from 'react';
import { X, Plus, Car, Fuel, Settings, Calendar, Gauge, Palette } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { formatPrice } from './mock';

export const CompareVehicles = ({ compareList = [], onRemove, onClose }) => {
  if (compareList.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <Card className="bg-gray-900 border-gray-800 max-w-md">
          <CardContent className="p-8 text-center">
            <Car className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-4">
              Список сравнения пуст
            </h3>
            <p className="text-gray-400 mb-6">
              Добавьте автомобили для сравнения из каталога
            </p>
            <Button onClick={onClose}>
              Закрыть
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const specifications = [
    { key: 'year', label: 'Год выпуска', icon: Calendar },
    { key: 'mileage', label: 'Пробег', icon: Gauge },
    { key: 'engine', label: 'Двигатель', icon: Fuel },
    { key: 'power', label: 'Мощность', icon: Settings },
    { key: 'transmission', label: 'Трансмиссия', icon: Settings },
    { key: 'fuel_type', label: 'Тип топлива', icon: Fuel },
    { key: 'color', label: 'Цвет', icon: Palette },
    { key: 'body_type', label: 'Тип кузова', icon: Car }
  ];

  return (
    <div className="fixed inset-0 bg-black/90 overflow-auto z-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">
            Сравнение автомобилей
          </h1>
          <Button variant="ghost" onClick={onClose} className="text-white">
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Vehicle Headers */}
            <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: `200px repeat(${compareList.length}, 300px)` }}>
              <div></div>
              {compareList.map((vehicle) => (
                <Card key={vehicle.id} className="bg-gray-900/50 border-gray-800">
                  <div className="relative">
                    <button
                      onClick={() => onRemove(vehicle.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 z-10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img 
                        src={vehicle.images?.[0]?.url || "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&q=80"} 
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold text-white mb-2">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <div className="text-2xl font-bold text-amber-400 mb-4">
                      {formatPrice(vehicle.price)}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {vehicle.condition === 'new' && (
                        <Badge className="bg-green-600 text-white text-xs">
                          Новый
                        </Badge>
                      )}
                      {vehicle.is_featured && (
                        <Badge className="bg-amber-600 text-white text-xs">
                          Премиум
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Specifications Comparison */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Технические характеристики</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {specifications.map((spec) => (
                    <div 
                      key={spec.key} 
                      className="grid gap-4 py-3 border-b border-gray-800 last:border-b-0"
                      style={{ gridTemplateColumns: `200px repeat(${compareList.length}, 300px)` }}
                    >
                      <div className="flex items-center space-x-2 text-gray-300">
                        <spec.icon className="h-4 w-4" />
                        <span className="font-medium">{spec.label}</span>
                      </div>
                      {compareList.map((vehicle) => (
                        <div key={vehicle.id} className="text-white">
                          {spec.key === 'mileage' ? (
                            vehicle[spec.key] ? `${vehicle[spec.key].toLocaleString()} км` : 'Новый'
                          ) : spec.key === 'power' ? (
                            vehicle[spec.key] ? `${vehicle[spec.key]} л.с.` : 'Не указано'
                          ) : (
                            vehicle[spec.key] || 'Не указано'
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-center space-x-4">
              <Button 
                variant="outline" 
                className="border-gray-600 text-gray-300"
                onClick={onClose}
              >
                Закрыть сравнение
              </Button>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600">
                Связаться с дилерами
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};