import React, { useState } from 'react';
import { Search, ChevronDown, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { carMakes, bodyTypes, years } from './mock';

export const HeroSection = () => {
  const [searchParams, setSearchParams] = useState({
    make: '',
    bodyType: '',
    priceFrom: '',
    priceTo: '',
    year: ''
  });

  const handleSearch = () => {
    console.log('Поиск автомобилей с параметрами:', searchParams);
    // Здесь будет логика поиска
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1920&q=80"
          alt="Luxury Car"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 lg:px-6 text-center">
        {/* Main Heading */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            БЕЗОПАСНАЯ ПОКУПКА
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              АВТО ПРЕМИУМ КЛАССА
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Только официальные дилеры и проверенные автосалоны.<br />
            Исключительное качество. Прозрачные условия
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 max-w-6xl mx-auto border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
            {/* Марка автомобиля */}
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">Марка автомобиля</label>
              <Select value={searchParams.make} onValueChange={(value) => 
                setSearchParams(prev => ({ ...prev, make: value }))
              }>
                <SelectTrigger className="bg-white/90 border-0 h-12 text-gray-900">
                  <SelectValue placeholder="Выберите марку" />
                </SelectTrigger>
                <SelectContent>
                  {carMakes.map(make => (
                    <SelectItem key={make} value={make}>{make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Кузов */}
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">Кузов</label>
              <Select value={searchParams.bodyType} onValueChange={(value) => 
                setSearchParams(prev => ({ ...prev, bodyType: value }))
              }>
                <SelectTrigger className="bg-white/90 border-0 h-12 text-gray-900">
                  <SelectValue placeholder="Тип кузова" />
                </SelectTrigger>
                <SelectContent>
                  {bodyTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Цена от */}
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">Цена от</label>
              <Input 
                type="number"
                placeholder="от"
                value={searchParams.priceFrom}
                onChange={(e) => setSearchParams(prev => ({ ...prev, priceFrom: e.target.value }))}
                className="bg-white/90 border-0 h-12 text-gray-900 placeholder:text-gray-500"
              />
            </div>

            {/* Цена до */}
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">до</label>
              <Input 
                type="number"
                placeholder="до"
                value={searchParams.priceTo}
                onChange={(e) => setSearchParams(prev => ({ ...prev, priceTo: e.target.value }))}
                className="bg-white/90 border-0 h-12 text-gray-900 placeholder:text-gray-500"
              />
            </div>

            {/* Год выпуска */}
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">Год выпуска</label>
              <Select value={searchParams.year} onValueChange={(value) => 
                setSearchParams(prev => ({ ...prev, year: value }))
              }>
                <SelectTrigger className="bg-white/90 border-0 h-12 text-gray-900">
                  <SelectValue placeholder="Год" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Button */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleSearch}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-12 py-4 text-lg font-semibold h-auto rounded-xl border-0 shadow-2xl transform transition-all duration-200 hover:scale-105"
            >
              <Search className="mr-3 h-5 w-5" />
              Подобрать авто
            </Button>
            
            <Button 
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 px-8 py-4 text-lg h-auto rounded-xl backdrop-blur-sm"
            >
              <Filter className="mr-2 h-5 w-5" />
              Расширенный поиск
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">1000+</div>
            <div className="text-gray-300">Автомобилей</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">50+</div>
            <div className="text-gray-300">Дилеров</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">15+</div>
            <div className="text-gray-300">Брендов</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">100%</div>
            <div className="text-gray-300">Гарантия</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="animate-bounce">
          <ChevronDown className="h-8 w-8 text-white/70" />
        </div>
      </div>
    </div>
  );
};