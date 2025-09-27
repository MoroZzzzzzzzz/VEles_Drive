import React from 'react';
import { ArrowRight, Phone, MessageCircle, Star, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { FadeInUp } from '../Animations/FadeInUp';
import { Link } from 'react-router-dom';

export const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <FadeInUp>
            <div className="text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Готовы найти автомобиль мечты?
              </h2>
              <p className="text-xl mb-8 text-white/90 leading-relaxed">
                Присоединяйтесь к тысячам довольных клиентов VELES DRIVE. 
                Мы поможем найти идеальный автомобиль с гарантией качества и прозрачности сделки.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/search">
                  <Button 
                    size="lg"
                    className="bg-white text-orange-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    Найти автомобиль
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-orange-600 font-semibold px-8 py-4 text-lg rounded-xl transition-all duration-300"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  +7 (495) 123-45-67
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 text-white/80">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm font-medium">Гарантия качества</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="text-sm font-medium">4.9/5 рейтинг</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">24/7 поддержка</span>
                </div>
              </div>
            </div>
          </FadeInUp>

          {/* Stats Card */}
          <FadeInUp delay={300}>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                Почему выбирают нас?
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">2500+</div>
                  <div className="text-white/80 text-sm">Автомобилей</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">150+</div>
                  <div className="text-white/80 text-sm">Дилеров</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">85+</div>
                  <div className="text-white/80 text-sm">Городов</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">98.5%</div>
                  <div className="text-white/80 text-sm">Довольных клиентов</div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/20 text-center">
                <p className="text-white/90 text-sm">
                  Более 10 лет на рынке • Проверенные автомобили • Безопасные сделки
                </p>
              </div>
            </div>
          </FadeInUp>
        </div>
      </div>
    </section>
  );
};