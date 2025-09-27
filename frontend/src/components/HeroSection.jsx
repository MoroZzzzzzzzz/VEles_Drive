import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Filter, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { vehiclesAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const HeroSection = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchParams, setSearchParams] = useState({
    make: '',
    bodyType: '',
    priceFrom: '',
    priceTo: '',
    year: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const data = await vehiclesAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleSearch = async () => {
    console.log('Поиск автомобилей с параметрами:', searchParams);
    
    setIsSearching(true);
    
    try {
      // Convert to URL params and navigate to catalog
      const params = new URLSearchParams();
      if (searchParams.make) params.set('make', searchParams.make);
      if (searchParams.bodyType) params.set('body_type', searchParams.bodyType);
      if (searchParams.priceFrom) params.set('price_from', searchParams.priceFrom);
      if (searchParams.priceTo) params.set('price_to', searchParams.priceTo);
      if (searchParams.year) params.set('year_from', searchParams.year);
      
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      navigate(`/search?${params.toString()}`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1485291571150-772bcfc10da5?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=1920&h=1080&fit=crop"
          alt="Premium VELES DRIVE Luxury Sports Car"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 lg:px-6 text-center">
        {/* Main Heading */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            ПРЕМИАЛЬНЫЕ АВТОМОБИЛИ
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
              ВЫСШЕГО КЛАССА
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Эксклюзивная коллекция спорткаров и люксовых автомобилей.<br />
            <span className="text-orange-300">Только проверенные дилеры. Максимальная безопасность сделок.</span>
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 md:p-8 max-w-6xl mx-auto border border-orange-500/30 shadow-2xl shadow-orange-500/10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
            {/* Марка автомобиля */}
            <div className="space-y-2">
              <label className="text-orange-200 text-sm font-medium">Марка автомобиля</label>
              <Input
                placeholder="Введите марку"
                value={searchParams.make}
                onChange={(e) => setSearchParams(prev => ({ ...prev, make: e.target.value }))}
                className="bg-white/95 border border-orange-300/20 h-12 text-gray-900 placeholder:text-gray-500 focus:border-orange-400 focus:ring-orange-400/20"
              />
            </div>

            {/* Кузов */}
            <div className="space-y-2">
              <label className="text-orange-200 text-sm font-medium">Кузов</label>
              {isLoadingCategories ? (
                <div className="bg-white/95 border border-orange-300/20 h-12 rounded-md flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                  <span className="ml-2 text-gray-500 text-sm">Загрузка...</span>
                </div>
              ) : categories ? (
                <Select value={searchParams.bodyType} onValueChange={(value) => 
                  setSearchParams(prev => ({ ...prev, bodyType: value }))
                }>
                  <SelectTrigger className="bg-white/95 border border-orange-300/20 h-12 text-gray-900 focus:border-orange-400 focus:ring-orange-400/20">
                    <SelectValue placeholder="Тип кузова" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.body_types?.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="bg-white/95 border border-orange-300/20 h-12 rounded-md flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Не удалось загрузить</span>
                </div>
              )}
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
              <Input 
                type="number"
                placeholder="Год"
                value={searchParams.year}
                onChange={(e) => setSearchParams(prev => ({ ...prev, year: e.target.value }))}
                className="bg-white/90 border-0 h-12 text-gray-900 placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-12 py-4 text-lg font-semibold h-auto rounded-xl border-0 shadow-2xl transform transition-all duration-200 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSearching ? (
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              ) : (
                <Search className="mr-3 h-5 w-5" />
              )}
              {isSearching ? 'Поиск...' : 'Подобрать авто'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/catalog')}
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