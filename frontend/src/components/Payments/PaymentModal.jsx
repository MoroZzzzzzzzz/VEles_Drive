import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CreditCard, ShieldCheck, Truck, Clock, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { paymentsAPI } from '../../services/api';
import { cn } from '../../lib/utils';

const formatPrice = (price, currency = 'RUB') => {
  const formatted = new Intl.NumberFormat('ru-RU').format(price);
  return `${formatted} ₽`;
};

const PaymentStatusIcon = ({ status, paymentStatus }) => {
  if (paymentStatus === 'paid') {
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  }
  if (status === 'expired') {
    return <AlertCircle className="w-5 h-5 text-red-500" />;
  }
  return <Clock className="w-5 h-5 text-yellow-500" />;
};

export const PaymentModal = ({ 
  open, 
  onOpenChange, 
  vehicle = null, 
  paymentType = 'full' // 'full' or 'booking'
}) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  const calculateAmount = () => {
    if (!vehicle) return 0;
    if (paymentType === 'booking') {
      const bookingFee = Math.max(1000, Math.min(50000, vehicle.price * 0.1));
      return bookingFee;
    }
    return vehicle.price;
  };

  const getPaymentDescription = () => {
    if (!vehicle) return '';
    const vehicleTitle = `${vehicle.make} ${vehicle.model} ${vehicle.year}`;
    if (paymentType === 'booking') {
      return `Бронирование ${vehicleTitle}`;
    }
    return `Полная оплата ${vehicleTitle}`;
  };

  const handlePayment = async () => {
    if (!vehicle) return;

    try {
      setIsProcessing(true);
      setError('');

      const currentUrl = window.location.origin;
      const successUrl = `${currentUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${currentUrl}/payment-cancelled`;

      let paymentData;

      if (paymentType === 'booking') {
        paymentData = {
          vehicle_id: vehicle.id,
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: {
            source: 'web_booking',
            vehicle_make: vehicle.make,
            vehicle_model: vehicle.model
          }
        };
        
        const session = await paymentsAPI.createBookingPayment(paymentData);
        window.location.href = session.url;
      } else {
        paymentData = {
          vehicle_id: vehicle.id,
          payment_type: 'full',
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: {
            source: 'web_purchase',
            vehicle_make: vehicle.make,
            vehicle_model: vehicle.model
          }
        };
        
        const session = await paymentsAPI.createVehiclePayment(paymentData);
        window.location.href = session.url;
      }

    } catch (error) {
      console.error('Payment error:', error);
      setError(error.response?.data?.detail || 'Ошибка создания платежа');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!vehicle) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Ошибка</DialogTitle>
          </DialogHeader>
          <div className="text-gray-400 py-4">
            Информация об автомобиле не найдена
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center">
            <CreditCard className="w-6 h-6 mr-3" />
            {paymentType === 'booking' ? 'Бронирование автомобиля' : 'Покупка автомобиля'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Vehicle Info */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-700 rounded-lg overflow-hidden">
                  {vehicle.images && vehicle.images.length > 0 ? (
                    <img
                      src={vehicle.images[0]}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <div className="w-8 h-8 bg-gray-600 rounded"></div>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">
                    {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-gray-400">{vehicle.year} г. • {vehicle.condition === 'new' ? 'Новый' : 'Б/У'}</p>
                  <p className="text-amber-400 font-bold text-xl">
                    {formatPrice(vehicle.price)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Детали платежа</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Тип платежа:</span>
                <span className="text-white">
                  {paymentType === 'booking' ? 'Бронирование (10%)' : 'Полная оплата'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Сумма к оплате:</span>
                <span className="text-white font-semibold text-lg">
                  {formatPrice(calculateAmount())}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Валюта:</span>
                <span className="text-white">Российский рубль (₽)</span>
              </div>

              {paymentType === 'booking' && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Truck className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div>
                      <p className="text-amber-400 font-medium">Бронирование</p>
                      <p className="text-gray-300 text-sm">
                        После оплаты автомобиль будет забронирован для вас на 7 дней.
                        Оставшуюся сумму необходимо доплатить при получении.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Info */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-8 h-8 text-green-500" />
                <div>
                  <h4 className="text-white font-medium">Безопасная оплата</h4>
                  <p className="text-gray-400 text-sm">
                    Платеж обрабатывается через защищенную систему Stripe.
                    Ваши данные надежно защищены.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <X className="w-5 h-5 text-red-400" />
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isProcessing}
            >
              Отмена
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 bg-amber-500 hover:bg-amber-600"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Подготовка...
                </div>
              ) : (
                <div className="flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  {paymentType === 'booking' ? 'Забронировать' : 'Оплатить'} {formatPrice(calculateAmount())}
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Payment Success Page Component
export const PaymentSuccess = () => {
  const [paymentStatus, setPaymentStatus] = useState('checking');
  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    checkPaymentStatus();
    // Set up polling
    const interval = setInterval(checkPaymentStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const checkPaymentStatus = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      
      if (!sessionId) {
        setPaymentStatus('error');
        return;
      }

      const status = await paymentsAPI.getPaymentStatus(sessionId);
      
      if (status.payment_status === 'paid') {
        setPaymentStatus('success');
        setTransaction(status);
      } else if (status.status === 'expired') {
        setPaymentStatus('expired');
      } else {
        setPaymentStatus('pending');
      }
      
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-gray-800 border-gray-700">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <PaymentStatusIcon status={paymentStatus} paymentStatus={paymentStatus} />
          </div>
          
          {paymentStatus === 'checking' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Проверяем платеж...</h2>
              <p className="text-gray-400">Пожалуйста, подождите</p>
            </div>
          )}
          
          {paymentStatus === 'success' && (
            <div>
              <h2 className="text-2xl font-bold text-green-400 mb-2">Платеж успешен!</h2>
              <p className="text-gray-400 mb-4">
                Спасибо за покупку. Мы отправили подтверждение на ваш email.
              </p>
              <Button onClick={() => window.location.href = '/'} className="bg-amber-500 hover:bg-amber-600">
                На главную
              </Button>
            </div>
          )}
          
          {paymentStatus === 'pending' && (
            <div>
              <h2 className="text-2xl font-bold text-yellow-400 mb-2">Обрабатываем платеж...</h2>
              <p className="text-gray-400">Платеж обрабатывается, пожалуйста, подождите</p>
            </div>
          )}
          
          {(paymentStatus === 'expired' || paymentStatus === 'error') && (
            <div>
              <h2 className="text-2xl font-bold text-red-400 mb-2">Ошибка платежа</h2>
              <p className="text-gray-400 mb-4">
                Произошла ошибка при обработке платежа. Попробуйте еще раз.
              </p>
              <Button onClick={() => window.location.href = '/'} className="bg-amber-500 hover:bg-amber-600">
                На главную
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// User Transactions Component
export const UserTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await paymentsAPI.getUserTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-gray-400 text-center py-8">
        Загрузка транзакций...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-white text-lg font-semibold">История платежей</h3>
      
      {transactions.length === 0 ? (
        <div className="text-gray-400 text-center py-8">
          <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>У вас пока нет платежей</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <Card key={transaction.id} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <PaymentStatusIcon 
                      status={transaction.status} 
                      paymentStatus={transaction.payment_status} 
                    />
                    <div>
                      <p className="text-white font-medium">{transaction.description}</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(transaction.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">
                      {formatPrice(transaction.amount)}
                    </p>
                    <p className={cn(
                      "text-sm capitalize",
                      transaction.payment_status === 'paid' ? 'text-green-400' :
                      transaction.status === 'expired' ? 'text-red-400' : 'text-yellow-400'
                    )}>
                      {transaction.payment_status === 'paid' ? 'Оплачено' :
                       transaction.status === 'expired' ? 'Истек' : 'Ожидание'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};