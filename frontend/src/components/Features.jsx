import React from 'react';
import { Shield, Users, Award, Headphones, FileCheck, TrendingUp } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export const Features = () => {
  const features = [
    {
      icon: Shield,
      title: 'Безопасность сделок',
      description: 'Все автомобили проходят тщательную проверку. Юридическая чистота гарантирована.',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      icon: Users,
      title: 'Проверенные дилеры',
      description: 'Работаем только с официальными дилерами и авторизованными автосалонами.',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Award,
      title: 'Премиум качество',
      description: 'Эксклюзивные автомобили премиум класса от ведущих мировых брендов.',
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      icon: Headphones,
      title: '24/7 Поддержка',
      description: 'Круглосуточная поддержка клиентов на всех этапах покупки автомобиля.',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: FileCheck,
      title: 'Прозрачные условия',
      description: 'Честные цены, подробная история автомобиля и полная документация.',
      gradient: 'from-indigo-500 to-blue-600'
    },
    {
      icon: TrendingUp,
      title: 'Инвестиционная ценность',
      description: 'Помогаем выбрать автомобили с высоким потенциалом сохранения стоимости.',
      gradient: 'from-teal-500 to-green-600'
    }
  ];

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Почему выбирают <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">нас</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Мы предоставляем полный спектр услуг для безопасной и комфортной покупки автомобиля премиум класса
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-500 backdrop-blur-sm transform hover:scale-105">
              <CardContent className="p-8 text-center">
                {/* Icon */}
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center shadow-lg`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-amber-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-600/20 backdrop-blur-sm rounded-3xl p-12 border border-amber-500/30">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Готовы найти автомобиль мечты?
            </h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Наши эксперты помогут вам выбрать идеальный автомобиль, учитывая все ваши пожелания и бюджет
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transform transition-all duration-200 hover:scale-105 shadow-lg">
                Начать поиск
              </button>
              <button className="bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 px-8 py-4 rounded-xl font-semibold text-lg backdrop-blur-sm transition-all duration-200">
                Получить консультацию
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};