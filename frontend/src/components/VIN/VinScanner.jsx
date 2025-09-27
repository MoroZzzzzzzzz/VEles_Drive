import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Search, FileText, AlertTriangle, CheckCircle, 
  X, Scan, History, Shield, Car
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

export const VinScanner = ({ isOpen, onClose, onVinDecoded }) => {
  const [activeTab, setActiveTab] = useState('scan');
  const [vinNumber, setVinNumber] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [vinHistory, setVinHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'scan' && isOpen) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [activeTab, isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const captureVin = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsScanning(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Simulate VIN detection
    setTimeout(() => {
      const mockVin = generateMockVin();
      setVinNumber(mockVin);
      setIsScanning(false);
      checkVinHistory(mockVin);
    }, 2000);
  };

  const generateMockVin = () => {
    const chars = '1234567890ABCDEFGHJKLMNPRSTUVWXYZ';
    let vin = '';
    for (let i = 0; i < 17; i++) {
      vin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return vin;
  };

  const checkVinHistory = async (vin) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockHistory = generateMockVinHistory(vin);
      setVinHistory(mockHistory);
      setLoading(false);
      onVinDecoded?.(vin, mockHistory);
    }, 1500);
  };

  const generateMockVinHistory = (vin) => {
    const makes = ['BMW', 'Mercedes-Benz', 'Audi', 'Toyota', 'Honda'];
    const models = ['X5', 'C-Class', 'A4', 'Camry', 'Accord'];
    
    return {
      vin: vin,
      basic: {
        make: makes[Math.floor(Math.random() * makes.length)],
        model: models[Math.floor(Math.random() * models.length)],
        year: Math.floor(Math.random() * 10) + 2015,
        engine: '2.0L Turbo',
        transmission: 'Автоматическая',
        country: 'Германия',
        assembly: 'BMW Group Plant'
      },
      history: {
        accidents: Math.floor(Math.random() * 3),
        owners: Math.floor(Math.random() * 3) + 1,
        mileageRecords: [
          { date: '2024-01', mileage: 45000 },
          { date: '2023-06', mileage: 32000 },
          { date: '2023-01', mileage: 18000 }
        ],
        serviceHistory: Math.random() > 0.5,
        recalls: Math.floor(Math.random() * 2),
        theft: false,
        flood: false
      },
      verification: {
        authentic: true,
        checkDate: new Date().toISOString(),
        sources: ['ГИБДД', 'Автокод', 'Carfax'],
        confidence: Math.floor(Math.random() * 20) + 80
      }
    };
  };

  const handleManualVin = () => {
    if (vinNumber.length === 17) {
      checkVinHistory(vinNumber);
    }
  };

  const VinResult = () => {
    if (!vinHistory) return null;

    return (
      <div className="space-y-6">
        {/* VIN Basic Info */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Car className="h-5 w-5 mr-2" />
              Информация об автомобиле
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">VIN-номер</p>
                <p className="text-white font-mono">{vinHistory.vin}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Достоверность</p>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-400">{vinHistory.verification.confidence}%</span>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Марка и модель</p>
                <p className="text-white">{vinHistory.basic.make} {vinHistory.basic.model}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Год выпуска</p>
                <p className="text-white">{vinHistory.basic.year}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Двигатель</p>
                <p className="text-white">{vinHistory.basic.engine}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Коробка передач</p>
                <p className="text-white">{vinHistory.basic.transmission}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History Summary */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <History className="h-5 w-5 mr-2" />
              История автомобиля
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">ДТП</span>
                <Badge className={vinHistory.history.accidents === 0 ? 'bg-green-600' : 'bg-red-600'}>
                  {vinHistory.history.accidents === 0 ? 'Не было' : vinHistory.history.accidents}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Владельцы</span>
                <Badge className={vinHistory.history.owners <= 2 ? 'bg-green-600' : 'bg-yellow-600'}>
                  {vinHistory.history.owners}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Сервисная история</span>
                <Badge className={vinHistory.history.serviceHistory ? 'bg-green-600' : 'bg-gray-600'}>
                  {vinHistory.history.serviceHistory ? 'Есть' : 'Нет данных'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Отзывные кампании</span>
                <Badge className={vinHistory.history.recalls === 0 ? 'bg-green-600' : 'bg-yellow-600'}>
                  {vinHistory.history.recalls === 0 ? 'Нет' : vinHistory.history.recalls}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Угон</span>
                <Badge className={!vinHistory.history.theft ? 'bg-green-600' : 'bg-red-600'}>
                  {vinHistory.history.theft ? 'Был в угоне' : 'Чист'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Затопление</span>
                <Badge className={!vinHistory.history.flood ? 'bg-green-600' : 'bg-red-600'}>
                  {vinHistory.history.flood ? 'Был затоплен' : 'Чист'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mileage History */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">История пробега</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {vinHistory.history.mileageRecords.map((record, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-400">{record.date}</span>
                  <span className="text-white">{record.mileage.toLocaleString('ru-RU')} км</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Sources */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Источники данных
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {vinHistory.verification.sources.map((source, index) => (
                <Badge key={index} className="bg-blue-600 text-white">
                  {source}
                </Badge>
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Данные проверены {new Date(vinHistory.verification.checkDate).toLocaleDateString('ru-RU')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Scan className="h-5 w-5 mr-2" />
            VIN-сканер
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex space-x-2">
            <Button
              variant={activeTab === 'scan' ? 'default' : 'outline'}
              onClick={() => setActiveTab('scan')}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              Сканировать
            </Button>
            <Button
              variant={activeTab === 'manual' ? 'default' : 'outline'}
              onClick={() => setActiveTab('manual')}
              className="flex-1"
            >
              <FileText className="h-4 w-4 mr-2" />
              Ввести VIN
            </Button>
          </div>

          {/* Scanner Tab */}
          {activeTab === 'scan' && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Scanning Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-amber-500 w-64 h-16 rounded-lg relative">
                    {isScanning && (
                      <div className="absolute inset-0 bg-amber-500/20 animate-pulse rounded-lg" />
                    )}
                  </div>
                </div>

                {/* Instructions */}
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-white text-sm bg-black/70 rounded px-3 py-1">
                    {isScanning ? 'Сканирование VIN...' : 'Наведите камеру на VIN-номер'}
                  </p>
                </div>
              </div>

              <Button
                onClick={captureVin}
                disabled={isScanning}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
              >
                {isScanning ? (
                  <>
                    <Scan className="h-4 w-4 mr-2 animate-spin" />
                    Сканирование...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Сканировать VIN
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Manual Tab */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">VIN-номер (17 символов)</label>
                <Input
                  value={vinNumber}
                  onChange={(e) => setVinNumber(e.target.value.toUpperCase())}
                  placeholder="Введите VIN-номер"
                  maxLength={17}
                  className="bg-gray-800 border-gray-700 text-white font-mono"
                />
                <p className="text-gray-400 text-sm mt-1">
                  {vinNumber.length}/17 символов
                </p>
              </div>

              <Button
                onClick={handleManualVin}
                disabled={vinNumber.length !== 17 || loading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
              >
                {loading ? (
                  <>
                    <Search className="h-4 w-4 mr-2 animate-spin" />
                    Проверка...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Проверить VIN
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Results */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Проверяем историю автомобиля...</p>
            </div>
          )}

          {vinHistory && !loading && <VinResult />}
        </div>
      </DialogContent>
    </Dialog>
  );
};