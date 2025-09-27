import React, { useState } from 'react';
import { Shield, CheckCircle, Car, Users, Clock, Star, Phone, Calculator } from 'lucide-react';
import { Button } from '../components/ui/button';
import { FadeInUp } from '../components/Animations/FadeInUp';

export const InsurancePage = () => {
  const [insuranceForm, setInsuranceForm] = useState({
    vehicleYear: '',
    vehiclePrice: '',
    driverAge: '',
    drivingExperience: '',
    insuranceType: 'kasko'
  });

  const [calculationResult, setCalculationResult] = useState(null);

  const calculateInsurance = () => {
    const price = parseFloat(insuranceForm.vehiclePrice) || 0;
    const age = parseInt(insuranceForm.driverAge) || 25;
    const experience = parseInt(insuranceForm.drivingExperience) || 1;
    
    if (price > 0) {
      let baseRate = insuranceForm.insuranceType === 'kasko' ? 0.08 : 0.015;
      
      // Коэффициенты
      if (age < 25) baseRate *= 1.3;
      if (experience < 3) baseRate *= 1.2;
      
      const annualCost = price * baseRate;
      
      setCalculationResult({
        annualCost: Math.round(annualCost),
        monthlyCost: Math.round(annualCost / 12)
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

  const insuranceTypes = [
    {
      type: 'КАСКО',
      title: 'Полная защита автомобиля',
      description: 'Комплексная защита от всех рисков: ДТП, угон, стихийные бедствия, вандализм',
      features: [
        'Защита от ДТП и столкновений',
        'Страхование от угона и хищения',
        'Защита от стихийных бедствий',
        'Покрытие ущерба от вандализма',
        'Эвакуация и техпомощь 24/7',
        'Выплата без справок при мелких ДТП'
      ],
      price: 'от 65 000 ₽/год',
      popular: true
    },
    {
      type: 'ОСАГО',
      title: 'Обязательное страхование',
      description: 'Страхование гражданской ответственности владельца транспортного средства',
      features: [
        'Обязательное по закону',
        'Защита ответственности перед третьими лицами',
        'Покрытие ущерба до 500 000 ₽',
        'Покрытие вреда жизни до 500 000 ₽',
        'Действует по всей территории РФ',
        'Онлайн оформление за 5 минут'
      ],
      price: 'от 4 500 ₽/год',
      popular: false
    },
    {
      type: 'Дополнительные услуги',
      title: 'Расширенная защита',
      description: 'Дополнительные опции для максимального покрытия рисков',
      features: [
        'Страхование жизни водителя',
        'Защита от несчастных случаев',
        'Юридическая помощь при ДТП',
        'GAP-страхование',
        'Страхование от потери ключей',
        'Защита стекол и фар'
      ],
      price: 'от 15 000 ₽/год',
      popular: false
    }
  ];

  const partners = [
    { name: 'Росгосстрах', rating: 4.8, logo: '🛡️' },
    { name: 'СОГАЗ', rating: 4.7, logo: '🏛️' },
    { name: 'Ингосстрах', rating: 4.6, logo: '🌟' },
    { name: 'АльфаСтрахование', rating: 4.9, logo: '📋' },
    { name: 'ВСК', rating: 4.5, logo: '🔒' },
    { name: 'Ренессанс', rating: 4.4, logo: '💎' }
  ];

  const advantages = [
    {
      icon: Shield,
      title: 'Только проверенные СК',
      description: 'Работаем с надежными страховыми компаниями с высоким рейтингом'
    },
    {
      icon: Clock,
      title: 'Быстрое оформление',
      description: 'Полис КАСКО за 30 минут, ОСАГО за 5 минут онлайн'
    },
    {
      icon: Star,
      title: 'Лучшие цены',
      description: 'Сравниваем предложения всех СК и находим оптимальную цену'
    },
    {
      icon: Users,
      title: 'Поддержка 24/7',
      description: 'Помощь при оформлении и сопровождение по страховым случаям'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <FadeInUp>
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Страхование автомобилей
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Надежная защита вашего автомобиля от ведущих страховых компаний
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                  <Calculator className="mr-2 h-5 w-5" />
                  Рассчитать стоимость
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
                  Оформить ОСАГО онлайн
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
                Почему выбирают нас
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Преимущества страхования в VELES DRIVE
              </p>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((advantage, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
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

      {/* Insurance Types */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Виды страхования
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Выберите подходящий тип защиты для вашего автомобиля
              </p>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {insuranceTypes.map((insurance, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <div className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 relative ${insurance.popular ? 'ring-2 ring-blue-500' : ''}`}>
                  {insurance.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        Популярно
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {insurance.type}
                    </h3>
                    <h4 className="text-lg font-semibold text-blue-600 mb-2">
                      {insurance.title}
                    </h4>
                    <p className="text-gray-600 mb-4">
                      {insurance.description}
                    </p>
                    <div className="text-2xl font-bold text-blue-600">
                      {insurance.price}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {insurance.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className={`w-full ${insurance.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}`}>
                    Рассчитать стоимость
                  </Button>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-6">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Калькулятор страхования
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Рассчитайте стоимость страховки для вашего автомобиля
              </p>
            </div>
          </FadeInUp>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <FadeInUp delay={0.1}>
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Параметры расчета</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Тип страхования
                      </label>
                      <select
                        value={insuranceForm.insuranceType}
                        onChange={(e) => setInsuranceForm(prev => ({ ...prev, insuranceType: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="kasko">КАСКО</option>
                        <option value="osago">ОСАГО</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Стоимость автомобиля
                      </label>
                      <input
                        type="number"
                        placeholder="2000000"
                        value={insuranceForm.vehiclePrice}
                        onChange={(e) => setInsuranceForm(prev => ({ ...prev, vehiclePrice: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Год выпуска
                      </label>
                      <select
                        value={insuranceForm.vehicleYear}
                        onChange={(e) => setInsuranceForm(prev => ({ ...prev, vehicleYear: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Выберите год</option>
                        {Array.from({length: 10}, (_, i) => 2024 - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Возраст водителя
                      </label>
                      <input
                        type="number"
                        placeholder="30"
                        value={insuranceForm.driverAge}
                        onChange={(e) => setInsuranceForm(prev => ({ ...prev, driverAge: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Стаж вождения (лет)
                      </label>
                      <input
                        type="number"
                        placeholder="5"
                        value={insuranceForm.drivingExperience}
                        onChange={(e) => setInsuranceForm(prev => ({ ...prev, drivingExperience: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <Button
                      onClick={calculateInsurance}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 py-3"
                    >
                      <Calculator className="mr-2 h-5 w-5" />
                      Рассчитать стоимость
                    </Button>
                  </div>
                </div>
              </FadeInUp>

              <FadeInUp delay={0.2}>
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-6">Результат расчета</h3>
                  
                  {calculationResult ? (
                    <div className="space-y-6">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold mb-2">
                            {formatPrice(calculationResult.annualCost)}
                          </div>
                          <div className="text-white/80 mb-4">
                            В год
                          </div>
                          <div className="text-xl font-semibold">
                            {formatPrice(calculationResult.monthlyCost)} / месяц
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-white/10 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <Shield className="h-5 w-5" />
                            <span className="font-semibold">Что покрывается:</span>
                          </div>
                          <ul className="text-sm space-y-1 text-white/90">
                            {insuranceForm.insuranceType === 'kasko' ? (
                              <>
                                <li>• ДТП и столкновения</li>
                                <li>• Угон и хищение</li>
                                <li>• Стихийные бедствия</li>
                                <li>• Вандализм</li>
                              </>
                            ) : (
                              <>
                                <li>• Ущерб третьим лицам до 500 000 ₽</li>
                                <li>• Вред жизни до 500 000 ₽</li>
                                <li>• Действует по всей РФ</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>

                      <Button className="w-full bg-white text-blue-600 hover:bg-gray-100 py-3 font-semibold">
                        Оформить полис
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-white/80">
                        Заполните данные для расчета стоимости страхования
                      </p>
                    </div>
                  )}
                </div>
              </FadeInUp>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Наши партнеры
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Работаем с ведущими страховыми компаниями России
              </p>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {partners.map((partner, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <div className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-gray-100 transition-colors">
                  <div className="text-4xl mb-4">{partner.logo}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{partner.name}</h3>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">{partner.rating}</span>
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
              Нужна помощь с выбором страховки?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Наши эксперты помогут подобрать оптимальный вариант страхования
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg">
                <Phone className="mr-2 h-5 w-5" />
                Получить консультацию
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
                Обратный звонок
              </Button>
            </div>
          </FadeInUp>
        </div>
      </section>
    </div>
  );
};