import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calculator, TrendingUp, Calendar, DollarSign, Percent, PiggyBank } from 'lucide-react';
import { cn } from '../../lib/utils';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatPercent = (rate) => {
  return `${rate.toFixed(1)}%`;
};

const LoanCalculatorCard = ({ 
  vehiclePrice = 1000000, 
  onLoanCalculated = null,
  className = "" 
}) => {
  const [loanData, setLoanData] = useState({
    vehiclePrice: vehiclePrice,
    downPayment: Math.round(vehiclePrice * 0.3),
    loanTerm: 36, // months
    interestRate: 12.5, // annual %
    loanType: 'loan' // loan or lease
  });

  const [calculations, setCalculations] = useState({
    loanAmount: 0,
    monthlyPayment: 0,
    totalPayment: 0,
    totalInterest: 0,
    paymentBreakdown: []
  });

  useEffect(() => {
    calculateLoan();
  }, [loanData]);

  useEffect(() => {
    setLoanData(prev => ({
      ...prev,
      vehiclePrice: vehiclePrice,
      downPayment: Math.round(vehiclePrice * 0.3)
    }));
  }, [vehiclePrice]);

  const calculateLoan = () => {
    const { vehiclePrice, downPayment, loanTerm, interestRate, loanType } = loanData;
    
    const loanAmount = vehiclePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    
    let monthlyPayment;
    let totalPayment;
    let totalInterest;
    
    if (loanType === 'lease') {
      // Simplified leasing calculation
      const residualValue = vehiclePrice * 0.4; // 40% residual after lease
      const depreciationPayment = (vehiclePrice - residualValue) / loanTerm;
      const financePayment = (vehiclePrice + residualValue) * monthlyRate;
      monthlyPayment = depreciationPayment + financePayment;
      totalPayment = monthlyPayment * loanTerm;
      totalInterest = totalPayment - (vehiclePrice - residualValue);
    } else {
      // Standard loan calculation
      if (monthlyRate === 0) {
        monthlyPayment = loanAmount / loanTerm;
      } else {
        monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / 
                        (Math.pow(1 + monthlyRate, loanTerm) - 1);
      }
      totalPayment = monthlyPayment * loanTerm + downPayment;
      totalInterest = totalPayment - vehiclePrice;
    }

    const results = {
      loanAmount,
      monthlyPayment,
      totalPayment,
      totalInterest,
      paymentBreakdown: generatePaymentSchedule(loanAmount, monthlyPayment, loanTerm, monthlyRate)
    };

    setCalculations(results);
    
    if (onLoanCalculated) {
      onLoanCalculated(results);
    }
  };

  const generatePaymentSchedule = (loanAmount, monthlyPayment, term, rate) => {
    const schedule = [];
    let remainingBalance = loanAmount;
    
    for (let month = 1; month <= Math.min(term, 12); month++) {
      const interestPayment = remainingBalance * rate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;
      
      schedule.push({
        month,
        monthlyPayment,
        principalPayment,
        interestPayment,
        remainingBalance: Math.max(0, remainingBalance)
      });
    }
    
    return schedule;
  };

  const handleInputChange = (field, value) => {
    setLoanData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const loanTypeOptions = [
    { value: 'loan', label: 'Кредит', description: 'Классический автокредит' },
    { value: 'lease', label: 'Лизинг', description: 'Финансовая аренда с правом выкупа' }
  ];

  const termOptions = [
    { value: 12, label: '1 год' },
    { value: 24, label: '2 года' },
    { value: 36, label: '3 года' },
    { value: 48, label: '4 года' },
    { value: 60, label: '5 лет' },
    { value: 84, label: '7 лет' }
  ];

  return (
    <Card className={cn("bg-gray-800 border-gray-700", className)}>
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Calculator className="w-5 h-5 mr-2" />
          Калькулятор {loanData.loanType === 'loan' ? 'кредита' : 'лизинга'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Loan Type Selection */}
        <div className="space-y-2">
          <Label className="text-gray-300">Тип финансирования</Label>
          <div className="grid grid-cols-2 gap-2">
            {loanTypeOptions.map((option) => (
              <Button
                key={option.value}
                variant={loanData.loanType === option.value ? "default" : "outline"}
                className={cn(
                  "justify-start h-auto p-3",
                  loanData.loanType === option.value
                    ? "bg-amber-500 hover:bg-amber-600 border-amber-500"
                    : "border-gray-600 hover:bg-gray-700"
                )}
                onClick={() => handleInputChange('loanType', option.value)}
              >
                <div className="text-left">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs opacity-80">{option.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Vehicle Price */}
        <div className="space-y-2">
          <Label htmlFor="vehiclePrice" className="text-gray-300">
            Стоимость автомобиля
          </Label>
          <Input
            id="vehiclePrice"
            type="number"
            value={loanData.vehiclePrice}
            onChange={(e) => handleInputChange('vehiclePrice', Number(e.target.value))}
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="Введите стоимость"
          />
          <p className="text-sm text-gray-400">{formatCurrency(loanData.vehiclePrice)}</p>
        </div>

        {/* Down Payment */}
        <div className="space-y-3">
          <Label className="text-gray-300">
            Первоначальный взнос: {formatCurrency(loanData.downPayment)}
          </Label>
          <Slider
            value={[loanData.downPayment]}
            onValueChange={(value) => handleInputChange('downPayment', value[0])}
            max={loanData.vehiclePrice * 0.8}
            min={loanData.vehiclePrice * 0.1}
            step={loanData.vehiclePrice * 0.05}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Минимум: {formatPercent((loanData.downPayment / loanData.vehiclePrice) * 100)}</span>
            <span>{formatCurrency(loanData.vehiclePrice - loanData.downPayment)} к финансированию</span>
          </div>
        </div>

        {/* Loan Term */}
        <div className="space-y-2">
          <Label className="text-gray-300">Срок</Label>
          <Select value={loanData.loanTerm.toString()} onValueChange={(value) => handleInputChange('loanTerm', Number(value))}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {termOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Interest Rate */}
        <div className="space-y-3">
          <Label className="text-gray-300">
            Процентная ставка: {formatPercent(loanData.interestRate)}
          </Label>
          <Slider
            value={[loanData.interestRate]}
            onValueChange={(value) => handleInputChange('interestRate', value[0])}
            max={25}
            min={3}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>От 3%</span>
            <span>До 25%</span>
          </div>
        </div>

        {/* Results */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-600/10 rounded-lg p-4 border border-amber-500/20">
          <h4 className="text-amber-400 font-semibold mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Результаты расчета
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-gray-300 text-sm">
                <Calendar className="w-3 h-3 mr-1" />
                Ежемесячный платеж
              </div>
              <p className="text-white text-xl font-bold">
                {formatCurrency(calculations.monthlyPayment)}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-gray-300 text-sm">
                <DollarSign className="w-3 h-3 mr-1" />
                Общая сумма
              </div>
              <p className="text-white text-xl font-bold">
                {formatCurrency(calculations.totalPayment)}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-gray-300 text-sm">
                <PiggyBank className="w-3 h-3 mr-1" />
                К финансированию
              </div>
              <p className="text-amber-400 font-semibold">
                {formatCurrency(calculations.loanAmount)}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-gray-300 text-sm">
                <Percent className="w-3 h-3 mr-1" />
                Переплата
              </div>
              <p className="text-orange-400 font-semibold">
                {formatCurrency(calculations.totalInterest)}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Schedule Preview */}
        {calculations.paymentBreakdown.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-white font-medium">График платежей (первые 12 месяцев)</h4>
            <div className="bg-gray-900 rounded-lg p-3 max-h-48 overflow-y-auto">
              <div className="space-y-2">
                {calculations.paymentBreakdown.map((payment) => (
                  <div key={payment.month} className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Месяц {payment.month}</span>
                    <div className="flex space-x-4">
                      <span className="text-green-400">
                        Основной: {formatCurrency(payment.principalPayment)}
                      </span>
                      <span className="text-red-400">
                        Проценты: {formatCurrency(payment.interestPayment)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="pt-4 border-t border-gray-700">
          <div className="flex space-x-3">
            <Button variant="outline" className="flex-1 border-amber-500/30 text-amber-400">
              Сравнить предложения
            </Button>
            <Button className="flex-1 bg-amber-500 hover:bg-amber-600">
              Подать заявку
            </Button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            * Расчет носит информационный характер
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanCalculatorCard;