import React, { useState } from 'react';
import { Calculator, CheckCircle, CreditCard, Car, TrendingUp, Shield, Clock, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { FadeInUp } from '../components/Animations/FadeInUp';

export const LeasingPage = () => {
  const [leasingForm, setLeasingForm] = useState({
    vehiclePrice: '',
    initialPayment: '',
    leaseTerm: '36',
    monthlyBudget: ''
  });

  const [calculationResult, setCalculationResult] = useState(null);

  const calculateLeasing = () => {
    const price = parseFloat(leasingForm.vehiclePrice) || 0;
    const initial = parseFloat(leasingForm.initialPayment) || 0;
    const term = parseInt(leasingForm.leaseTerm) || 36;
    
    if (price > 0) {
      const financedAmount = price - initial;
      const monthlyRate = 0.08 / 12; // 8% годовых
      const monthlyPayment = (financedAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));
      
      setCalculationResult({
        monthlyPayment: Math.round(monthlyPayment),
        totalAmount: Math.round(monthlyPayment * term + initial),
        totalInterest: Math.round(monthlyPayment * term + initial - price)
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  };

  const benefits = [
    {
      icon: CreditCard,
      title: 'Низкий первоначальный взнос',
      description: 'От 10% стоимости автомобиля'
    },
    {
      icon: TrendingUp,
      title: 'Выгодные условия',
      description: 'Ставка от 0.1% в месяц'
    },
    {
      icon: Shield,
      title: 'Страхование включено',
      description: 'КАСКО и ОСАГО в стоимости'
    },
    {
      icon: Clock,
      title: 'Быстрое оформление',
      description: 'Решение за 30 минут'
    }
  ];

  const leasingPrograms = [
    {
      title: 'Классический лизинг',
      description: 'Стандартная программа лизинга для физических лиц',
      features: ['Срок от 12 до 60 месяцев', 'Первоначальный взнос от 10%', 'Выкуп по остаточной стоимости'],
      rate: 'от 8.5%'
    },
    {
      title: 'Экспресс-лизинг',
      description: 'Быстрое оформление без справок о доходах',
      features: ['Решение за 1 час', 'Минимум документов', 'Автомобили в наличии'],
      rate: 'от 9.9%'
    },
    {
      title: 'Корпоративный лизинг',
      description: 'Специальные условия для юридических лиц',
      features: ['Налоговые льготы', 'Гибкий график платежей', 'Спецтехника и коммерческий транспорт'],
      rate: 'от 7.2%'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-600 via-red-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <FadeInUp>
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Автолизинг от VELES DRIVE
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Получите автомобиль мечты уже сегодня с выгодными условиями лизинга
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                  <Calculator className="mr-2 h-5 w-5" />
                  Рассчитать лизинг
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
                  Получить консультацию
                </Button>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Преимущества лизинга
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Почему лизинг - это выгодно и удобно
              </p>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <benefit.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Калькулятор лизинга
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Рассчитайте ежемесячный платеж за несколько секунд
              </p>
            </div>
          </FadeInUp>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Calculator Form */}
              <FadeInUp delay={0.1}>
                <div className="bg-gray-50 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Параметры расчета</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Стоимость автомобиля
                      </label>
                      <input
                        type="number"
                        placeholder="5000000"
                        value={leasingForm.vehiclePrice}
                        onChange={(e) => setLeasingForm(prev => ({ ...prev, vehiclePrice: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Первоначальный взнос
                      </label>
                      <input
                        type="number"
                        placeholder="500000"
                        value={leasingForm.initialPayment}
                        onChange={(e) => setLeasingForm(prev => ({ ...prev, initialPayment: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Срок лизинга
                      </label>
                      <select
                        value={leasingForm.leaseTerm}
                        onChange={(e) => setLeasingForm(prev => ({ ...prev, leaseTerm: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="12">12 месяцев</option>
                        <option value="24">24 месяца</option>
                        <option value="36">36 месяцев</option>
                        <option value="48">48 месяцев</option>
                        <option value="60">60 месяцев</option>
                      </select>
                    </div>

                    <Button
                      onClick={calculateLeasing}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 py-3"
                    >
                      <Calculator className="mr-2 h-5 w-5" />
                      Рассчитать платеж
                    </Button>
                  </div>
                </div>
              </FadeInUp>

              {/* Results */}
              <FadeInUp delay={0.2}>
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-6">Результат расчета</h3>
                  
                  {calculationResult ? (
                    <div className="space-y-6">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold mb-2">
                            {formatPrice(calculationResult.monthlyPayment)}
                          </div>
                          <div className="text-white/80">
                            Ежемесячный платеж
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-white/20">
                          <span>Общая сумма выплат:</span>
                          <span className="font-bold">{formatPrice(calculationResult.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/20">
                          <span>Переплата:</span>
                          <span className="font-bold">{formatPrice(calculationResult.totalInterest)}</span>
                        </div>
                      </div>

                      <Button className="w-full bg-white text-orange-600 hover:bg-gray-100 py-3 font-semibold">
                        Оформить заявку
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Car className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-white/80">
                        Заполните параметры для расчета ежемесячного платежа
                      </p>
                    </div>
                  )}
                </div>
              </FadeInUp>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-6">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Программы лизинга
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Выберите подходящую программу лизинга
              </p>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {leasingPrograms.map((program, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {program.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {program.description}
                    </p>
                    <div className="text-3xl font-bold text-orange-600">
                      {program.rate}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {program.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                    Подробнее
                  </Button>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 lg:px-6 text-center">
          <FadeInUp>
            <h2 className="text-4xl font-bold mb-4">
              Готовы получить автомобиль в лизинг?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Оставьте заявку и наши специалисты свяжутся с вами в течение 15 минут
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 px-8 py-4 text-lg">
                <Users className="mr-2 h-5 w-5" />
                Получить консультацию
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
                Позвонить сейчас
              </Button>
            </div>
          </FadeInUp>
        </div>
      </section>
    </div>
  );
};