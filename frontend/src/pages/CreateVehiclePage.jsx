import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X, Save, Eye } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { vehiclesAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const CreateVehiclePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: 'car',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    condition: 'new',
    mileage: '',
    color: '',
    engine: '',
    transmission: '',
    fuel_type: '',
    power: '',
    body_type: '',
    drive_type: '',
    description: '',
    features: [],
    location: '',
    is_featured: false
  });
  const [images, setImages] = useState([]);
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    if (user?.role !== 'dealer') {
      navigate('/');
      return;
    }
    loadCategories();
  }, [user]);

  const loadCategories = async () => {
    try {
      const data = await vehiclesAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({ 
        ...prev, 
        features: [...prev.features, newFeature.trim()] 
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({ 
      ...prev, 
      features: prev.features.filter((_, i) => i !== index) 
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          url: reader.result,
          file: file
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.make || !formData.model || !formData.price) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
      }

      const vehicleData = {
        ...formData,
        price: parseFloat(formData.price),
        year: parseInt(formData.year),
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        power: formData.power ? parseInt(formData.power) : null
      };

      const response = await vehiclesAPI.createVehicle(vehicleData);
      
      // TODO: Upload images to server
      console.log('Created vehicle:', response);
      console.log('Images to upload:', images);

      navigate('/dealer/dashboard');
    } catch (error) {
      console.error('Error creating vehicle:', error);
      alert(error.response?.data?.detail || 'Ошибка при создании автомобиля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 lg:px-6 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dealer/dashboard')}
            className="text-gray-300 hover:text-white mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к панели
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Добавить <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">автомобиль</span>
            </h1>
            <p className="text-gray-400">
              Заполните информацию о новом автомобиле
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Information */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Основная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category */}
                    <div>
                      <Label className="text-white">Категория *</Label>
                      {categories && (
                        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.categories.map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {/* Make */}
                    <div>
                      <Label className="text-white">Марка *</Label>
                      <Input
                        value={formData.make}
                        onChange={(e) => handleInputChange('make', e.target.value)}
                        placeholder="Например: BMW"
                        className="bg-gray-800 border-gray-700 text-white"
                        required
                      />
                    </div>

                    {/* Model */}
                    <div>
                      <Label className="text-white">Модель *</Label>
                      <Input
                        value={formData.model}
                        onChange={(e) => handleInputChange('model', e.target.value)}
                        placeholder="Например: X5"
                        className="bg-gray-800 border-gray-700 text-white"
                        required
                      />
                    </div>

                    {/* Year */}
                    <div>
                      <Label className="text-white">Год выпуска *</Label>
                      <Input
                        type="number"
                        value={formData.year}
                        onChange={(e) => handleInputChange('year', e.target.value)}
                        min="1990"
                        max={new Date().getFullYear() + 1}
                        className="bg-gray-800 border-gray-700 text-white"
                        required
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <Label className="text-white">Цена (руб.) *</Label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="5000000"
                        className="bg-gray-800 border-gray-700 text-white"
                        required
                      />
                    </div>

                    {/* Condition */}
                    <div>
                      <Label className="text-white">Состояние</Label>
                      {categories && (
                        <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.conditions.map(cond => (
                              <SelectItem key={cond.value} value={cond.value}>{cond.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Specifications */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Технические характеристики</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Mileage */}
                    <div>
                      <Label className="text-white">Пробег (км)</Label>
                      <Input
                        type="number"
                        value={formData.mileage}
                        onChange={(e) => handleInputChange('mileage', e.target.value)}
                        placeholder="0 для нового авто"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>

                    {/* Engine */}
                    <div>
                      <Label className="text-white">Двигатель</Label>
                      <Input
                        value={formData.engine}
                        onChange={(e) => handleInputChange('engine', e.target.value)}
                        placeholder="3.0 V6 Turbo"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>

                    {/* Power */}
                    <div>
                      <Label className="text-white">Мощность (л.с.)</Label>
                      <Input
                        type="number"
                        value={formData.power}
                        onChange={(e) => handleInputChange('power', e.target.value)}
                        placeholder="400"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>

                    {/* Transmission */}
                    <div>
                      <Label className="text-white">Трансмиссия</Label>
                      {categories && (
                        <Select value={formData.transmission} onValueChange={(value) => handleInputChange('transmission', value)}>
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue placeholder="Выберите трансмиссию" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.transmissions.map(trans => (
                              <SelectItem key={trans} value={trans}>{trans}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {/* Fuel Type */}
                    <div>
                      <Label className="text-white">Тип топлива</Label>
                      {categories && (
                        <Select value={formData.fuel_type} onValueChange={(value) => handleInputChange('fuel_type', value)}>
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue placeholder="Выберите тип топлива" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.fuel_types.map(fuel => (
                              <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {/* Body Type */}
                    <div>
                      <Label className="text-white">Тип кузова</Label>
                      {categories && (
                        <Select value={formData.body_type} onValueChange={(value) => handleInputChange('body_type', value)}>
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue placeholder="Выберите тип кузова" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.body_types.map(body => (
                              <SelectItem key={body} value={body}>{body}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {/* Color */}
                    <div>
                      <Label className="text-white">Цвет</Label>
                      <Input
                        value={formData.color}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                        placeholder="Черный"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <Label className="text-white">Местоположение</Label>
                      <Input
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="Москва"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description and Features */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Описание и комплектация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Description */}
                  <div>
                    <Label className="text-white">Описание</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Подробное описание автомобиля..."
                      rows={4}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  {/* Features */}
                  <div>
                    <Label className="text-white">Комплектация</Label>
                    <div className="flex gap-2 mb-4">
                      <Input
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder="Добавить опцию..."
                        className="bg-gray-800 border-gray-700 text-white"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                      />
                      <Button type="button" onClick={handleAddFeature}>
                        Добавить
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="bg-gray-700 text-white">
                          {feature}
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(index)}
                            className="ml-2 hover:text-red-400"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Images */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Фотографии</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">
                        Загрузите фотографии автомобиля
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload">
                        <Button type="button" variant="outline" className="border-gray-600 text-gray-300">
                          Выбрать фото
                        </Button>
                      </label>
                    </div>

                    {images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {images.map((image) => (
                          <div key={image.id} className="relative">
                            <img
                              src={image.url}
                              alt="Preview"
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(image.id)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Options */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Настройки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                      className="form-checkbox"
                    />
                    <span className="text-gray-300">Премиум размещение</span>
                  </label>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 h-12"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Сохранение...' : 'Опубликовать'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 h-12"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Предпросмотр
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};