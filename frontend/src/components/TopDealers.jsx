import React from 'react';
import { Star, MapPin, Phone, Clock, Car } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { mockDealers } from './mock';

export const TopDealers = () => {
  const handleDealerClick = (dealerId) => {
    console.log('Открыть дилера:', dealerId);
  };

  const handleContact = (dealerId) => {
    console.log('Связаться с дилером:', dealerId);
  };

  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Лучшие <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">дилеры</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Проверенные автосалоны с безупречной репутацией и высоким уровнем сервиса
          </p>
        </div>

        {/* Dealers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {mockDealers.map((dealer) => (
            <Card key={dealer.id} className="group bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all duration-300 overflow-hidden backdrop-blur-sm">
              {/* Dealer Image */}
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={dealer.image} 
                  alt={dealer.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <CardContent className="p-6">
                {/* Dealer Info */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                      {dealer.name}
                    </h3>
                    <Badge className="bg-green-600 text-white ml-2 flex-shrink-0">
                      ТОП
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                    {dealer.specialization}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center mr-3">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-white font-semibold">{dealer.rating}</span>
                    </div>
                    <span className="text-gray-400 text-sm">
                      {dealer.reviewsCount} отзывов
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex items-start text-gray-300">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{dealer.address}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-300">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    {dealer.workingHours}
                  </div>

                  <div className="flex items-center text-gray-300">
                    <Car className="h-4 w-4 mr-2 text-gray-500" />
                    {dealer.carsCount} автомобилей
                  </div>
                </div>

                {/* Experience Badge */}
                <div className="mb-6">
                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                    С {dealer.established} года
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={() => handleDealerClick(dealer.id)}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
                  >
                    Посмотреть авто
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => handleContact(dealer.id)}
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500"
                  >
                    <Phone className="h-4 w-4 mr-2" />
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
            Все дилеры
          </Button>
        </div>
      </div>
    </section>
  );
};