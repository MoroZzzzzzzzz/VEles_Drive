import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Car, Star, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { dealersAPI } from '../services/api';
import { Link } from 'react-router-dom';

export const DealersPage = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadDealers();
  }, [currentPage]);

  const loadDealers = async () => {
    try {
      setLoading(true);
      const data = await dealersAPI.getDealers({
        page: currentPage,
        limit: 12
      });
      setDealers(data.dealers || []);
      setTotalCount(data.total || 0);
    } catch (error) {
      console.error('Error loading dealers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Filter dealers by search term locally
    if (!searchTerm) {
      loadDealers();
      return;
    }
    
    const filtered = dealers.filter(dealer => 
      dealer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dealer.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dealer.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setDealers(filtered);
  };

  const DealerCard = ({ dealer }) => (
    <Card className="group bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-300 overflow-hidden backdrop-blur-sm">
      <div className="aspect-[4/3] overflow-hidden">
        <img 
          src={dealer.logo || "https://images.unsplash.com/photo-1562141961-531d80a1a4d3?w=800&q=80"} 
          alt={dealer.company_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <CardContent className="p-6">
        <div className="mb-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
              {dealer.company_name}
            </h3>
            <Badge className="bg-green-600 text-white ml-2 flex-shrink-0">
              Проверен
            </Badge>
          </div>
          
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
            {dealer.specialization || 'Продажа автомобилей премиум класса'}
          </p>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex items-center mr-3">
              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
              <span className="text-white font-semibold">{dealer.rating || 4.8}</span>
            </div>
            <span className="text-gray-400 text-sm">
              {dealer.reviews_count || 0} отзывов
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-6 text-sm">
          <div className="flex items-start text-gray-300">
            <MapPin className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">
              {dealer.address || `${dealer.city}, Россия`}
            </span>
          </div>
          
          <div className="flex items-center text-gray-300">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            {dealer.working_hours || 'Пн-Вс: 9:00-21:00'}
          </div>

          <div className="flex items-center text-gray-300">
            <Car className="h-4 w-4 mr-2 text-gray-500" />
            {dealer.cars_count || 25} автомобилей
          </div>

          {dealer.phone && (
            <div className="flex items-center text-gray-300">
              <Phone className="h-4 w-4 mr-2 text-gray-500" />
              {dealer.phone}
            </div>
          )}
        </div>

        {/* Experience Badge */}
        <div className="mb-6">
          <Badge variant="outline" className="border-gray-600 text-gray-300">
            С {dealer.established_year || 2015} года
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link to={`/dealers/${dealer.id}`}>
            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0">
              Посмотреть авто
            </Button>
          </Link>
          
          <Button 
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500"
          >
            <Phone className="h-4 w-4 mr-2" />
            Связаться
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 lg:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Проверенные <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">дилеры</span>
          </h1>
          <p className="text-gray-400 text-lg">
            {totalCount} официальных автосалонов с безупречной репутацией
          </p>
        </div>

        {/* Search */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-800">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Поиск по названию дилера, специализации или городу..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              onClick={handleSearch}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
            >
              <Search className="mr-2 h-4 w-4" />
              Найти
            </Button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-white text-lg">Загрузка дилеров...</div>
          </div>
        ) : dealers.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 text-lg mb-4">
              Дилеры не найдены
            </div>
            <p className="text-gray-500">
              Попробуйте изменить поисковый запрос
            </p>
          </div>
        ) : (
          <>
            {/* Results Info */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-400">
                Найдено {dealers.length} дилеров
              </p>
            </div>

            {/* Dealers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
              {dealers.map((dealer) => (
                <DealerCard key={dealer.id} dealer={dealer} />
              ))}
            </div>

            {/* Pagination */}
            {totalCount > 12 && (
              <div className="flex justify-center">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="border-gray-600 text-gray-300"
                  >
                    Назад
                  </Button>
                  <span className="flex items-center px-4 text-white">
                    {currentPage} из {Math.ceil(totalCount / 12)}
                  </span>
                  <Button
                    variant="outline"
                    disabled={currentPage >= Math.ceil(totalCount / 12)}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="border-gray-600 text-gray-300"
                  >
                    Далее
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Info Section */}
        <div className="mt-16 bg-gradient-to-r from-amber-500/20 to-orange-600/20 backdrop-blur-sm rounded-3xl p-12 border border-amber-500/30">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Станьте нашим партнером
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Присоединяйтесь к сети проверенных дилеров VELES DRIVE. 
              Получите доступ к миллионам потенциальных покупателей и современным инструментам продаж.
            </p>
            <Button 
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-3 text-lg"
            >
              Стать дилером
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};