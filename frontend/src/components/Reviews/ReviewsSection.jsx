import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageCircle, User, Calendar, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { reviewsAPI } from '../../services/api';

export const ReviewsSection = ({ vehicleId, dealerId, type = 'vehicle' }) => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
    pros: '',
    cons: ''
  });

  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: [0, 0, 0, 0, 0]
  });

  useEffect(() => {
    loadReviews();
  }, [vehicleId, dealerId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      let data;
      if (type === 'vehicle' && vehicleId) {
        data = await reviewsAPI.getVehicleReviews(vehicleId);
      } else if (type === 'dealer' && dealerId) {
        data = await reviewsAPI.getDealerReviews(dealerId);
      }
      
      if (data) {
        setReviews(data.reviews || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      // Use mock data for demo
      setReviews(mockReviews);
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    try {
      const reviewData = {
        ...newReview,
        vehicle_id: vehicleId,
        dealer_id: dealerId,
        type
      };

      await reviewsAPI.createReview(reviewData);
      setShowWriteReview(false);
      setNewReview({ rating: 5, title: '', comment: '', pros: '', cons: '' });
      loadReviews();
    } catch (error) {
      console.error('Error creating review:', error);
    }
  };

  const StarRating = ({ rating, size = 'default', interactive = false, onChange }) => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      default: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
            } ${interactive ? 'cursor-pointer hover:text-yellow-300' : ''}`}
            onClick={interactive ? () => onChange?.(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const ReviewCard = ({ review }) => (
    <Card className="bg-gray-800/50 border-gray-700 mb-4">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <h4 className="text-white font-semibold">{review.author}</h4>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Calendar className="h-3 w-3" />
                <span>{new Date(review.createdAt).toLocaleDateString('ru-RU')}</span>
                {review.verified && (
                  <Badge className="bg-green-600 text-white text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Проверен
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <StarRating rating={review.rating} />
        </div>

        {review.title && (
          <h5 className="text-white font-medium mb-2">{review.title}</h5>
        )}

        <p className="text-gray-300 mb-4">{review.comment}</p>

        {(review.pros || review.cons) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {review.pros && (
              <div>
                <h6 className="text-green-400 font-medium mb-2">Плюсы:</h6>
                <p className="text-sm text-gray-300">{review.pros}</p>
              </div>
            )}
            {review.cons && (
              <div>
                <h6 className="text-red-400 font-medium mb-2">Минусы:</h6>
                <p className="text-sm text-gray-300">{review.cons}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 hover:text-gray-300">
              <ThumbsUp className="h-4 w-4" />
              <span>{review.likes || 0}</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-gray-300">
              <MessageCircle className="h-4 w-4" />
              <span>Ответить</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const RatingDistribution = () => (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Распределение оценок</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center space-x-3">
              <span className="text-white w-8">{star}</span>
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full" 
                  style={{ 
                    width: `${stats.totalReviews > 0 ? (stats.ratingDistribution[star - 1] / stats.totalReviews) * 100 : 0}%` 
                  }}
                />
              </div>
              <span className="text-gray-400 text-sm w-8">
                {stats.ratingDistribution[star - 1]}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400">Загрузка отзывов...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Отзывы {type === 'vehicle' ? 'об автомобиле' : 'о дилере'}
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <StarRating rating={Math.round(stats.averageRating)} />
              <span className="text-white font-semibold">{stats.averageRating.toFixed(1)}</span>
            </div>
            <span className="text-gray-400">
              {stats.totalReviews} отзывов
            </span>
          </div>
        </div>

        {isAuthenticated && user?.role === 'buyer' && (
          <Button
            onClick={() => setShowWriteReview(!showWriteReview)}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          >
            Написать отзыв
          </Button>
        )}
      </div>

      {/* Write Review Form */}
      {showWriteReview && isAuthenticated && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Написать отзыв</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Оценка</label>
                <StarRating 
                  rating={newReview.rating} 
                  size="lg" 
                  interactive
                  onChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Заголовок</label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="Краткое резюме вашего отзыва"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Отзыв</label>
                <Textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  className="min-h-[120px] bg-gray-700 border-gray-600 text-white"
                  placeholder="Поделитесь своим опытом..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Плюсы</label>
                  <Textarea
                    value={newReview.pros}
                    onChange={(e) => setNewReview(prev => ({ ...prev, pros: e.target.value }))}
                    className="min-h-[80px] bg-gray-700 border-gray-600 text-white"
                    placeholder="Что вам понравилось?"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Минусы</label>
                  <Textarea
                    value={newReview.cons}
                    onChange={(e) => setNewReview(prev => ({ ...prev, cons: e.target.value }))}
                    className="min-h-[80px] bg-gray-700 border-gray-600 text-white"
                    placeholder="Что можно улучшить?"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Опубликовать отзыв
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowWriteReview(false)}
                  className="border-gray-600 text-gray-300"
                >
                  Отмена
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Reviews List */}
        <div className="lg:col-span-3">
          {reviews.length === 0 ? (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h4 className="text-white font-semibold mb-2">Пока нет отзывов</h4>
                <p className="text-gray-400">Станьте первым, кто оставит отзыв!</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>

        {/* Rating Distribution */}
        <div>
          <RatingDistribution />
        </div>
      </div>
    </div>
  );
};

// Mock data for demo
const mockStats = {
  averageRating: 4.6,
  totalReviews: 8,
  ratingDistribution: [1, 0, 1, 2, 4] // [1-star, 2-star, 3-star, 4-star, 5-star]
};

const mockReviews = [
  {
    id: 1,
    author: 'Алексей П.',
    rating: 5,
    title: 'Отличный автомобиль!',
    comment: 'Купил месяц назад, очень доволен. Динамика потрясающая, управляется как на рельсах.',
    pros: 'Мощный двигатель, отличная управляемость, престижный бренд',
    cons: 'Высокий расход топлива, дорогое обслуживание',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 5,
    verified: true
  },
  {
    id: 2,
    author: 'Мария К.',
    rating: 4,
    title: 'Хорошая покупка',
    comment: 'В целом довольна покупкой. Автомобиль в отличном состоянии, все как описано.',
    pros: 'Состояние как новый, честный дилер',
    cons: 'Долго оформляли документы',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 3,
    verified: true
  }
];