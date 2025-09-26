import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Share2, Eye, MapPin, Calendar, Fuel, Settings, Gauge, Palette, ArrowLeft, Phone, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { vehiclesAPI, dealersAPI } from '../services/api';
import { formatPrice } from '../components/mock';

export const VehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [dealer, setDealer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      loadVehicle();
    }
  }, [id]);

  const loadVehicle = async () => {
    try {
      setLoading(true);
      const vehicleData = await vehiclesAPI.getVehicle(id);
      setVehicle(vehicleData);
      
      if (vehicleData.dealer_id) {
        const dealerData = await dealersAPI.getDealer(vehicleData.dealer_id);
        setDealer(dealerData);
      }
    } catch (error) {
      console.error('Error loading vehicle:', error);
      // Navigate back if vehicle not found
      navigate('/catalog');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-white text-lg">Загрузка...</div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Автомобиль не найден</h1>
          <Link to="/catalog">
            <Button className="bg-gradient-to-r from-amber-500 to-orange-600">
              Вернуться к каталогу
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = vehicle.images?.length > 0 
    ? vehicle.images.map(img => img.url) 
    : ["https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80"];

  const specifications = [
    { icon: Calendar, label: 'Год выпуска', value: vehicle.year },
    { icon: Gauge, label: 'Пробег', value: vehicle.mileage ? `${vehicle.mileage.toLocaleString('ru-RU')} км` : 'Новый' },
    { icon: Fuel, label: 'Двигатель', value: vehicle.engine },
    { icon: Settings, label: 'Мощность', value: vehicle.power ? `${vehicle.power} л.с.` : 'Не указано' },
    { icon: Settings, label: 'Трансмиссия', value: vehicle.transmission || 'Не указано' },
    { icon: Palette, label: 'Цвет', value: vehicle.color || 'Не указан' },
  ];

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 lg:px-6 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="text-gray-300 hover:text-white mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images Section */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-gray-900">
                <img 
                  src={images[currentImageIndex]} 
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Image Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        currentImageIndex === index 
                          ? 'border-amber-500' 
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <img 
                        src={image} 
                        alt={`${vehicle.make} ${vehicle.model} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <div className="flex gap-2 mb-3">
                {vehicle.condition === 'new' && (
                  <Badge className="bg-green-600 text-white">Новый</Badge>
                )}
                {vehicle.is_featured && (
                  <Badge className="bg-amber-600 text-white">Премиум</Badge>
                )}
              </div>
              
              <h1 className="text-4xl font-bold text-white mb-2">
                {vehicle.make} {vehicle.model}
              </h1>
              
              <div className="flex items-center text-gray-400 mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                {vehicle.location}
              </div>

              <div className="text-4xl font-bold text-white mb-6">
                {formatPrice(vehicle.price)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                <Phone className="h-4 w-4 mr-2" />
                Позвонить
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Dealer Info */}
            {dealer && (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Дилер</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-white">{dealer.company_name}</h3>
                    <p className="text-gray-400 text-sm">{dealer.specialization}</p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-300">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      {dealer.address}
                    </div>
                    {dealer.phone && (
                      <div className="flex items-center text-gray-300">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        {dealer.phone}
                      </div>
                    )}
                    {dealer.email && (
                      <div className="flex items-center text-gray-300">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        {dealer.email}
                      </div>
                    )}
                  </div>

                  <Link to={`/dealers/${dealer.id}`}>
                    <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                      Посмотреть все авто дилера
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">{vehicle.views_count || 0}</div>
                    <div className="text-gray-400 text-sm">Просмотров</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{vehicle.favorites_count || 0}</div>
                    <div className="text-gray-400 text-sm">В избранном</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="specs" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-900 mb-8">
              <TabsTrigger value="specs" className="text-white data-[state=active]:bg-amber-600">
                Характеристики
              </TabsTrigger>
              <TabsTrigger value="description" className="text-white data-[state=active]:bg-amber-600">
                Описание
              </TabsTrigger>
              <TabsTrigger value="features" className="text-white data-[state=active]:bg-amber-600">
                Комплектация
              </TabsTrigger>
            </TabsList>

            <TabsContent value="specs">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Технические характеристики</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {specifications.map((spec, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <spec.icon className="h-5 w-5 text-amber-500 flex-shrink-0" />
                        <div>
                          <div className="text-gray-400 text-sm">{spec.label}</div>
                          <div className="text-white font-medium">{spec.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="description">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Описание</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed">
                    {vehicle.description || 'Описание не указано.'}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Комплектация</CardTitle>
                </CardHeader>
                <CardContent>
                  {vehicle.features && vehicle.features.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {vehicle.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">Информация о комплектации не указана.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};