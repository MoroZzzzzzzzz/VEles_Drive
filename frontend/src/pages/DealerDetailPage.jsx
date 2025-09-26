import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Star, Car, ArrowLeft, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { dealersAPI, vehiclesAPI } from '../services/api';
import { formatPrice } from '../components/mock';

export const DealerDetailPage = () => {
  const { id } = useParams();
  const [dealer, setDealer] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
    pros: '',
    cons: ''
  });

  useEffect(() => {
    if (id) {
      loadDealerData();
    }
  }, [id]);

  const loadDealerData = async () => {
    try {
      setLoading(true);
      
      // Load dealer info
      const dealerData = await dealersAPI.getDealer(id);
      setDealer(dealerData);
      
      // Load dealer vehicles
      const vehiclesData = await dealersAPI.getDealerVehicles(id);
      setVehicles(vehiclesData.vehicles || []);
      
      // Load reviews
      const reviewsData = await dealersAPI.getDealerReviews(id);
      setReviews(reviewsData || []);
      
    } catch (error) {
      console.error('Error loading dealer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const reviewData = {
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
        pros: reviewForm.pros.split(',').map(s => s.trim()).filter(Boolean),
        cons: reviewForm.cons.split(',').map(s => s.trim()).filter(Boolean)
      };
      
      await dealersAPI.createDealerReview(id, reviewData);
      await loadDealerData();
      
      // Reset form
      setReviewForm({
        rating: 5,
        title: '',
        comment: '',
        pros: '',
        cons: ''
      });
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-white text-lg">Загрузка...</div>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Дилер не найден</h1>
          <Link to="/dealers">
            <Button className="bg-gradient-to-r from-amber-500 to-orange-600">
              Вернуться к дилерам
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 lg:px-6 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => window.history.back()}
          className="text-gray-300 hover:text-white mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>

        {/* Dealer Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            {/* Dealer Image */}
            <div className="aspect-[16/9] overflow-hidden rounded-2xl mb-6">
              <img 
                src={dealer.logo || dealer.gallery_images?.[0] || "https://images.unsplash.com/photo-1562141961-531d80a1a4d3?w=800&q=80"} 
                alt={dealer.company_name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Dealer Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">{dealer.company_name}</h1>
                  <p className="text-xl text-gray-400 mb-4">{dealer.specialization}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    <div className="flex items-center mr-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-5 w-5 ${i < Math.floor(dealer.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                        />
                      ))}
                      <span className="text-white font-semibold ml-2">{dealer.rating || 4.8}</span>
                    </div>
                    <span className="text-gray-400">
                      {dealer.reviews_count || 0} отзывов
                    </span>
                  </div>

                  <Badge className="bg-green-600 text-white">
                    Проверенный дилер
                  </Badge>
                </div>
              </div>

              <p className="text-gray-300 leading-relaxed">
                {dealer.description || 'Официальный дилер премиум автомобилей с безупречной репутацией и высоким уровнем сервиса.'}
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <Card className="bg-gray-900/50 border-gray-800 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Контактная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-amber-500 flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-white font-medium">Адрес</div>
                    <div className="text-gray-300">{dealer.address}</div>
                  </div>
                </div>
                
                {dealer.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-amber-500" />
                    <div>
                      <div className="text-white font-medium">Телефон</div>
                      <div className="text-gray-300">{dealer.phone}</div>
                    </div>
                  </div>
                )}
                
                {dealer.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-amber-500" />
                    <div>
                      <div className="text-white font-medium">Email</div>
                      <div className="text-gray-300">{dealer.email}</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <div>
                    <div className="text-white font-medium">Режим работы</div>
                    <div className="text-gray-300">{dealer.working_hours || 'Пн-Вс: 9:00-21:00'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">{vehicles.length}</div>
                    <div className="text-gray-400 text-sm">Автомобилей</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{dealer.established_year || 2015}</div>
                    <div className="text-gray-400 text-sm">Год основания</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="vehicles" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900 mb-8">
            <TabsTrigger value="vehicles" className="text-white data-[state=active]:bg-amber-600">
              Автомобили ({vehicles.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="text-white data-[state=active]:bg-amber-600">
              Отзывы ({reviews.length})
            </TabsTrigger>
            <TabsTrigger value="about" className="text-white data-[state=active]:bg-amber-600">
              О дилере
            </TabsTrigger>
          </TabsList>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles">
            {vehicles.length === 0 ? (
              <div className="text-center py-12">
                <Car className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Нет автомобилей в продаже
                </h3>
                <p className="text-gray-400">
                  В данный момент у дилера нет доступных автомобилей
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {vehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="group bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-300">
                    <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
                      <img 
                        src={vehicle.images?.[0]?.url || "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&q=80"} 
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-lg font-bold text-white mb-2">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3">
                        {vehicle.year} • {vehicle.mileage ? `${vehicle.mileage.toLocaleString('ru-RU')} км` : 'Новый'}
                      </p>
                      <div className="text-2xl font-bold text-white mb-4">
                        {formatPrice(vehicle.price)}
                      </div>
                      <Link to={`/vehicles/${vehicle.id}`}>
                        <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600">
                          Подробнее
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Пока нет отзывов
                    </h3>
                    <p className="text-gray-400">
                      Станьте первым, кто оставит отзыв о данном дилере
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <Card key={review.id} className="bg-gray-900/50 border-gray-800">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="text-white font-medium">{review.title}</h4>
                              <div className="flex items-center mt-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-gray-400 text-sm">
                              {new Date(review.created_at).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                          <p className="text-gray-300 mb-4">{review.comment}</p>
                          {review.pros && review.pros.length > 0 && (
                            <div className="mb-3">
                              <span className="text-green-400 font-medium">Плюсы: </span>
                              <span className="text-gray-300">{review.pros.join(', ')}</span>
                            </div>
                          )}
                          {review.cons && review.cons.length > 0 && (
                            <div>
                              <span className="text-red-400 font-medium">Минусы: </span>
                              <span className="text-gray-300">{review.cons.join(', ')}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Review Form */}
              <div>
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Оставить отзыв</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <Label className="text-white">Оценка</Label>
                        <div className="flex space-x-1 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                              className="focus:outline-none"
                            >
                              <Star 
                                className={`h-6 w-6 ${star <= reviewForm.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-white">Заголовок</Label>
                        <Input
                          value={reviewForm.title}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Краткое описание опыта"
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-white">Комментарий</Label>
                        <Textarea
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                          placeholder="Расскажите о вашем опыте..."
                          rows={4}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-white">Плюсы (через запятую)</Label>
                        <Input
                          value={reviewForm.pros}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, pros: e.target.value }))}
                          placeholder="Быстрое обслуживание, хорошие цены"
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-white">Минусы (через запятую)</Label>
                        <Input
                          value={reviewForm.cons}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, cons: e.target.value }))}
                          placeholder="Долгое ожидание"
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>

                      <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-600">
                        <Send className="h-4 w-4 mr-2" />
                        Отправить отзыв
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">О компании</h3>
                    <p className="text-gray-300 leading-relaxed">
                      {dealer.description || 'Информация о компании будет добавлена позже.'}
                    </p>
                  </div>

                  {dealer.gallery_images && dealer.gallery_images.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">Галерея</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {dealer.gallery_images.map((image, index) => (
                          <div key={index} className="aspect-square overflow-hidden rounded-lg">
                            <img 
                              src={image} 
                              alt={`${dealer.company_name} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};