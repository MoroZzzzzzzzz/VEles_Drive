import React from 'react';
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
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1640780116262-412da1b923f2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxjYXIlMjBkZWFsZXJzaGlwJTIwbG9nb3xlbnwwfHx8YmxhY2tfYW5kX3doaXRlfDE3NTg5Nzk0MDd8MA&ixlib=rb-4.1.0&q=85&w=48&h=48&fit=crop" 
                    alt="VELES DRIVE" 
                    className="h-12 w-12 rounded-full border-2 border-amber-500 bg-white p-1"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                    <Car className="h-2 w-2 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-white tracking-tight">VELES</span>
                    <span className="text-xs text-amber-400 font-semibold -mt-1">DRIVE</span>
                  </div>
                  <p className="text-sm text-gray-400">Premium Auto</p>
                </div>
              </div>
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
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Каталог автомобилей</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Премиум коллекция</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Дилеры</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Услуги</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">О компании</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Новости</a></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Услуги</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Лизинг</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Страхование</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Кредитование</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Трейд-ин</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Сервисное обслуживание</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Консультации</a></li>
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
                    <p className="text-gray-400">Москва, ул. Тверская, 12</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-amber-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-medium">Телефон</p>
                    <p className="text-gray-400">+7 (495) 123-45-67</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-amber-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <p className="text-gray-400">info@velesdrive.ru</p>
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