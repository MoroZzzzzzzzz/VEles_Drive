import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Star, MessageSquare, ThumbsUp, ThumbsDown, User, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { reviewsAPI } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '../../lib/utils';

const StarRating = ({ rating, onRatingChange = null, size = "w-5 h-5", readonly = false }) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleStarClick = (starRating) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={cn(
            "transition-colors",
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          )}
          onClick={() => handleStarClick(star)}
          onMouseEnter={() => !readonly && setHoveredRating(star)}
          onMouseLeave={() => !readonly && setHoveredRating(0)}
        >
          <Star
            className={cn(
              size,
              "transition-colors",
              (hoveredRating ? star <= hoveredRating : star <= rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-400"
            )}
          />
        </button>
      ))}
    </div>
  );
};

export const ReviewForm = ({ dealerId, onReviewAdded }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    pros: [''],
    cons: ['']
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.rating === 0) {
      alert('Пожалуйста, выберите рейтинг');
      return;
    }
    if (!formData.title.trim() || !formData.comment.trim()) {
      alert('Пожалуйста, заполните заголовок и комментарий');
      return;
    }

    try {
      setIsLoading(true);
      await reviewsAPI.createReview({
        dealer_id: dealerId,
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment,
        pros: formData.pros.filter(p => p.trim()),
        cons: formData.cons.filter(c => c.trim())
      });

      setIsOpen(false);
      setFormData({
        rating: 0,
        title: '',
        comment: '',
        pros: [''],
        cons: ['']
      });
      
      if (onReviewAdded) {
        onReviewAdded();
      }
    } catch (error) {
      console.error('Error creating review:', error);
      alert(error.response?.data?.detail || 'Ошибка создания отзыва');
    } finally {
      setIsLoading(false);
    }
  };

  const updateArrayField = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayField = (field) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayField = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-amber-500 hover:bg-amber-600">
          <MessageSquare className="w-4 h-4 mr-2" />
          Написать отзыв
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Написать отзыв</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <Label className="text-white">Рейтинг *</Label>
            <StarRating 
              rating={formData.rating}
              onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
              size="w-8 h-8"
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">Заголовок *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="Краткое описание вашего опыта"
              maxLength={100}
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-white">Отзыв *</Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
              placeholder="Поделитесь подробностями вашего опыта работы с этим дилером"
              maxLength={1000}
            />
          </div>

          {/* Pros */}
          <div className="space-y-2">
            <Label className="text-white flex items-center">
              <ThumbsUp className="w-4 h-4 mr-2 text-green-400" />
              Достоинства
            </Label>
            {formData.pros.map((pro, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  value={pro}
                  onChange={(e) => updateArrayField('pros', index, e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Что понравилось"
                />
                {formData.pros.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayField('pros', index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => addArrayField('pros')}
              className="text-green-400 hover:text-green-300"
            >
              + Добавить достоинство
            </Button>
          </div>

          {/* Cons */}
          <div className="space-y-2">
            <Label className="text-white flex items-center">
              <ThumbsDown className="w-4 h-4 mr-2 text-red-400" />
              Недостатки
            </Label>
            {formData.cons.map((con, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  value={con}
                  onChange={(e) => updateArrayField('cons', index, e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Что не понравилось"
                />
                {formData.cons.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayField('cons', index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => addArrayField('cons')}
              className="text-red-400 hover:text-red-300"
            >
              + Добавить недостаток
            </Button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setIsOpen(false)}
              className="text-gray-300"
            >
              Отмена
            </Button>
            <Button 
              type="submit"
              disabled={isLoading || formData.rating === 0}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {isLoading ? 'Отправка...' : 'Опубликовать отзыв'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const ReviewCard = ({ review, onDelete = null }) => {
  const { user } = useAuth();
  const canDelete = user && (user.id === review.user_id || user.role === 'admin');

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-medium">{review.user_name}</p>
            <div className="flex items-center space-x-2">
              <StarRating rating={review.rating} readonly size="w-4 h-4" />
              <span className="text-gray-400 text-sm flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDistanceToNow(new Date(review.created_at), {
                  addSuffix: true,
                  locale: ru
                })}
              </span>
            </div>
          </div>
        </div>
        {canDelete && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(review.id)}
            className="text-red-400 hover:text-red-300"
          >
            Удалить
          </Button>
        )}
      </div>

      <div>
        <h4 className="text-white font-medium mb-2">{review.title}</h4>
        <p className="text-gray-300">{review.comment}</p>
      </div>

      {(review.pros.length > 0 || review.cons.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {review.pros.length > 0 && (
            <div className="space-y-2">
              <p className="text-green-400 font-medium flex items-center">
                <ThumbsUp className="w-4 h-4 mr-2" />
                Достоинства
              </p>
              <ul className="text-gray-300 text-sm space-y-1">
                {review.pros.map((pro, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-400 mr-2">+</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {review.cons.length > 0 && (
            <div className="space-y-2">
              <p className="text-red-400 font-medium flex items-center">
                <ThumbsDown className="w-4 h-4 mr-2" />
                Недостатки
              </p>
              <ul className="text-gray-300 text-sm space-y-1">
                {review.cons.map((con, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-400 mr-2">-</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const ReviewsList = ({ dealerId, showForm = true }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (dealerId) {
      loadReviews();
      loadStats();
    }
  }, [dealerId]);

  const loadReviews = async () => {
    try {
      const data = await reviewsAPI.getDealerReviews(dealerId);
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await reviewsAPI.getDealerStats(dealerId);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewAdded = () => {
    loadReviews();
    loadStats();
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Вы уверены, что хотите удалить отзыв?')) {
      return;
    }

    try {
      await reviewsAPI.deleteReview(reviewId);
      loadReviews();
      loadStats();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Ошибка удаления отзыва');
    }
  };

  if (isLoading) {
    return (
      <div className="text-gray-400 text-center py-8">
        Загрузка отзывов...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-lg font-semibold">Рейтинг и отзывы</h3>
            {showForm && <ReviewForm dealerId={dealerId} onReviewAdded={handleReviewAdded} />}
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-white">{stats.average_rating}</div>
              <div>
                <StarRating rating={Math.round(stats.average_rating)} readonly />
                <p className="text-gray-400 text-sm">{stats.total_reviews} отзывов</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <span className="text-gray-400 text-sm w-2">{rating}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ 
                        width: `${stats.total_reviews > 0 ? (stats.rating_distribution[rating] / stats.total_reviews) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-gray-400 text-sm w-6">{stats.rating_distribution[rating]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-gray-400 text-center py-8">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Пока нет отзывов об этом дилере</p>
          {showForm && <p className="text-sm mt-2">Будьте первым, кто оставит отзыв!</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              onDelete={handleDeleteReview}
            />
          ))}
        </div>
      )}
    </div>
  );
};