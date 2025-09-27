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
                {/* Premium Sports Car Logo SVG */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 p-0.5 shadow-2xl shadow-orange-500/30">
                  <div className="w-full h-full rounded-full bg-black/90 backdrop-blur-sm flex items-center justify-center border border-orange-400/30">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-orange-400"
                    >
                      <path
                        d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 16C5.67 16 5 15.33 5 14.5S5.67 13 6.5 13 8 13.67 8 14.5 7.33 16 6.5 16ZM17.5 16C16.67 16 16 15.33 16 14.5S16.67 13 17.5 13 19 13.67 19 14.5 18.33 16 17.5 16ZM5.81 11L6.87 7H17.13L18.19 11H5.81Z"
                        fill="currentColor"
                      />
                      <path
                        d="M12 8.5C11.17 8.5 10.5 9.17 10.5 10S11.17 11.5 12 11.5 13.5 10.83 13.5 10 12.83 8.5 12 8.5Z"
                        fill="currentColor"
                        className="opacity-80"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-white via-orange-100 to-amber-200 bg-clip-text text-transparent tracking-tight">
                  VELES
                </span>
                <span className="text-xs text-orange-400 font-semibold -mt-1 tracking-wider">
                  DRIVE
                </span>
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