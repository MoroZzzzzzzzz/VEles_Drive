import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Star, TrendingDown, Clock, CheckCircle, ArrowRight, Percent, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount);
};

const BankCard = ({ bank, onSelect, isSelected = false }) => {
  const getBadgeColor = (rating) => {
    if (rating >= 4.5) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (rating >= 4.0) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <Card className={cn(
      "cursor-pointer transition-all hover:shadow-lg",
      isSelected 
        ? 'bg-amber-500/20 border-amber-500/50' 
        : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {bank.name.charAt(0)}
              </span>
            </div>
            <div>
              <CardTitle className="text-white text-lg">{bank.name}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center">
                  <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                  <span className="text-yellow-400 text-sm font-medium">{bank.rating}</span>
                </div>
                <Badge className={getBadgeColor(bank.rating)}>
                  {bank.rating >= 4.5 ? 'Топ' : bank.rating >= 4.0 ? 'Хорошо' : 'Средне'}
                </Badge>
              </div>
            </div>
          </div>
          {bank.isBestOffer && (
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              Лучшее предложение
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main offer */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center text-gray-400 text-sm mb-1">
                <Percent className="w-3 h-3 mr-1" />
                Ставка от
              </div>
              <p className="text-2xl font-bold text-white">
                {bank.minRate}%
                <span className="text-sm text-gray-400 ml-1">годовых</span>
              </p>
            </div>
            <div>
              <div className="flex items-center text-gray-400 text-sm mb-1">
                <Calendar className="w-3 h-3 mr-1" />
                Срок до
              </div>
              <p className="text-2xl font-bold text-white">
                {bank.maxTerm}
                <span className="text-sm text-gray-400 ml-1">лет</span>
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2">
          {bank.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-gray-300 text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {/* Special offers */}
        {bank.specialOffers && bank.specialOffers.length > 0 && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <p className="text-green-400 font-medium text-sm mb-2">Специальные условия:</p>
            <ul className="space-y-1">
              {bank.specialOffers.map((offer, index) => (
                <li key={index} className="text-green-300 text-xs flex items-start">
                  <TrendingDown className="w-3 h-3 mr-1 mt-0.5" />
                  {offer}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Processing info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-400">
            <Clock className="w-3 h-3 mr-1" />
            Решение за {bank.processingTime}
          </div>
          <span className="text-amber-400">{bank.approvalRate}% одобрений</span>
        </div>

        {/* Action button */}
        <Button
          onClick={() => onSelect(bank)}
          className={cn(
            "w-full",
            isSelected
              ? "bg-amber-500 hover:bg-amber-600"
              : "bg-blue-600 hover:bg-blue-700"
          )}
        >
          {isSelected ? 'Выбрано' : 'Выбрать предложение'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

const ComparisonTable = ({ banks, selectedBank, monthlyPayment }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-white font-semibold">Сравнение предложений</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left text-gray-400 p-3">Банк</th>
              <th className="text-left text-gray-400 p-3">Ставка</th>
              <th className="text-left text-gray-400 p-3">Ежемесячный платеж</th>
              <th className="text-left text-gray-400 p-3">Первый взнос</th>
              <th className="text-left text-gray-400 p-3">Решение</th>
            </tr>
          </thead>
          <tbody>
            {banks.map((bank) => (
              <tr 
                key={bank.id}
                className={cn(
                  "border-b border-gray-700",
                  selectedBank?.id === bank.id && "bg-amber-500/10"
                )}
              >
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {bank.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-white font-medium">{bank.name}</span>
                    {bank.isBestOffer && (
                      <Badge className="bg-amber-500/20 text-amber-400 text-xs">Топ</Badge>
                    )}
                  </div>
                </td>
                <td className="p-3 text-white">от {bank.minRate}%</td>
                <td className="p-3 text-white font-semibold">
                  {formatCurrency(monthlyPayment * (1 + (bank.minRate - 12.5) / 100))}
                </td>
                <td className="p-3 text-gray-300">от {bank.minDownPayment}%</td>
                <td className="p-3 text-green-400">{bank.processingTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const BankOffers = ({ 
  vehiclePrice, 
  calculatedPayment, 
  onBankSelected,
  className = "" 
}) => {
  const [selectedBank, setSelectedBank] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  // Mock bank data
  const banks = [
    {
      id: 'sberbank',
      name: 'Сбербанк',
      rating: 4.8,
      minRate: 9.9,
      maxTerm: 7,
      minDownPayment: 15,
      processingTime: '1 час',
      approvalRate: 92,
      isBestOffer: true,
      features: [
        'Без комиссий и скрытых платежей',
        'Досрочное погашение без штрафов',
        'Онлайн-оформление за 15 минут',
        'Каско со скидкой до 40%'
      ],
      specialOffers: [
        'Ставка от 9.9% для зарплатных клиентов',
        'Скидка 0.5% при оформлении через приложение'
      ]
    },
    {
      id: 'vtb',
      name: 'ВТБ',
      rating: 4.6,
      minRate: 10.5,
      maxTerm: 7,
      minDownPayment: 10,
      processingTime: '2 часа',
      approvalRate: 88,
      features: [
        'Первый взнос от 10%',
        'Возможность рефинансирования',
        'Страхование жизни включено',
        'Личный менеджер'
      ],
      specialOffers: [
        'Кэшбэк 1% на АЗС ВТБ',
        'Бесплатное КАСКО в первый год'
      ]
    },
    {
      id: 'alfabank',
      name: 'Альфа-Банк',
      rating: 4.5,
      minRate: 11.2,
      maxTerm: 5,
      minDownPayment: 20,
      processingTime: '30 минут',
      approvalRate: 85,
      features: [
        'Быстрое решение за 30 минут',
        'Гибкие условия погашения',
        'Программа лояльности',
        'Мобильное приложение'
      ],
      specialOffers: [
        '100 дней без процентов по кредитке',
        'Скидка на страхование'
      ]
    },
    {
      id: 'tinkoff',
      name: 'Тинькофф Банк',
      rating: 4.4,
      minRate: 12.0,
      maxTerm: 5,
      minDownPayment: 25,
      processingTime: '15 минут',
      approvalRate: 90,
      features: [
        '100% онлайн-оформление',
        'Доставка документов курьером',
        'Круглосуточная поддержка',
        'Кэшбэк по карте'
      ],
      specialOffers: [
        'Месяц страховки в подарок',
        '2% кэшбэк на все покупки'
      ]
    }
  ];

  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
    if (onBankSelected) {
      onBankSelected(bank);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Предложения банков</h2>
          <p className="text-gray-400">Выберите лучшие условия для покупки автомобиля</p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
            className={viewMode === 'cards' ? 'bg-amber-500' : ''}
          >
            Карточки
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
            className={viewMode === 'table' ? 'bg-amber-500' : ''}
          >
            Таблица
          </Button>
        </div>
      </div>

      {/* Bank offers */}
      {viewMode === 'cards' ? (
        <div className="grid md:grid-cols-2 gap-6">
          {banks.map((bank) => (
            <BankCard
              key={bank.id}
              bank={bank}
              onSelect={handleBankSelect}
              isSelected={selectedBank?.id === bank.id}
            />
          ))}
        </div>
      ) : (
        <ComparisonTable
          banks={banks}
          selectedBank={selectedBank}
          monthlyPayment={calculatedPayment}
        />
      )}

      {/* Selected bank summary */}
      {selectedBank && (
        <Card className="bg-gradient-to-r from-amber-500/10 to-orange-600/10 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white text-lg font-semibold mb-1">
                  Вы выбрали: {selectedBank.name}
                </h3>
                <p className="text-gray-300">
                  Ставка от {selectedBank.minRate}% • Решение за {selectedBank.processingTime}
                </p>
              </div>
              <Button className="bg-amber-500 hover:bg-amber-600">
                Подать заявку
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BankOffers;