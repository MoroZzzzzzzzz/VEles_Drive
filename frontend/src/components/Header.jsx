import React, { useState } from 'react';
import { Search, User, Heart, Menu, X, Car, Phone, MapPin } from 'lucide-react';
import { Button } from './ui/button';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Каталог', href: '#catalog', icon: Car },
    { name: 'Дилеры', href: '#dealers', icon: MapPin },
    { name: 'Услуги', href: '#services' },
    { name: 'Контакты', href: '#contacts', icon: Phone }
  ];

  return (
    <header className="fixed top-0 w-full bg-black/90 backdrop-blur-md z-50 border-b border-white/10">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Car className="h-7 w-7 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-white">VELES DRIVE</h1>
              <p className="text-xs text-gray-400">Premium Auto</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span className="font-medium">{item.name}</span>
              </a>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <Button variant="ghost" size="sm" className="hidden md:flex text-gray-300 hover:text-white">
              <Search className="h-5 w-5" />
            </Button>
            
            {/* Favorites */}
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white relative">
              <Heart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Button>

            {/* User Account */}
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
              <User className="h-5 w-5" />
              <span className="hidden md:inline ml-2">Войти</span>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-gray-300 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/10">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span className="font-medium">{item.name}</span>
                </a>
              ))}
              <div className="pt-4 border-t border-white/10">
                <a
                  href="#search"
                  className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200 py-2"
                >
                  <Search className="h-5 w-5" />
                  <span className="font-medium">Поиск</span>
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};