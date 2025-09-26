import React, { useState, useEffect } from 'react';
import { Search, User, Heart, Menu, X, Car, Phone, MapPin, LogOut, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from './Auth/LoginModal';
import { MessagesModal } from './Messages/MessagesModal';
import { Link, useNavigate } from 'react-router-dom';
import { messagesAPI } from '../services/api';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Главная', href: '/', icon: Car },
    { name: 'Каталог', href: '/catalog', icon: Car },
    { name: 'Дилеры', href: '/dealers', icon: MapPin },
    { name: 'О нас', href: '/about' },
    { name: 'Контакты', href: '/contacts', icon: Phone }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsMenuOpen(false);
  };

  const handleFavoritesClick = () => {
    navigate('/favorites');
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 w-full bg-black/90 backdrop-blur-md z-50 border-b border-white/10">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Car className="h-7 w-7 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-white">VELES DRIVE</h1>
                <p className="text-xs text-gray-400">Premium Auto</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/catalog')}
                className="hidden md:flex text-gray-300 hover:text-white"
              >
                <Search className="h-5 w-5" />
              </Button>
              
              {/* Favorites - only for authenticated users */}
              {isAuthenticated && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleFavoritesClick}
                  className="text-gray-300 hover:text-white relative"
                >
                  <Heart className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    0
                  </span>
                </Button>
              )}

              {/* User Account */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <div className="hidden md:block text-right">
                    <p className="text-white text-sm font-medium">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-gray-400 text-xs capitalize">
                      {user?.role === 'buyer' ? 'Покупатель' : 
                       user?.role === 'dealer' ? 'Дилер' : 'Администратор'}
                    </p>
                  </div>
                  <button
                    onClick={handleProfileClick}
                    className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center hover:from-amber-600 hover:to-orange-700 transition-colors"
                  >
                    <User className="h-4 w-4 text-white" />
                  </button>
                  {user?.role === 'dealer' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate('/dealer/dashboard')}
                      className="text-gray-300 hover:text-white"
                    >
                      ERP
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    className="text-gray-300 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-gray-300 hover:text-white"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline ml-2">Войти</span>
                </Button>
              )}

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
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon && <item.icon className="h-5 w-5" />}
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
                
                {/* Mobile Auth Actions */}
                <div className="pt-4 border-t border-white/10 space-y-2">
                  {isAuthenticated ? (
                    <>
                      <button
                        onClick={handleProfileClick}
                        className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200 py-2 w-full"
                      >
                        <User className="h-5 w-5" />
                        <span className="font-medium">Профиль</span>
                      </button>
                      <button
                        onClick={handleFavoritesClick}
                        className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200 py-2 w-full"
                      >
                        <Heart className="h-5 w-5" />
                        <span className="font-medium">Избранное</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200 py-2 w-full"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Выйти</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsLoginModalOpen(true);
                      }}
                      className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200 py-2 w-full"
                    >
                      <User className="h-5 w-5" />
                      <span className="font-medium">Войти</span>
                    </button>
                  )}
                  <Link
                    to="/catalog"
                    className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Search className="h-5 w-5" />
                    <span className="font-medium">Поиск</span>
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal 
        open={isLoginModalOpen} 
        onOpenChange={setIsLoginModalOpen} 
      />
    </>
  );
};