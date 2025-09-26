import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Edit2, Save, X, Settings, Heart, Eye, Car } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || ''
  });

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      location: user?.location || ''
    });
    setIsEditing(false);
  };

  const getUserTypeLabel = (role) => {
    switch (role) {
      case 'buyer': return 'Покупатель';
      case 'dealer': return 'Дилер';
      case 'admin': return 'Администратор';
      default: return 'Пользователь';
    }
  };

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 lg:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Личный <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">кабинет</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Управляйте своим профилем и настройками
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-white" />
                </div>
                <CardTitle className="text-white text-2xl">
                  {user?.first_name} {user?.last_name}
                </CardTitle>
                <div className="text-gray-400 capitalize">
                  {getUserTypeLabel(user?.role)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-gray-300">
                  <Mail className="h-4 w-4 mr-3 text-gray-500" />
                  <span>{user?.email}</span>
                </div>
                
                {user?.phone && (
                  <div className="flex items-center text-gray-300">
                    <Phone className="h-4 w-4 mr-3 text-gray-500" />
                    <span>{user.phone}</span>
                  </div>
                )}

                <div className="flex items-center text-gray-300">
                  <Settings className="h-4 w-4 mr-3 text-gray-500" />
                  <span>Аккаунт активен</span>
                </div>

                <div className="pt-4 space-y-3">
                  <Link to="/favorites" className="w-full">
                    <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                      <Heart className="h-4 w-4 mr-2" />
                      Избранное
                    </Button>
                  </Link>
                  
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                    <Eye className="h-4 w-4 mr-2" />
                    История просмотров
                  </Button>

                  {user?.role === 'dealer' && (
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                      <Car className="h-4 w-4 mr-2" />
                      Панель дилера
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-900 mb-8">
                <TabsTrigger value="profile" className="text-white data-[state=active]:bg-amber-600">
                  Профиль
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-white data-[state=active]:bg-amber-600">
                  Настройки
                </TabsTrigger>
                <TabsTrigger value="activity" className="text-white data-[state=active]:bg-amber-600">
                  Активность
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">Информация о профиле</CardTitle>
                    <Button
                      onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                      className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                    >
                      {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit2 className="h-4 w-4 mr-2" />}
                      {isEditing ? 'Сохранить' : 'Редактировать'}
                    </Button>
                    {isEditing && (
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="border-gray-600 text-gray-300"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Отменить
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="first_name" className="text-white">Имя</Label>
                        <Input
                          id="first_name"
                          value={formData.first_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                          disabled={!isEditing}
                          className="bg-gray-800 border-gray-700 text-white disabled:opacity-70"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="last_name" className="text-white">Фамилия</Label>
                        <Input
                          id="last_name"
                          value={formData.last_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                          disabled={!isEditing}
                          className="bg-gray-800 border-gray-700 text-white disabled:opacity-70"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-white">Телефон</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="+7 (999) 123-45-67"
                        className="bg-gray-800 border-gray-700 text-white disabled:opacity-70"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location" className="text-white">Местоположение</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="Город"
                        className="bg-gray-800 border-gray-700 text-white disabled:opacity-70"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio" className="text-white">О себе</Label>
                      <textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="Расскажите о себе..."
                        rows={4}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder:text-gray-400 disabled:opacity-70"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Настройки аккаунта</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-white font-medium mb-4">Уведомления</h3>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3">
                          <input type="checkbox" defaultChecked className="form-checkbox" />
                          <span className="text-gray-300">Email уведомления о новых автомобилях</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input type="checkbox" defaultChecked className="form-checkbox" />
                          <span className="text-gray-300">SMS уведомления</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input type="checkbox" className="form-checkbox" />
                          <span className="text-gray-300">Push уведомления</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-white font-medium mb-4">Безопасность</h3>
                      <div className="space-y-3">
                        <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                          Изменить пароль
                        </Button>
                        <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                          Настройки двухфакторной аутентификации
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Активность</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="text-gray-400">
                        История активности будет отображаться здесь
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};