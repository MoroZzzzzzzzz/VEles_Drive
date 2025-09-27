import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  X, Heart, ArrowLeftRight, MessageCircle, Phone, MapPin, 
  Calendar, Fuel, Settings, Gauge, Eye, ChevronLeft, ChevronRight,
  Star, Shield, Clock, FileText, Camera
} from 'lucide-react';
import { ReviewsSection } from './Reviews/ReviewsSection';
import { ChatWindow } from './Messaging/ChatWindow';
import { VinScanner } from './VIN/VinScanner';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from './mock';

export const VehicleDetailModal = ({ vehicle, open, onOpenChange, onContact, onFavorite, onCompare }) => {
  const { isAuthenticated, user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showVinScanner, setShowVinScanner] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Reset image index when vehicle changes
  useEffect(() => {
    if (vehicle) {
      setCurrentImageIndex(0);
    }
  }, [vehicle]);

  if (!vehicle) return null;

  const images = vehicle.images || [];
  const isDealer = user?.role === 'dealer';

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      await onFavorite?.(vehicle.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      await onCompare?.(vehicle.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContact = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      await onContact?.(vehicle);
    } finally {
      setIsLoading(false);
    }
  };

  const specifications = [
    { label: 'Год выпуска', value: vehicle.year, icon: Calendar },
    { label: 'Двигатель', value: vehicle.engine, icon: Fuel },
    { label: 'Мощность', value: `${vehicle.power} л.с.`, icon: Settings },
    { label: 'Пробег', value: `${vehicle.mileage?.toLocaleString('ru-RU') || 0} км`, icon: Gauge },
    { label: 'Цвет', value: vehicle.color, icon: null },
    { label: 'Привод', value: vehicle.drivetrain || 'Полный', icon: null }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full bg-gray-900 border-gray-800 p-0 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Close button */}
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col h-full">
          {/* Image Gallery Section */}
          <div className="relative bg-black">
            {images.length > 0 ? (
              <>
                <div className="aspect-[16/10] overflow-hidden">
                  <img 
                    src={images[currentImageIndex]} 
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Image Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>

                    {/* Image indicators */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex 
                              ? 'bg-amber-500' 
                              : 'bg-white/50 hover:bg-white/70'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Image counter */}
                    <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {vehicle.isNew && (
                    <Badge className="bg-green-600 hover:bg-green-700 text-white">
                      Новый
                    </Badge>
                  )}
                  <Badge className="bg-amber-600 hover:bg-amber-700 text-white">
                    Премиум
                  </Badge>
                </div>
              </>
            ) : (
              <div className="aspect-[16/10] bg-gray-800 flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <Eye className="h-12 w-12 mx-auto mb-2" />
                  <p>Изображения отсутствуют</p>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {vehicle.make} {vehicle.model}
                  </h2>
                  <div className="flex items-center text-gray-400 text-sm mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    {vehicle.location} • {vehicle.dealer}
                  </div>
                  {vehicle.description && (
                    <p className="text-gray-300 text-sm max-w-2xl">
                      {vehicle.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white mb-1">
                    {formatPrice(vehicle.price)}
                  </div>
                  {vehicle.mileage > 0 && (
                    <div className="text-sm text-gray-400">
                      {vehicle.mileage.toLocaleString('ru-RU')} км
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {isAuthenticated && !isDealer && (
                <div className="flex flex-wrap gap-3 mb-8">
                  <Button 
                    onClick={handleContact}
                    disabled={isLoading}
                    className="flex-1 min-w-[200px] bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Написать продавцу
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleFavorite}
                    disabled={isLoading}
                    className="px-4 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    В избранное
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleCompare}
                    disabled={isLoading}
                    className="px-4 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500"
                  >
                    <ArrowLeftRight className="h-4 w-4 mr-2" />
                    Сравнить
                  </Button>
                </div>
              )}

              {/* Specifications Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {specifications.map((spec, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center mb-2">
                      {spec.icon && <spec.icon className="h-4 w-4 mr-2 text-gray-400" />}
                      <span className="text-sm text-gray-400">{spec.label}</span>
                    </div>
                    <div className="text-lg font-semibold text-white">{spec.value}</div>
                  </div>
                ))}
              </div>

              {/* Dealer Information */}
              {vehicle.dealerInfo && (
                <div className="bg-gray-800/30 rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-amber-500" />
                    Информация о продавце
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">
                        {vehicle.dealerInfo.name || vehicle.dealer}
                      </h4>
                      
                      {vehicle.dealerInfo.rating && (
                        <div className="flex items-center mb-2">
                          <div className="flex items-center mr-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${
                                  i < vehicle.dealerInfo.rating 
                                    ? 'text-amber-500 fill-current' 
                                    : 'text-gray-600'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-400">
                            {vehicle.dealerInfo.rating}/5 ({vehicle.dealerInfo.reviewCount || 0} отзывов)
                          </span>
                        </div>
                      )}
                      
                      {vehicle.dealerInfo.address && (
                        <div className="flex items-center text-gray-300 text-sm mb-2">
                          <MapPin className="h-4 w-4 mr-2" />
                          {vehicle.dealerInfo.address}
                        </div>
                      )}
                      
                      {vehicle.dealerInfo.workingHours && (
                        <div className="flex items-center text-gray-300 text-sm">
                          <Clock className="h-4 w-4 mr-2" />
                          {vehicle.dealerInfo.workingHours}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {vehicle.dealerInfo.phone && (
                        <Button 
                          variant="outline"
                          className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                          onClick={() => window.open(`tel:${vehicle.dealerInfo.phone}`)}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          {vehicle.dealerInfo.phone}
                        </Button>
                      )}
                      
                      {vehicle.dealerInfo.email && (
                        <Button 
                          variant="outline"
                          className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                          onClick={() => window.open(`mailto:${vehicle.dealerInfo.email}`)}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          {vehicle.dealerInfo.email}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};