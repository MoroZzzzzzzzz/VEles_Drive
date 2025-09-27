import React, { useState, useEffect } from 'react';
import { 
  Car, Calculator, TrendingUp, AlertCircle, CheckCircle, 
  Camera, FileText, Star, MapPin, Calendar, Gauge,
  Upload, X, Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { formatPrice } from '../mock';

export const TradeInEvaluator = ({ onEvaluationComplete }) => {
  const [step, setStep] = useState(1);
  const [vehicleData, setVehicleData] = useState({
    make: '',
    model: '',
    year: '',
    mileage: '',
    condition: '',
    color: '',
    engineSize: '',
    fuelType: '',
    transmission: '',
    bodyType: '',
    features: [],
    accidents: false,
    serviceHistory: false,
    ownerCount: 1,
    location: '',
    description: ''
  });
  
  const [images, setImages] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);

  const carMakes = [
    'Toyota', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 
    'Hyundai', 'Kia', 'Nissan', 'Honda', 'Mazda',
    'LADA', 'UAZ', 'Škoda', 'Ford', 'Chevrolet'
  ];

  const conditions = [
    { value: 'excellent', label: 'Отличное', multiplier: 1.0 },
    { value: 'good', label: 'Хорошее', multiplier: 0.9 },
    { value: 'fair', label: 'Удовлетворительное', multiplier: 0.8 },
    { value: 'poor', label: 'Требует ремонта', multiplier: 0.6 }
  ];

  const features = [
    'Кондиционер', 'Подогрев сидений', 'Навигация', 'Камера заднего вида',
    'Парктроники', 'Кожаный салон', 'Люк', 'Ксенон/LED',
    'Круиз-контроль', 'Сигнализация', 'Тонировка', 'Литые диски'
  ];

  const handleFeatureChange = (feature, checked) => {
    setVehicleData(prev => ({
      ...prev,
      features: checked 
        ? [...prev.features, feature]
        : prev.features.filter(f => f !== feature)
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, { file, url: e.target.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const calculateEstimate = async () => {
    setLoading(true);
    
    // Mock evaluation calculation - in real app would use ML/AI service
    const basePrice = getMarketPrice(vehicleData.make, vehicleData.model, vehicleData.year);
    const condition = conditions.find(c => c.value === vehicleData.condition);
    const mileageAdjustment = calculateMileageAdjustment(vehicleData.mileage, vehicleData.year);
    const featureBonus = vehicleData.features.length * 25000;
    const accidentPenalty = vehicleData.accidents ? -200000 : 0;
    const serviceBonus = vehicleData.serviceHistory ? 50000 : 0;
    const ownerPenalty = (vehicleData.ownerCount - 1) * -30000;

    const estimatedValue = Math.max(0, 
      basePrice * condition.multiplier * mileageAdjustment + 
      featureBonus + accidentPenalty + serviceBonus + ownerPenalty
    );

    const confidence = calculateConfidence();
    
    setTimeout(() => {
      setEvaluation({
        estimatedValue,
        confidence,
        priceRange: {
          min: Math.round(estimatedValue * 0.85),
          max: Math.round(estimatedValue * 1.15)
        },
        factors: {
          basePrice,
          conditionAdjustment: Math.round(basePrice * (condition.multiplier - 1)),
          mileageAdjustment: Math.round(basePrice * (mileageAdjustment - 1)),
          features: featureBonus,
          accidents: accidentPenalty,
          service: serviceBonus,
          owners: ownerPenalty
        },
        marketComparison: generateMarketComparison(),
        recommendations: generateRecommendations()
      });
      setLoading(false);
      onEvaluationComplete?.(estimatedValue);
    }, 3000);
  };

  const getMarketPrice = (make, model, year) => {
    // Mock market price calculation
    const basePrices = {
      'Toyota': 1200000,
      'BMW': 2500000,
      'Mercedes-Benz': 2800000,
      'Audi': 2300000,
      'LADA': 600000
    };
    
    const basePrice = basePrices[make] || 1000000;
    const ageDepreciation = Math.pow(0.85, new Date().getFullYear() - year);
    return Math.round(basePrice * ageDepreciation);
  };

  const calculateMileageAdjustment = (mileage, year) => {
    const avgMileagePerYear = 15000;
    const expectedMileage = (new Date().getFullYear() - year) * avgMileagePerYear;
    const mileageDiff = mileage - expectedMileage;
    
    if (mileageDiff > 50000) return 0.8;
    if (mileageDiff > 20000) return 0.9;
    if (mileageDiff < -20000) return 1.1;
    if (mileageDiff < -50000) return 1.2;
    return 1.0;
  };

  const calculateConfidence = () => {
    let confidence = 70;
    if (images.length >= 6) confidence += 10;
    if (vehicleData.serviceHistory) confidence += 5;
    if (!vehicleData.accidents) confidence += 5;
    if (vehicleData.description.length > 100) confidence += 5;
    return Math.min(confidence, 95);
  };

  const generateMarketComparison = () => [
    { source: 'auto.ru', avgPrice: 1850000, listings: 15 },
    { source: 'avito.ru', avgPrice: 1920000, listings: 8 },
    { source: 'drom.ru', avgPrice: 1780000, listings: 12 }
  ];

  const generateRecommendations = () => [
    'Предоставьте сервисную книжку для увеличения стоимости',
    'Добавьте больше качественных фотографий',
    'Проведите предпродажную подготовку',
    'Рассмотрите возможность мелкого ремонта для повышения цены'
  ];

  const VehicleInfoStep = () => (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Car className="h-5 w-5 mr-2" />
          Информация об автомобиле
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Марка</Label>
            <Select value={vehicleData.make} onValueChange={(value) => 
              setVehicleData(prev => ({ ...prev, make: value }))
            }>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Выберите марку" />
              </SelectTrigger>
              <SelectContent>
                {carMakes.map(make => (
                  <SelectItem key={make} value={make}>{make}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Модель</Label>
            <Input
              value={vehicleData.model}
              onChange={(e) => setVehicleData(prev => ({ ...prev, model: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Например: Camry"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Год выпуска</Label>
            <Input
              type="number"
              min="1990"
              max="2025"
              value={vehicleData.year}
              onChange={(e) => setVehicleData(prev => ({ ...prev, year: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Пробег (км)</Label>
            <Input
              type="number"
              value={vehicleData.mileage}
              onChange={(e) => setVehicleData(prev => ({ ...prev, mileage: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="150000"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Состояние</Label>
            <Select value={vehicleData.condition} onValueChange={(value) => 
              setVehicleData(prev => ({ ...prev, condition: value }))
            }>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Оцените состояние" />
              </SelectTrigger>
              <SelectContent>
                {conditions.map(condition => (
                  <SelectItem key={condition.value} value={condition.value}>
                    {condition.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Количество владельцев</Label>
            <Select value={vehicleData.ownerCount.toString()} onValueChange={(value) => 
              setVehicleData(prev => ({ ...prev, ownerCount: parseInt(value) }))
            }>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 владелец</SelectItem>
                <SelectItem value="2">2 владельца</SelectItem>
                <SelectItem value="3">3 владельца</SelectItem>
                <SelectItem value="4">4+ владельцев</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-gray-300">Дополнительные факторы</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="accidents"
                checked={vehicleData.accidents}
                onCheckedChange={(checked) => setVehicleData(prev => ({ ...prev, accidents: checked }))}
              />
              <Label htmlFor="accidents" className="text-gray-300">
                Были ДТП или серьёзные повреждения
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="service"
                checked={vehicleData.serviceHistory}
                onCheckedChange={(checked) => setVehicleData(prev => ({ ...prev, serviceHistory: checked }))}
              />
              <Label htmlFor="service" className="text-gray-300">
                Есть полная сервисная история
              </Label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">Дополнительное оборудование</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {features.map(feature => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox 
                  id={feature}
                  checked={vehicleData.features.includes(feature)}
                  onCheckedChange={(checked) => handleFeatureChange(feature, checked)}
                />
                <Label htmlFor={feature} className="text-gray-300 text-sm">
                  {feature}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PhotosStep = () => (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Camera className="h-5 w-5 mr-2" />
          Фотографии автомобиля
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-700/50 border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="photo-upload"
          />
          <Label htmlFor="photo-upload" className="cursor-pointer">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300">Нажмите для загрузки фотографий</p>
            <p className="text-gray-500 text-sm">Рекомендуется 6-10 фото высокого качества</p>
          </Label>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img 
                  src={image.url} 
                  alt={`Фото ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="bg-blue-600/20 border border-blue-600/50 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-100">
              <p className="font-medium mb-1">Советы по фотографиям:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-200">
                <li>Сфотографируйте со всех сторон</li>
                <li>Включите фото салона и багажника</li>
                <li>Покажите документы и VIN-номер</li>
                <li>Снимайте при хорошем освещении</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EvaluationResult = () => (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Calculator className="h-5 w-5 mr-2" />
          Оценка стоимости
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Анализируем данные автомобиля...</p>
            <p className="text-gray-500 text-sm">Сравниваем с рыночными предложениями</p>
          </div>
        ) : evaluation && (
          <>
            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl p-6 border border-green-600/30">
              <div className="text-center">
                <p className="text-gray-300 text-sm mb-1">Оценочная стоимость</p>
                <p className="text-4xl font-bold text-white mb-2">
                  {formatPrice(evaluation.estimatedValue)}
                </p>
                <div className="flex justify-center items-center space-x-4 text-sm">
                  <span className="text-gray-400">
                    От {formatPrice(evaluation.priceRange.min)} до {formatPrice(evaluation.priceRange.max)}
                  </span>
                  <Badge className="bg-green-600 text-white">
                    Точность {evaluation.confidence}%
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-700/50 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Факторы оценки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(evaluation.factors).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                      <span className={`font-semibold ${value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {value >= 0 ? '+' : ''}{formatPrice(value)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-gray-700/50 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Рыночное сравнение</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {evaluation.marketComparison.map((comp, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-300">{comp.source}</span>
                      <div className="text-right">
                        <div className="text-white font-semibold">{formatPrice(comp.avgPrice)}</div>
                        <div className="text-gray-500 text-xs">{comp.listings} объявлений</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-700/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white text-lg">Рекомендации</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {evaluation.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </CardContent>
    </Card>
  );

  const isStepValid = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return vehicleData.make && vehicleData.model && vehicleData.year && vehicleData.condition;
      case 2:
        return true; // Photos are optional
      default:
        return true;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${step >= stepNumber ? 'bg-amber-500 text-white' : 'bg-gray-600 text-gray-300'}
                ${step === stepNumber ? 'ring-2 ring-amber-300' : ''}
              `}>
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-16 h-0.5 ${step > stepNumber ? 'bg-amber-500' : 'bg-gray-600'}`} />
              )}
            </div>
          ))}
        </div>
        
        <div className="text-sm text-gray-400">
          Шаг {step} из 3
        </div>
      </div>

      {/* Step Content */}
      {step === 1 && <VehicleInfoStep />}
      {step === 2 && <PhotosStep />}
      {step === 3 && <EvaluationResult />}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className="border-gray-600 text-gray-300"
        >
          Назад
        </Button>

        {step < 3 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!isStepValid(step)}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          >
            Далее
          </Button>
        ) : step === 3 && !evaluation && !loading && (
          <Button
            onClick={calculateEstimate}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          >
            Получить оценку
          </Button>
        )}
      </div>
    </div>
  );
};