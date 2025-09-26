import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { X, ArrowLeftRight, Star, Fuel, Calendar, Gauge, Settings, Palette, User, ShoppingCart } from 'lucide-react';
import { compareAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

const formatPrice = (price, currency = 'RUB') => {
  const formatted = new Intl.NumberFormat('ru-RU').format(price);
  const currencySymbol = currency === 'RUB' ? '₽' : currency === 'USD' ? '$' : '€';
  return `${formatted} ${currencySymbol}`;
};

const formatMileage = (mileage) => {
  if (!mileage) return 'Не указан';
  return `${new Intl.NumberFormat('ru-RU').format(mileage)} км`;
};

const FeatureRow = ({ feature, vehicles }) => {
  const getValue = (vehicle, key) => {
    const value = vehicle[key];
    
    switch (key) {
      case 'price':
        return formatPrice(value, vehicle.currency);
      case 'mileage':
        return formatMileage(value);
      case 'power':
        return value ? `${value} л.с.` : 'Не указана';
      case 'condition':
        return value === 'new' ? 'Новый' : 'Б/У';
      case 'dealer_rating':
        return value ? `${value}★` : 'Нет рейтинга';
      case 'year':
        return value || 'Не указан';
      default:
        return value || 'Не указано';
    }
  };

  // Проверяем, одинаковые ли значения у всех автомобилей
  const values = vehicles.map(v => getValue(v, feature.key));
  const allSame = values.every(v => v === values[0]);

  return (
    <div className={cn(
      "grid gap-4 py-3 border-b border-gray-700 last:border-b-0",
      `grid-cols-${vehicles.length + 1}`
    )}>
      <div className="font-medium text-gray-300">
        {feature.name}
      </div>
      {vehicles.map((vehicle, index) => (
        <div 
          key={vehicle.id} 
          className={cn(
            "text-white",
            !allSame && "bg-amber-500/10 rounded px-2 py-1"
          )}
        >
          {getValue(vehicle, feature.key)}
        </div>
      ))}
    </div>
  );
};

export const CompareModal = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comparison, setComparison] = useState(null);
  const [features, setFeatures] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open && user) {
      loadComparison();
      loadFeatures();
    }
  }, [open, user]);

  const loadComparison = async () => {
    try {
      setIsLoading(true);
      const data = await compareAPI.getComparison();
      setComparison(data);
    } catch (error) {
      console.error('Error loading comparison:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFeatures = async () => {
    try {
      const data = await compareAPI.getFeatures();
      setFeatures(data);
    } catch (error) {
      console.error('Error loading features:', error);
    }
  };

  const removeVehicle = async (vehicleId) => {
    try {
      await compareAPI.removeFromComparison(vehicleId);
      await loadComparison();
    } catch (error) {
      console.error('Error removing vehicle:', error);
    }
  };

  const clearComparison = async () => {
    if (!window.confirm('Очистить все сравнения?')) {
      return;
    }
    
    try {
      await compareAPI.clearComparison();
      setComparison(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Error clearing comparison:', error);
    }
  };

  const viewVehicle = (vehicleId) => {
    navigate(`/vehicles/${vehicleId}`);
    onOpenChange(false);
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] bg-gray-900 border-gray-700 p-0">
        <DialogHeader className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-xl flex items-center">
              <ArrowLeftRight className="w-6 h-6 mr-3" />
              Сравнение автомобилей
            </DialogTitle>
            <div className="flex space-x-2">
              {comparison && comparison.vehicles.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearComparison}
                  className="text-red-400 hover:text-red-300"
                >
                  Очистить все
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-400">Загрузка...</div>
            </div>
          ) : !comparison || comparison.vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <ArrowLeftRight className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">Нет автомобилей для сравнения</h3>
              <p className="text-center max-w-md">
                Добавьте автомобили в сравнение, нажав на кнопку "Сравнить" в каталоге или на странице автомобиля
              </p>
            </div>
          ) : (
            <div className="p-6">
              {/* Vehicle Images and Basic Info */}
              <div className={cn(
                "grid gap-6 mb-8",
                `grid-cols-${comparison.vehicles.length + 1}`
              )}>
                <div className="font-semibold text-gray-300 text-lg">
                  Автомобили
                </div>
                {comparison.vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="space-y-4">
                    <div className="relative group">
                      <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                        {vehicle.images.length > 0 ? (
                          <img
                            src={vehicle.images[0]}
                            alt={`${vehicle.make} ${vehicle.model}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-gray-700 rounded mx-auto mb-2 flex items-center justify-center">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <p className="text-sm">Нет фото</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Remove button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVehicle(vehicle.id)}
                        className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-center space-y-2">
                      <h3 className="text-white font-bold text-lg">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-amber-400 font-semibold text-xl">
                        {formatPrice(vehicle.price, vehicle.currency)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {vehicle.dealer_name}
                        {vehicle.dealer_rating > 0 && (
                          <span className="ml-2 text-yellow-400">
                            {vehicle.dealer_rating}★
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => viewVehicle(vehicle.id)}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                        size="sm"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Подробнее
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison Table */}
              {Object.entries(features).map(([categoryKey, category]) => (
                <div key={categoryKey} className="mb-8">
                  <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                    {categoryKey === 'basic' && <Star className="w-5 h-5 mr-2" />}
                    {categoryKey === 'technical' && <Settings className="w-5 h-5 mr-2" />}
                    {categoryKey === 'design' && <Palette className="w-5 h-5 mr-2" />}
                    {categoryKey === 'dealer' && <User className="w-5 h-5 mr-2" />}
                    {category.name}
                  </h3>
                  <div className="bg-gray-800 rounded-lg p-4">
                    {category.fields.map((feature) => (
                      <FeatureRow
                        key={feature.key}
                        feature={feature}
                        vehicles={comparison.vehicles}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook for managing comparison state
export const useComparison = () => {
  const { user } = useAuth();
  const [comparisonCount, setComparisonCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadComparisonCount();
    }
  }, [user]);

  const loadComparisonCount = async () => {
    try {
      const comparison = await compareAPI.getComparison();
      setComparisonCount(comparison ? comparison.vehicles.length : 0);
    } catch (error) {
      console.error('Error loading comparison count:', error);
      setComparisonCount(0);
    }
  };

  const addToComparison = async (vehicleId) => {
    if (!user) {
      throw new Error('Необходимо войти в систему');
    }

    try {
      const currentComparison = await compareAPI.getComparison();
      const currentIds = currentComparison ? currentComparison.vehicle_ids : [];
      
      if (currentIds.includes(vehicleId)) {
        throw new Error('Автомобиль уже добавлен в сравнение');
      }

      if (currentIds.length >= 4) {
        throw new Error('Максимум 4 автомобиля для сравнения');
      }

      const newIds = [...currentIds, vehicleId];
      
      if (currentComparison) {
        await compareAPI.updateComparison(newIds);
      } else {
        await compareAPI.createComparison(newIds);
      }
      
      await loadComparisonCount();
      return true;
    } catch (error) {
      throw error;
    }
  };

  const removeFromComparison = async (vehicleId) => {
    try {
      await compareAPI.removeFromComparison(vehicleId);
      await loadComparisonCount();
      return true;
    } catch (error) {
      throw error;
    }
  };

  const clearComparison = async () => {
    try {
      await compareAPI.clearComparison();
      setComparisonCount(0);
      return true;
    } catch (error) {
      throw error;
    }
  };

  return {
    comparisonCount,
    addToComparison,
    removeFromComparison,
    clearComparison,
    refreshCount: loadComparisonCount
  };
};