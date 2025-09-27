import React, { useState, useEffect } from 'react';
import { 
  Users, Phone, Mail, Calendar, MessageCircle, TrendingUp, 
  Filter, Search, Eye, CheckCircle, Clock, AlertCircle,
  Star, MapPin, Car
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { leadsAPI } from '../../services/api';
import { formatPrice } from '../mock';

export const LeadsManagement = ({ dealerId }) => {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    search: '',
    dateRange: 'week'
  });

  useEffect(() => {
    if (dealerId) {
      loadLeads();
      loadStats();
    }
  }, [dealerId, filters]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await leadsAPI.getDealerLeads(dealerId, filters);
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await leadsAPI.getDealerStats(dealerId);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      await leadsAPI.updateLeadStatus(leadId, { status: newStatus });
      loadLeads(); // Refresh leads
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-600';
      case 'contacted': return 'bg-yellow-600';
      case 'qualified': return 'bg-purple-600';
      case 'converted': return 'bg-green-600';
      case 'closed': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getLeadTypeIcon = (type) => {
    switch (type) {
      case 'test_drive': return <Car className="h-4 w-4" />;
      case 'price_inquiry': return <TrendingUp className="h-4 w-4" />;
      case 'callback': return <Phone className="h-4 w-4" />;
      case 'message': return <MessageCircle className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const StatCard = ({ title, value, trend, icon: Icon, color = "text-white" }) => (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {trend && (
              <p className="text-green-400 text-sm flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{trend}% за неделю
              </p>
            )}
          </div>
          <div className="p-3 bg-amber-500/20 rounded-full">
            <Icon className="h-6 w-6 text-amber-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Всего лидов"
          value={stats.total_leads || 0}
          trend={stats.leads_growth}
          icon={Users}
        />
        <StatCard
          title="Новые лиды"
          value={stats.new_leads || 0}
          trend={stats.new_leads_growth}
          icon={AlertCircle}
          color="text-blue-400"
        />
        <StatCard
          title="Конверсия"
          value={`${stats.conversion_rate || 0}%`}
          trend={stats.conversion_growth}
          icon={TrendingUp}
          color="text-green-400"
        />
        <StatCard
          title="Средний чек"
          value={formatPrice(stats.average_deal_value || 0)}
          trend={stats.deal_value_growth}
          icon={Star}
          color="text-amber-400"
        />
      </div>

      {/* Filters and Controls */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Фильтры и поиск
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по имени, email, телефону..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <Select 
              value={filters.status} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="new">Новые</SelectItem>
                <SelectItem value="contacted">Связались</SelectItem>
                <SelectItem value="qualified">Квалифицированы</SelectItem>
                <SelectItem value="converted">Конвертированы</SelectItem>
                <SelectItem value="closed">Закрыты</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.type} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Тип обращения" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="test_drive">Тест-драйв</SelectItem>
                <SelectItem value="price_inquiry">Запрос цены</SelectItem>
                <SelectItem value="callback">Обратный звонок</SelectItem>
                <SelectItem value="message">Сообщения</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.dateRange} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Период" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Сегодня</SelectItem>
                <SelectItem value="week">На этой неделе</SelectItem>
                <SelectItem value="month">В этом месяце</SelectItem>
                <SelectItem value="quarter">В квартале</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Список лидов</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-400">Загрузка лидов...</div>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <div className="text-gray-400">Лиды не найдены</div>
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <Card key={lead.id} className="bg-gray-700/50 border-gray-600">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="p-1 bg-gray-600 rounded mr-3">
                            {getLeadTypeIcon(lead.type)}
                          </div>
                          <h3 className="text-white font-semibold">
                            {lead.customer_name || 'Анонимный покупатель'}
                          </h3>
                          <Badge className={`ml-2 ${getStatusColor(lead.status)} text-white`}>
                            {lead.status_display}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                          <div className="space-y-1">
                            {lead.email && (
                              <div className="flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {lead.email}
                              </div>
                            )}
                            {lead.phone && (
                              <div className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {lead.phone}
                              </div>
                            )}
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(lead.created_at).toLocaleDateString('ru-RU')}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            {lead.vehicle_info && (
                              <div className="flex items-center">
                                <Car className="h-3 w-3 mr-1" />
                                {lead.vehicle_info.make} {lead.vehicle_info.model}
                              </div>
                            )}
                            {lead.message && (
                              <div className="text-gray-400 text-xs">
                                "{lead.message.substring(0, 100)}..."
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {lead.status !== 'converted' && (
                          <Select 
                            value={lead.status}
                            onValueChange={(value) => updateLeadStatus(lead.id, value)}
                          >
                            <SelectTrigger className="w-32 bg-gray-600 border-gray-500 text-white text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">Новый</SelectItem>
                              <SelectItem value="contacted">Связались</SelectItem>
                              <SelectItem value="qualified">Квалифицирован</SelectItem>
                              <SelectItem value="converted">Конвертирован</SelectItem>
                              <SelectItem value="closed">Закрыт</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};