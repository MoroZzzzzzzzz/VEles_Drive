import React, { useState, useEffect } from 'react';
import { Search, User, Heart, Menu, X, Car, Phone, MapPin, LogOut, MessageCircle, ArrowLeftRight } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from './Auth/LoginModal';
import { MessagesModal } from './Messages/MessagesModal';
import { CompareModal, useComparison } from './Compare/CompareModal';
import { Link, useNavigate } from 'react-router-dom';
import { messagesAPI } from '../services/api';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated, user, logout } = useAuth();
  const { comparisonCount } = useComparison();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Главная', href: '/', icon: Car },
    { name: 'Каталог', href: '/catalog', icon: Car },
    { name: 'Дилеры', href: '/dealers', icon: MapPin },
    { name: 'О нас', href: '/about' },
    { name: 'Контакты', href: '/contacts', icon: Phone }
  ];

  // Load unread messages count
  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadUnreadCount = async () => {
    try {
      const data = await messagesAPI.getUnreadCount();
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

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
            <Link to="/" className="flex items-center space-x-3">
              <div className="relative">
                {/* Cool Sports Car SVG Logo */}
                <svg 
                  width="48" 
                  height="32" 
                  viewBox="0 0 48 32" 
                  className="text-orange-500 hover:text-orange-400 transition-colors"
                >
                  <defs>
                    <linearGradient id="carGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>
                  </defs>
                  {/* Sports Car Body */}
                  <path 
                    d="M2 20 L8 14 L12 12 L20 10 L32 10 L40 12 L44 16 L46 20 L44 24 L40 26 L8 26 L2 20 Z" 
                    fill="url(#carGradient)" 
                    stroke="#f97316" 
                    strokeWidth="0.5"
                  />
                  {/* Front Wing/Spoiler */}
                  <path 
                    d="M42 16 L46 14 L48 16 L46 18 L42 16 Z" 
                    fill="#f97316"
                  />
                  {/* Rear Spoiler */}
                  <path 
                    d="M2 16 L0 14 L2 12 L4 14 L2 16 Z" 
                    fill="#f97316"
                  />
                  {/* Windshield */}
                  <path 
                    d="M14 12 L18 8 L28 8 L32 12 L28 14 L18 14 L14 12 Z" 
                    fill="#1f2937" 
                    opacity="0.8"
                  />
                  {/* Wheels */}
                  <circle cx="12" cy="22" r="3" fill="#1f2937" stroke="#f97316" strokeWidth="1"/>
                  <circle cx="36" cy="22" r="3" fill="#1f2937" stroke="#f97316" strokeWidth="1"/>
                  {/* Wheel Details */}
                  <circle cx="12" cy="22" r="1.5" fill="#f97316"/>
                  <circle cx="36" cy="22" r="1.5" fill="#f97316"/>
                  {/* Headlights */}
                  <circle cx="42" cy="18" r="1.5" fill="#fbbf24" opacity="0.9"/>
                  <circle cx="42" cy="22" r="1.5" fill="#fbbf24" opacity="0.9"/>
                  {/* Side Details */}
                  <path 
                    d="M10 18 L38 18 L40 20 L38 22 L10 22 L8 20 L10 18 Z" 
                    fill="#ea580c" 
                    opacity="0.7"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white tracking-tight">VELES</span>
                <span className="text-xs text-amber-400 font-semibold -mt-1 tracking-wider">DRIVE</span>
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
                <>
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
                  
                  {/* Messages */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsMessagesModalOpen(true)}
                    className="text-gray-300 hover:text-white relative"
                  >
                    <MessageCircle className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Button>
                  
                  {/* Compare */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsCompareModalOpen(true)}
                    className="text-gray-300 hover:text-white relative"
                  >
                    <ArrowLeftRight className="h-5 w-5" />
                    {comparisonCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {comparisonCount}
                      </span>
                    )}
                  </Button>
                </>
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
                className="lg:hidden text-gray-300 hover:text-white z-50 relative"
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
      
      {/* Messages Modal */}
      {isAuthenticated && (
        <MessagesModal 
          open={isMessagesModalOpen} 
          onOpenChange={setIsMessagesModalOpen}
        />
      )}
      
      {/* Compare Modal */}
      {isAuthenticated && (
        <CompareModal 
          open={isCompareModalOpen} 
          onOpenChange={setIsCompareModalOpen}
        />
      )}
    </>
  );
};