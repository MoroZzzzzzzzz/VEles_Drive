import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, Percent, Calendar, TrendingUp, Info, Bank } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { formatPrice } from '../mock';

export const LoanCalculator = ({ vehiclePrice, onLoanCalculated }) => {
  const [calculation, setCalculation] = useState({
    vehiclePrice: vehiclePrice || 2000000,
    downPayment: vehiclePrice ? Math.round(vehiclePrice * 0.2) : 400000,
    loanAmount: 0,
    interestRate: 12.5,
    termMonths: 60,
    monthlyPayment: 0,
    totalPayment: 0,
    totalInterest: 0
  });

  const [tradeInValue, setTradeInValue] = useState(0);
  const [bankOffers, setBankOffers] = useState([]);

  useEffect(() => {
    calculateLoan();
    loadBankOffers();
  }, [calculation.vehiclePrice, calculation.downPayment, calculation.interestRate, calculation.termMonths, tradeInValue]);

  const calculateLoan = () => {
    const { vehiclePrice, downPayment, interestRate, termMonths } = calculation;
    const effectiveDownPayment = downPayment + tradeInValue;
    const loanAmount = Math.max(0, vehiclePrice - effectiveDownPayment);
    
    if (loanAmount === 0) {
      setCalculation(prev => ({
        ...prev,
        loanAmount: 0,
        monthlyPayment: 0,
        totalPayment: effectiveDownPayment,
        totalInterest: 0
      }));
      return;
    }

    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                          (Math.pow(1 + monthlyRate, termMonths) - 1);
    
    const totalPayment = monthlyPayment * termMonths + effectiveDownPayment;
    const totalInterest = (monthlyPayment * termMonths) - loanAmount;

    setCalculation(prev => ({
      ...prev,
      loanAmount,
      monthlyPayment,
      totalPayment,
      totalInterest
    }));

    // Notify parent component
    onLoanCalculated?.({
      monthlyPayment,
      totalPayment,
      loanAmount,
      downPayment: effectiveDownPayment
    });
  };

  const loadBankOffers = () => {
    // Mock bank offers - in real app would come from API
    const offers = [
      {
        id: 1,
        bank: 'Сбербанк',
        rate: 11.9,
        minDownPayment: 15,
        maxTerm: 84,
        processing: 'Быстрое одобрение'
      },
      {
        id: 2,
        bank: 'ВТБ',
        rate: 12.5,
        minDownPayment: 20,
        maxTerm: 60,
        processing: 'Онлайн заявка'
      },
      {
        id: 3,
        bank: 'Альфа-Банк',
        rate: 13.2,
        minDownPayment: 10,
        maxTerm: 72,
        processing: 'Без справок'
      },
      {
        id: 4,
        bank: 'Тинькофф',
        rate: 12.8,
        minDownPayment: 15,
        maxTerm: 60,
        processing: 'Цифровое оформление'
      }
    ];
    setBankOffers(offers);
  };

  const handleSliderChange = (field, value) => {
    setCalculation(prev => ({ ...prev, [field]: value[0] }));
  };

  const PaymentBreakdown = () => (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Структура платежа
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Цена автомобиля</span>
            <span className="text-white font-semibold">{formatPrice(calculation.vehiclePrice)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Первоначальный взнос</span>
            <span className="text-white font-semibold">{formatPrice(calculation.downPayment)}</span>
          </div>
          
          {tradeInValue > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Зачёт старого авто</span>
              <span className="text-green-400 font-semibold">+{formatPrice(tradeInValue)}</span>
            </div>
          )}
          
          <hr className="border-gray-600" />
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Сумма кредита</span>
            <span className="text-white font-semibold">{formatPrice(calculation.loanAmount)}</span>
          </div>
          
          <div className="flex justify-between items-center text-lg">
            <span className="text-white font-semibold">Ежемесячный платёж</span>
            <span className="text-amber-400 font-bold">{formatPrice(calculation.monthlyPayment)}</span>
          </div>
        </div>
        
        <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Общая сумма выплат</span>
            <span className="text-white">{formatPrice(calculation.totalPayment)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Переплата по кредиту</span>
            <span className="text-red-400">{formatPrice(calculation.totalInterest)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const BankOffers = () => (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Bank className="h-5 w-5 mr-2" />
          Предложения банков
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bankOffers.map((offer) => (
            <div key={offer.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-white font-semibold">{offer.bank}</h4>
                <Badge className="bg-green-600 text-white">
                  от {offer.rate}%
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 mb-3">
                <div>Мин. взнос: {offer.minDownPayment}%</div>
                <div>Срок: до {offer.maxTerm} мес.</div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-green-400 text-sm">{offer.processing}</span>
                <Button 
                  size="sm" 
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={() => setCalculation(prev => ({ ...prev, interestRate: offer.rate }))}
                >
                  Выбрать
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Калькулятор автокредита
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vehicle Price */}
          <div className="space-y-2">
            <Label className="text-gray-300">Стоимость автомобиля</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="number"
                value={calculation.vehiclePrice}
                onChange={(e) => setCalculation(prev => ({ 
                  ...prev, 
                  vehiclePrice: parseInt(e.target.value) || 0 
                }))}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Down Payment */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-gray-300">Первоначальный взнос</Label>
              <span className="text-amber-400 font-semibold">
                {formatPrice(calculation.downPayment)} 
                ({Math.round((calculation.downPayment / calculation.vehiclePrice) * 100)}%)
              </span>
            </div>
            <Slider
              value={[calculation.downPayment]}
              onValueChange={(value) => handleSliderChange('downPayment', value)}
              max={calculation.vehiclePrice * 0.5}
              min={calculation.vehiclePrice * 0.1}
              step={50000}
              className="w-full"
            />
          </div>

          {/* Trade-in Value */}
          <div className="space-y-2">
            <Label className="text-gray-300">Зачёт старого автомобиля (опционально)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="number"
                value={tradeInValue}
                onChange={(e) => setTradeInValue(parseInt(e.target.value) || 0)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
                placeholder="0"
              />
            </div>
          </div>

          {/* Interest Rate */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-gray-300">Процентная ставка</Label>
              <span className="text-amber-400 font-semibold">{calculation.interestRate}% годовых</span>
            </div>
            <Slider
              value={[calculation.interestRate]}
              onValueChange={(value) => handleSliderChange('interestRate', value)}
              max={25}
              min={8}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Loan Term */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-gray-300">Срок кредита</Label>
              <span className="text-amber-400 font-semibold">
                {calculation.termMonths} мес. ({Math.round(calculation.termMonths / 12)} лет)
              </span>
            </div>
            <Slider
              value={[calculation.termMonths]}
              onValueChange={(value) => handleSliderChange('termMonths', value)}
              max={84}
              min={12}
              step={6}
              className="w-full"
            />
          </div>

          {/* Monthly Payment Display */}
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-600/20 rounded-xl p-6 border border-amber-500/30">
            <div className="text-center">
              <p className="text-gray-300 text-sm mb-1">Ежемесячный платёж</p>
              <p className="text-3xl font-bold text-white mb-2">
                {formatPrice(calculation.monthlyPayment)}
              </p>
              <div className="flex justify-center items-center space-x-4 text-sm text-gray-400">
                <span>Срок: {calculation.termMonths} мес.</span>
                <span>•</span>
                <span>Ставка: {calculation.interestRate}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentBreakdown />
        <BankOffers />
      </div>
    </div>
  );
};