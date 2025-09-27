import React, { useState, useEffect } from 'react';
import { Car, Users, MapPin, Award, TrendingUp, Star, Shield, Clock } from 'lucide-react';
import { FadeInUp } from '../Animations/FadeInUp';

export const StatsSection = () => {
  const [counts, setCounts] = useState({
    vehicles: 0,
    dealers: 0,
    cities: 0,
    satisfied: 0
  });

  const finalCounts = {
    vehicles: 2500,
    dealers: 150,
    cities: 85,
    satisfied: 98.5
  };

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepTime = duration / steps;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setCounts({
        vehicles: Math.floor(finalCounts.vehicles * easeOut),
        dealers: Math.floor(finalCounts.dealers * easeOut),
        cities: Math.floor(finalCounts.cities * easeOut),
        satisfied: Math.min(finalCounts.satisfied, parseFloat((finalCounts.satisfied * easeOut).toFixed(1)))
      });
      
      if (step >= steps) {
        clearInterval(timer);
        setCounts(finalCounts);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      icon: Car,
      value: counts.vehicles.toLocaleString('ru-RU'),
      label: 'Автомобилей в каталоге',
      suffix: '+',
      color: 'text-blue-400'
    },
    {
      icon: Users,
      value: counts.dealers.toString(),
      label: 'Проверенных дилеров',
      suffix: '+',
      color: 'text-green-400'
    },
    {
      icon: MapPin,
      value: counts.cities.toString(),
      label: 'Городов России',
      suffix: '+',
      color: 'text-purple-400'
    },
    {
      icon: Star,
      value: `${counts.satisfied}%`,
      label: 'Довольных клиентов',
      suffix: '',
      color: 'text-amber-400'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4">
        <FadeInUp>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              VELES DRIVE в цифрах
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Мы гордимся достижениями нашей платформы и доверием тысяч клиентов по всей России
            </p>
          </div>
        </FadeInUp>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <FadeInUp key={index} delay={200 + index * 100}>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 text-center hover:border-amber-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700/50 mb-6`}>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center">
                    <span className={`text-4xl md:text-5xl font-bold ${stat.color}`}>
                      {stat.value}
                    </span>
                    <span className={`text-2xl md:text-3xl font-bold ${stat.color}`}>
                      {stat.suffix}
                    </span>
                  </div>
                  <p className="text-gray-300 font-medium text-lg">
                    {stat.label}
                  </p>
                </div>
              </div>
            </FadeInUp>
          ))}
        </div>

        <FadeInUp delay={800}>
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-600/10 border border-amber-500/20 rounded-2xl p-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <Shield className="h-8 w-8 text-amber-500" />
                <Award className="h-8 w-8 text-amber-500" />
                <Star className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Лидер рынка автомобильных площадок России
              </h3>
              <p className="text-gray-300 text-lg">
                Более 10 лет успешной работы, миллионы довольных клиентов и тысячи успешных сделок
              </p>
            </div>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
};