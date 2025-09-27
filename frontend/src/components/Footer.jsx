import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Phone, Mail, MapPin, Clock, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            
            {/* Company Info */}
            <div className="space-y-6">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  {/* Premium Sports Car Logo SVG */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 p-0.5 shadow-2xl shadow-orange-500/30 group-hover:shadow-orange-500/50 transition-all duration-300">
                    <div className="w-full h-full rounded-full bg-gray-950/90 backdrop-blur-sm flex items-center justify-center border border-orange-400/30 group-hover:border-orange-400/60 transition-all duration-300">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-orange-400 group-hover:text-orange-300 transition-colors duration-300"
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
                <div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold bg-gradient-to-r from-white via-orange-100 to-amber-200 bg-clip-text text-transparent tracking-tight group-hover:from-orange-200 group-hover:via-amber-200 group-hover:to-yellow-200 transition-all duration-300">
                      VELES
                    </span>
                    <span className="text-xs text-orange-400 font-semibold -mt-1 tracking-wider group-hover:text-orange-300 transition-colors duration-300">
                      DRIVE
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Premium Auto</p>
                </div>
              </Link>
              <p className="text-gray-400 leading-relaxed">
                Ведущая платформа для покупки и продажи автомобилей премиум класса. 
                Безопасные сделки с проверенными дилерами.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-amber-500 rounded-lg flex items-center justify-center transition-colors duration-200">
                  <Facebook className="h-5 w-5 text-white" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-amber-500 rounded-lg flex items-center justify-center transition-colors duration-200">
                  <Instagram className="h-5 w-5 text-white" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-amber-500 rounded-lg flex items-center justify-center transition-colors duration-200">
                  <Youtube className="h-5 w-5 text-white" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-amber-500 rounded-lg flex items-center justify-center transition-colors duration-200">
                  <Twitter className="h-5 w-5 text-white" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Быстрые ссылки</h4>
              <ul className="space-y-4">
                <li><Link to="/catalog" className="text-gray-400 hover:text-white transition-colors duration-200">Каталог автомобилей</Link></li>
                <li><Link to="/catalog?premium=true" className="text-gray-400 hover:text-white transition-colors duration-200">Премиум коллекция</Link></li>
                <li><Link to="/dealers" className="text-gray-400 hover:text-white transition-colors duration-200">Дилеры</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors duration-200">Услуги</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors duration-200">О компании</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors duration-200">Новости</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Услуги</h4>
              <ul className="space-y-4">
                <li><Link to="/leasing" className="text-gray-400 hover:text-white transition-colors duration-200">Лизинг</Link></li>
                <li><Link to="/insurance" className="text-gray-400 hover:text-white transition-colors duration-200">Страхование</Link></li>
                <li><Link to="/leasing" className="text-gray-400 hover:text-white transition-colors duration-200">Кредитование</Link></li>
                <li><Link to="/trade-in" className="text-gray-400 hover:text-white transition-colors duration-200">Трейд-ин</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors duration-200">Сервисное обслуживание</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors duration-200">Консультации</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Контакты</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-amber-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-medium">Адрес</p>
                    <a 
                      href="https://yandex.ru/maps/?text=Москва, ул. Тверская, 12" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      Москва, ул. Тверская, 12
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-amber-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-medium">Телефон</p>
                    <a 
                      href="tel:+74951234567"
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      +7 (495) 123-45-67
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-amber-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <a 
                      href="mailto:info@velesdrive.ru"
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      info@velesdrive.ru
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-amber-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-medium">Режим работы</p>
                    <p className="text-gray-400">Пн-Вс: 9:00-21:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="py-12 border-t border-gray-800">
          <div className="max-w-4xl mx-auto text-center">
            <h4 className="text-2xl font-bold text-white mb-4">Подписаться на новости</h4>
            <p className="text-gray-400 mb-8">
              Получайте уведомления о новых поступлениях и эксклюзивных предложениях
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Ваш email адрес"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105">
                Подписаться
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-center md:text-left">
              © {currentYear} VELES DRIVE. Все права защищены.
            </div>
            <div className="flex flex-wrap justify-center md:justify-end space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                Политика конфиденциальности
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                Условия использования
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                Поддержка
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};