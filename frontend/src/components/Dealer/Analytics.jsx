import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, TrendingDown, DollarSign, 
  Users, Car, Eye, MessageCircle, Calendar,
  Target, Award, Clock, Percent
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { analyticsAPI } from '../../services/api';
import { formatPrice } from '../mock';

export const Analytics = ({ dealerId }) => {
  const [analytics, setAnalytics] = useState({});
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (dealerId) {
      loadAnalytics();
    }
  }, [dealerId, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await analyticsAPI.getDealerAnalytics(dealerId, { timeRange });
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = "text-white",
    changeColor = null 
  }) => (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className={`text-2xl font-bold ${color} mb-1`}>{value}</p>
            {change !== undefined && (
              <div className={`flex items-center text-sm ${
                changeColor || (change >= 0 ? 'text-green-400' : 'text-red-400')
              }`}>
                {change >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {change >= 0 ? '+' : ''}{change}%
              </div>
            )}
          </div>
          <div className="p-3 bg-amber-500/20 rounded-full">
            <Icon className="h-6 w-6 text-amber-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TopPerformingVehicles = ({ vehicles }) => (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Award className="h-5 w-5 mr-2" />
          Топ автомобили по просмотрам
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {vehicles?.slice(0, 5).map((vehicle, index) => (
            <div key={vehicle.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <span className="text-amber-500 font-bold text-sm">{index + 1}</span>
                </div>
                <div>
                  <div className="text-white font-medium">
                    {vehicle.make} {vehicle.model}
                  </div>
                  <div className="text-gray-400 text-sm">{vehicle.year}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{vehicle.views}</div>
                <div className="text-gray-400 text-sm">просмотров</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const ConversionFunnel = ({ funnel }) => (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Воронка продаж
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {funnel?.map((stage, index) => (
            <div key={stage.name} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">{stage.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-semibold">{stage.count}</span>
                  {stage.conversion_rate && (
                    <Badge variant="secondary" className="text-xs">
                      {stage.conversion_rate}%
                    </Badge>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stage.count / funnel[0].count) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const RevenueChart = ({ revenue }) => (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Выручка за период
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Общая выручка</p>
              <p className="text-2xl font-bold text-white">
                {formatPrice(revenue?.total || 0)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Средний чек</p>
              <p className="text-2xl font-bold text-amber-400">
                {formatPrice(revenue?.average_deal || 0)}
              </p>
            </div>
          </div>
          
          {revenue?.by_month && (
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">По месяцам:</p>
              {revenue.by_month.map((month) => (
                <div key={month.period} className="flex justify-between items-center">
                  <span className="text-gray-300">{month.period}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white">{formatPrice(month.amount)}</span>
                    <Badge 
                      variant="secondary" 
                      className={month.growth >= 0 ? 'text-green-400' : 'text-red-400'}
                    >
                      {month.growth >= 0 ? '+' : ''}{month.growth}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Загрузка аналитики...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Аналитика и отчеты</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">За неделю</SelectItem>
            <SelectItem value="month">За месяц</SelectItem>
            <SelectItem value="quarter">За квартал</SelectItem>
            <SelectItem value="year">За год</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Всего продаж"
          value={analytics.sales?.total || 0}
          change={analytics.sales?.growth}
          icon={Car}
          color="text-green-400"
        />
        
        <MetricCard
          title="Выручка"
          value={formatPrice(analytics.revenue?.total || 0)}
          change={analytics.revenue?.growth}
          icon={DollarSign}
          color="text-amber-400"
        />
        
        <MetricCard
          title="Лиды"
          value={analytics.leads?.total || 0}
          change={analytics.leads?.growth}
          icon={Users}
          color="text-blue-400"
        />
        
        <MetricCard
          title="Конверсия"
          value={`${analytics.conversion?.rate || 0}%`}
          change={analytics.conversion?.growth}
          icon={Target}
          color="text-purple-400"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Просмотры"
          value={analytics.views?.total || 0}
          change={analytics.views?.growth}
          icon={Eye}
        />
        
        <MetricCard
          title="Сообщения"
          value={analytics.messages?.total || 0}
          change={analytics.messages?.growth}
          icon={MessageCircle}
        />
        
        <MetricCard
          title="Время продажи"
          value={`${analytics.sale_time?.average || 0} дней`}
          change={analytics.sale_time?.growth}
          icon={Clock}
          changeColor={analytics.sale_time?.growth < 0 ? 'text-green-400' : 'text-red-400'}
        />
        
        <MetricCard
          title="Рейтинг дилера"
          value={`${analytics.rating?.current || 0}/5`}
          change={analytics.rating?.growth}
          icon={Award}
        />
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopPerformingVehicles vehicles={analytics.top_vehicles} />
        <ConversionFunnel funnel={analytics.conversion_funnel} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart revenue={analytics.revenue_breakdown} />
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Источники трафика
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.traffic_sources?.map((source) => (
                <div key={source.name} className="flex items-center justify-between">
                  <span className="text-gray-300">{source.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                    <span className="text-white text-sm w-12">{source.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};