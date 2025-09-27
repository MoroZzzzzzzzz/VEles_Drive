import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  TrendingUp, Eye, MessageCircle, Star, Users, Car, CreditCard, 
  Calendar, Phone, CheckCircle, Clock, AlertCircle, ArrowUp, ArrowDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { leadsAPI, vehiclesAPI, reviewsAPI, messagesAPI } from '../../services/api';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

const StatCard = ({ title, value, change, icon: Icon, trend = "up", className = "" }) => {
  const trendColor = trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-gray-400";
  const TrendIcon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : null;

  return (
    <Card className={cn("bg-gray-800 border-gray-700", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <div className="flex items-center mt-2">
              <p className="text-3xl font-bold text-white">{value}</p>
              {change && TrendIcon && (
                <div className={cn("flex items-center ml-3", trendColor)}>
                  <TrendIcon className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">{change}%</span>
                </div>
              )}
            </div>
          </div>
          <div className="p-3 bg-amber-500/20 rounded-lg">
            <Icon className="w-6 h-6 text-amber-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const LeadCard = ({ lead, onStatusUpdate }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'contacted': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'test_drive': return Calendar;
      case 'price_inquiry': return CreditCard;
      case 'callback': return Phone;
      default: return MessageCircle;
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case 'test_drive': return 'Тест-драйв';
      case 'price_inquiry': return 'Запрос цены';
      case 'callback': return 'Обратный звонок';
      default: return 'Сообщение';
    }
  };

  const TypeIcon = getTypeIcon(lead.type);

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <TypeIcon className="w-4 h-4 text-amber-400" />
            <span className="text-white font-medium">{getTypeName(lead.type)}</span>
          </div>
          <Badge className={getStatusColor(lead.status)}>
            {lead.status === 'new' && 'Новая'}
            {lead.status === 'contacted' && 'В работе'}
            {lead.status === 'completed' && 'Завершена'}
            {lead.status === 'cancelled' && 'Отменена'}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Клиент:</span>
            <span className="text-white text-sm">{lead.customer_name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Телефон:</span>
            <a href={`tel:${lead.customer_phone}`} className="text-amber-400 text-sm hover:underline">
              {lead.customer_phone}
            </a>
          </div>
          {lead.preferred_date && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Дата:</span>
              <span className="text-white text-sm">
                {new Date(lead.preferred_date).toLocaleDateString('ru-RU')} в {lead.preferred_time}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Создана:</span>
            <span className="text-gray-300 text-sm">
              {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: ru })}
            </span>
          </div>
        </div>

        {lead.message && (
          <div className="mt-3 p-2 bg-gray-900 rounded text-gray-300 text-sm">
            "{lead.message}"
          </div>
        )}

        <div className="flex space-x-2 mt-4">
          <Button
            size="sm"
            onClick={() => onStatusUpdate(lead.id, 'contacted')}
            disabled={lead.status !== 'new'}
            className="flex-1 bg-amber-500 hover:bg-amber-600"
          >
            Связаться
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStatusUpdate(lead.id, 'completed')}
            disabled={lead.status === 'completed' || lead.status === 'cancelled'}
            className="flex-1"
          >
            Завершить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const RecentActivityCard = ({ activities }) => {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Последняя активность</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Нет активности</p>
          ) : (
            activities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <activity.icon className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.title}</p>
                  <p className="text-gray-400 text-xs">{activity.description}</p>
                  <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const DealerAnalytics = ({ dealerId }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalViews: 0,
    totalLeads: 0,
    conversionRate: 0,
    averageRating: 0,
    totalVehicles: 0,
    unreadMessages: 0
  });
  const [leads, setLeads] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (dealerId) {
      loadAnalytics();
    }
  }, [dealerId]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // Load leads stats
      const leadsStats = await leadsAPI.getDealerLeadStats(dealerId);
      const newLeads = await leadsAPI.getDealerLeads(dealerId, 'new');
      
      // Load other stats (mock for now)
      const mockStats = {
        totalViews: 1247,
        totalLeads: leadsStats.total_leads,
        conversionRate: leadsStats.conversion_rate,
        averageRating: 4.8,
        totalVehicles: 12,
        unreadMessages: 3
      };

      setStats(mockStats);
      setLeads(newLeads.slice(0, 5)); // Show only first 5 leads
      
      // Generate recent activity
      const activities = [
        {
          icon: Eye,
          title: 'BMW X5 2023 просмотрели 15 раз',
          description: 'За последние 24 часа',
          time: '2 часа назад'
        },
        {
          icon: MessageCircle,
          title: 'Новое сообщение от клиента',
          description: 'Вопрос об Audi A4',
          time: '4 часа назад'
        },
        {
          icon: Star,
          title: 'Получен новый отзыв',
          description: 'Рейтинг: 5 звезд',
          time: '1 день назад'
        }
      ];
      
      setRecentActivity(activities);
      
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadStatusUpdate = async (leadId, status) => {
    try {
      await leadsAPI.updateLeadStatus(leadId, status);
      // Reload leads
      const newLeads = await leadsAPI.getDealerLeads(dealerId, 'new');
      setLeads(newLeads.slice(0, 5));
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-400">Загрузка аналитики...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Всего просмотров"
          value={stats.totalViews.toLocaleString()}
          change={12}
          trend="up"
          icon={Eye}
        />
        <StatCard
          title="Заявок"
          value={stats.totalLeads}
          change={8}
          trend="up"
          icon={Users}
        />
        <StatCard
          title="Конверсия"
          value={`${stats.conversionRate}%`}
          change={3.2}
          trend="up"
          icon={TrendingUp}
        />
        <StatCard
          title="Рейтинг"
          value={stats.averageRating}
          icon={Star}
        />
        <StatCard
          title="Автомобилей"
          value={stats.totalVehicles}
          icon={Car}
        />
        <StatCard
          title="Непрочитанные"
          value={stats.unreadMessages}
          icon={MessageCircle}
          className={stats.unreadMessages > 0 ? "border-amber-500/30" : ""}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* New Leads */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Новые заявки</CardTitle>
            <Badge className="bg-blue-500/20 text-blue-400">{leads.length}</Badge>
          </CardHeader>
          <CardContent>
            {leads.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-50" />
                <p className="text-gray-400">Новых заявок нет</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onStatusUpdate={handleLeadStatusUpdate}
                  />
                ))}
                
                <Button 
                  variant="outline" 
                  className="w-full border-amber-500/30 text-amber-400"
                >
                  Показать все заявки
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <RecentActivityCard activities={recentActivity} />
      </div>

      {/* Performance Chart Placeholder */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Статистика просмотров</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-900 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <p className="text-gray-400">График статистики</p>
              <p className="text-gray-500 text-sm">Интеграция с Chart.js планируется</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};