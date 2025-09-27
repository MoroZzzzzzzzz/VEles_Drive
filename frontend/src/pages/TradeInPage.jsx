import React, { useState } from 'react';
import { ArrowRightLeft, Calculator, CheckCircle, Car, TrendingUp, Shield, Clock, Camera } from 'lucide-react';
import { Button } from '../components/ui/button';
import { FadeInUp } from '../components/Animations/FadeInUp';

export const TradeInPage = () => {
  const [tradeInForm, setTradeInForm] = useState({
    make: '',
    model: '',
    year: '',
    mileage: '',
    condition: 'excellent',
    hasAccidents: 'no',
    serviceHistory: 'full'
  });

  const [evaluation, setEvaluation] = useState(null);

  const calculateTradeIn = () => {
    const year = parseInt(tradeInForm.year) || 2020;
    const mileage = parseInt(tradeInForm.mileage) || 50000;
    
    // Базовая стоимость (упрощенный алгоритм)
    let basePrice = 2000000; // Базовая цена
    
    // Коэффициент года
    const yearCoeff = Math.max(0.7, 1 - (2024 - year) * 0.08);
    
    // Коэффициент пробега
    const mileageCoeff = Math.max(0.6, 1 - (mileage / 100000) * 0.3);
    
    // Коэффициент состояния
    const conditionCoeff = {
      excellent: 1.0,
      good: 0.85,
      fair: 0.7,
      poor: 0.5
    }[tradeInForm.condition];
    
    // Коэффициент ДТП
    const accidentCoeff = tradeInForm.hasAccidents === 'yes' ? 0.8 : 1.0;
    
    // Коэффициент обслуживания
    const serviceCoeff = {
      full: 1.0,
      partial: 0.9,
      none: 0.75
    }[tradeInForm.serviceHistory];
    
    const finalPrice = basePrice * yearCoeff * mileageCoeff * conditionCoeff * accidentCoeff * serviceCoeff;
    
    setEvaluation({
      estimatedPrice: Math.round(finalPrice),
      marketPrice: Math.round(finalPrice * 1.15),
      depreciation: Math.round((basePrice - finalPrice) / basePrice * 100)
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  };

  const advantages = [
    {
      icon: Calculator,
      title: 'Честная оценка',
      description: 'Используем актуальные рыночные данные и AI-алгоритмы для точной оценки'
    },
    {
      icon: Clock,
      title: 'Быстро и удобно',
      description: 'Оценка за 15 минут, оформление сделки в день обращения'
    },
    {
      icon: Shield,
      title: 'Юридическая чистота',
      description: 'Берем на себя все вопросы по документооборotu и юридическому сопровождению'
    },
    {
      icon: TrendingUp,
      title: 'Максимальная выгода',
      description: 'Доплата в рассрочку или скидка на новый автомобиль до 15%'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Онлайн оценка',
      description: 'Заполните форму с данными о вашем автомобиле'
    },
    {
      number: '02',
      title: 'Осмотр эксперта',
      description: 'Наш эксперт проведет детальный осмотр автомобиля'
    },
    {
      number: '03',
      title: 'Финальная оценка',
      description: 'Получите окончательную стоимость и варианты сделки'
    },
    {
      number: '04',
      title: 'Оформление',
      description: 'Подписание документов и получение денег или скидки'
    }
  ];

  const popularModels = [
    { make: 'BMW', model: 'X5', avgPrice: '4 500 000 ₽' },
    { make: 'Mercedes-Benz', model: 'E-Class', avgPrice: '3 800 000 ₽' },
    { make: 'Audi', model: 'Q7', avgPrice: '5 200 000 ₽' },
    { make: 'Porsche', model: 'Cayenne', avgPrice: '6 800 000 ₽' },
    { make: 'Lexus', model: 'RX', avgPrice: '4 200 000 ₽' },
    { make: 'Land Rover', model: 'Range Rover', avgPrice: '7 500 000 ₽' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 via-teal-600 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <FadeInUp>
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Trade-In в VELES DRIVE
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Обменяйте свой автомобиль на новый с максимальной выгодой
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                  <Calculator className="mr-2 h-5 w-5" />
                  Оценить автомобиль
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
                  <Camera className="mr-2 h-5 w-5" />
                  Записаться на осмотр
                </Button>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Преимущества Trade-In в VELES DRIVE
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Почему стоит обменять автомобиль у нас
              </p>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((advantage, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <advantage.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {advantage.title}
                  </h3>
                  <p className="text-gray-600">
                    {advantage.description}
                  </p>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Калькулятор Trade-In
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Узнайте предварительную стоимость вашего автомобиля
              </p>
            </div>
          </FadeInUp>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Form */}
              <FadeInUp delay={0.1}>
                <div className="bg-gray-50 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Данные автомобиля</h3>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Марка
                        </label>
                        <select
                          value={tradeInForm.make}
                          onChange={(e) => setTradeInForm(prev => ({ ...prev, make: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Выберите марку</option>
                          <option value="BMW">BMW</option>
                          <option value="Mercedes-Benz">Mercedes-Benz</option>
                          <option value="Audi">Audi</option>
                          <option value="Porsche">Porsche</option>
                          <option value="Lexus">Lexus</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Модель
                        </label>
                        <input
                          type="text"
                          placeholder="X5, E-Class, Q7..."
                          value={tradeInForm.model}
                          onChange={(e) => setTradeInForm(prev => ({ ...prev, model: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Год выпуска
                        </label>
                        <select
                          value={tradeInForm.year}
                          onChange={(e) => setTradeInForm(prev => ({ ...prev, year: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Год</option>
                          {Array.from({length: 15}, (_, i) => 2024 - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Пробег (км)
                        </label>
                        <input
                          type="number"
                          placeholder="50000"
                          value={tradeInForm.mileage}
                          onChange={(e) => setTradeInForm(prev => ({ ...prev, mileage: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Состояние автомобиля
                      </label>
                      <select
                        value={tradeInForm.condition}
                        onChange={(e) => setTradeInForm(prev => ({ ...prev, condition: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="excellent">Отличное</option>
                        <option value="good">Хорошее</option>
                        <option value="fair">Удовлетворительное</option>
                        <option value="poor">Требует ремонта</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Участие в ДТП
                      </label>
                      <select
                        value={tradeInForm.hasAccidents}
                        onChange={(e) => setTradeInForm(prev => ({ ...prev, hasAccidents: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="no">Не участвовал</option>
                        <option value="yes">Участвовал в ДТП</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        История обслуживания
                      </label>
                      <select
                        value={tradeInForm.serviceHistory}
                        onChange={(e) => setTradeInForm(prev => ({ ...prev, serviceHistory: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="full">Полная у дилера</option>
                        <option value="partial">Частичная</option>
                        <option value="none">Отсутствует</option>
                      </select>
                    </div>

                    <Button
                      onClick={calculateTradeIn}
                      className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 py-3"
                    >
                      <Calculator className="mr-2 h-5 w-5" />
                      Оценить автомобиль
                    </Button>
                  </div>
                </div>
              </FadeInUp>

              {/* Results */}
              <FadeInUp delay={0.2}>
                <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-6">Предварительная оценка</h3>
                  
                  {evaluation ? (
                    <div className="space-y-6">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                        <div className="text-center">
                          <div className="text-4xl font-bold mb-2">
                            {formatPrice(evaluation.estimatedPrice)}
                          </div>
                          <div className="text-white/80">
                            Стоимость Trade-In
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-white/10 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span>Рыночная стоимость:</span>
                            <span className="font-bold">{formatPrice(evaluation.marketPrice)}</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span>Стоимость Trade-In:</span>
                            <span className="font-bold">{formatPrice(evaluation.estimatedPrice)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Экономия времени:</span>
                            <span className="font-bold text-green-200">Бесценно</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-400/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <ArrowRightLeft className="h-5 w-5 text-yellow-300" />
                          <span className="font-semibold">Дополнительные бонусы:</span>
                        </div>
                        <ul className="text-sm space-y-1 text-white/90">
                          <li>• Скидка до 15% на новый автомобиль</li>
                          <li>• Беспроцентная рассрочка доплаты</li>
                          <li>• Бесплатное юридическое сопровождение</li>
                          <li>• Гарантия чистоты сделки</li>
                        </ul>
                      </div>

                      <Button className="w-full bg-white text-green-600 hover:bg-gray-100 py-3 font-semibold">
                        Записаться на осмотр
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Car className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-white/80">
                        Заполните данные для предварительной оценки автомобиля
                      </p>
                    </div>
                  )}
                </div>
              </FadeInUp>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-6">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Как работает Trade-In
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Простой процесс обмена в 4 шага
              </p>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold text-white">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Models */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Популярные модели для Trade-In
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Средние цены приема автомобилей в отличном состоянии
              </p>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {popularModels.map((model, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <div className="bg-gray-50 rounded-2xl p-6 hover:bg-white hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">{model.make}</h3>
                      <p className="text-gray-600">{model.model}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {model.avgPrice}
                      </div>
                      <div className="text-sm text-gray-500">от</div>
                    </div>
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 lg:px-6 text-center">
          <FadeInUp>
            <h2 className="text-4xl font-bold mb-4">
              Готовы обменять свой автомобиль?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Получите максимальную выгоду от Trade-In в VELES DRIVE
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8 py-4 text-lg">
                <Camera className="mr-2 h-5 w-5" />
                Записаться на осмотр
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
                Получить консультацию
              </Button>
            </div>
          </FadeInUp>
        </div>
      </section>
    </div>
  );
};