import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ValidatedInput, useFormValidation, validationRules } from '../ui/form-validation';

export const LoginModal = ({ open, onOpenChange }) => {
  const { login, register, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form validation
  const loginValidation = useFormValidation(
    { email: '', password: '' },
    {
      email: [validationRules.required, validationRules.email],
      password: [validationRules.required]
    }
  );

  // Register form validation
  const registerValidation = useFormValidation(
    {
      email: '',
      password: '',
      confirmPassword: '',
      first_name: '',
      last_name: '',
      phone: '',
      role: 'buyer'
    },
    {
      email: [validationRules.required, validationRules.email],
      password: [validationRules.required, validationRules.minLength(6)],
      confirmPassword: [validationRules.required],
      first_name: [validationRules.required, validationRules.minLength(2)],
      last_name: [validationRules.required, validationRules.minLength(2)],
      phone: [validationRules.phone]
    }
  );

  // Update confirmPassword validation based on password
  React.useEffect(() => {
    if (registerValidation.values.password) {
      const error = validationRules.confirmPassword(registerValidation.values.password)(
        registerValidation.values.confirmPassword
      );
      if (error && registerValidation.touched.confirmPassword) {
        registerValidation.setFieldTouched('confirmPassword');
      }
    }
  }, [registerValidation.values.password, registerValidation.values.confirmPassword]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!loginValidation.validateAll()) {
      setError('Пожалуйста, исправьте ошибки в форме');
      return;
    }
    
    try {
      await login(loginValidation.values);
      setSuccess('Вход выполнен успешно!');
      setTimeout(() => {
        onOpenChange(false);
        setSuccess('');
        resetForms();
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.message || 
                          'Неверный email или пароль';
      setError(errorMessage);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validate confirm password
    const confirmPasswordError = validationRules.confirmPassword(
      registerValidation.values.password
    )(registerValidation.values.confirmPassword);
    
    if (confirmPasswordError) {
      setError(confirmPasswordError);
      return;
    }

    if (!registerValidation.validateAll()) {
      setError('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    try {
      const { confirmPassword, ...userData } = registerValidation.values;
      await register(userData);
      setSuccess('Регистрация прошла успешно!');
      setTimeout(() => {
        onOpenChange(false);
        setSuccess('');
        resetForms();
      }, 1000);
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.message || 
                          'Ошибка регистрации. Проверьте данные';
      setError(errorMessage);
    }
  };

  const resetForms = () => {
    loginValidation.reset();
    registerValidation.reset();
  };

  const handleClose = () => {
    setError('');
    setSuccess('');
    resetForms();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px] bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white text-center text-2xl font-bold">
            Добро пожаловать в VELES DRIVE
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-center">
            Войдите или создайте новый аккаунт
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="login" className="text-white data-[state=active]:bg-amber-600">
              Вход
            </TabsTrigger>
            <TabsTrigger value="register" className="text-white data-[state=active]:bg-amber-600">
              Регистрация
            </TabsTrigger>
          </TabsList>

          {(error || success) && (
            <Alert className={`mt-4 ${success ? 'border-green-600 bg-green-600/10' : 'border-red-600 bg-red-600/10'}`}>
              <AlertDescription className={success ? 'text-green-400' : 'text-red-400'}>
                {error || success}
              </AlertDescription>
            </Alert>
          )}

          {/* Login Tab */}
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Введите ваш email"
                    value={loginValidation.values.email}
                    onChange={(e) => loginValidation.setValue('email', e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-white">Пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Введите пароль"
                    value={loginValidation.values.password}
                    onChange={(e) => loginValidation.setValue('password', e.target.value)}
                    className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Вход...' : 'Войти'}
              </Button>
            </form>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name" className="text-white">Имя</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="first-name"
                      placeholder="Имя"
                      value={registerValidation.values.first_name}
                      onChange={(e) => registerValidation.setValue('first_name', e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name" className="text-white">Фамилия</Label>
                  <Input
                    id="last-name"
                    placeholder="Фамилия"
                    value={registerValidation.values.last_name}
                    onChange={(e) => registerValidation.setValue('last_name', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Введите ваш email"
                    value={registerValidation.values.email}
                    onChange={(e) => registerValidation.setValue('email', e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Телефон</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+7 (999) 123-45-67"
                    value={registerValidation.values.phone}
                    onChange={(e) => registerValidation.setFieldValue('phone', e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-white">Пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Минимум 6 символов"
                    value={registerValidation.values.password}
                    onChange={(e) => registerValidation.setFieldValue('password', e.target.value)}
                    className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-white">Подтверждение пароля</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Повторите пароль"
                  value={registerValidation.values.confirmPassword}
                  onChange={(e) => registerValidation.setFieldValue('confirmPassword', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Тип аккаунта</Label>
                <select
                  value={registerValidation.values.role}
                  onChange={(e) => registerValidation.setFieldValue('role', e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white"
                >
                  <option value="buyer">Покупатель</option>
                  <option value="dealer">Дилер</option>
                </select>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Создание аккаунта...' : 'Создать аккаунт'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};