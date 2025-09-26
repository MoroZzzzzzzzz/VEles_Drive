# VELES DRIVE - API Контракты и План разработки

## 🎯 Фазы разработки

### Фаза 1: Основная система (MVP+)
- ✅ Frontend с главной страницей (готово)
- 🔄 Backend API для автомобилей, дилеров, пользователей
- 🔄 Система аутентификации и авторизации 
- 🔄 Каталог автомобилей с фильтрами и поиском
- 🔄 Управление профилями дилеров

### Фаза 2: Расширенная функциональность
- 📋 Детальные страницы автомобилей
- 📋 Система избранного и сравнения
- 📋 Отзывы и рейтинги
- 📋 Базовая ERP для дилеров

### Фаза 3: ERP система и дополнительные сервисы
- 📋 Полная ERP система (склад, продажи, финансы)
- 📋 Система проектов (Trello-подобная)
- 📋 Аукционы, лизинг, страхование

### Фаза 4: Интеграции и мобильные решения
- 📋 Telegram бот
- 📋 Платежные системы
- 📋 Email уведомления
- 📋 Карты и геолокация

## 🗃️ Модели данных

### Пользователи и роли
```python
# User model
- id, email, phone, first_name, last_name
- role: buyer/dealer/admin
- is_active, created_at, updated_at

# UserProfile model  
- user_id, avatar, bio, location
- preferences, notifications_settings

# DealerProfile model
- user_id, company_name, description
- address, working_hours, website
- verification_status, rating
```

### Транспортные средства
```python
# Vehicle model (универсальная модель)
- id, dealer_id, category (car/motorcycle/boat/helicopter/plane)
- make, model, year, price, currency
- condition (new/used), mileage, color
- engine, transmission, fuel_type, power
- body_type, drive_type
- images[], description, features[]
- location, is_available, is_featured
- views_count, favorites_count
- created_at, updated_at

# VehicleImages model
- vehicle_id, image_url, is_primary, order

# VehicleCategory model
- id, name, slug, parent_id (для иерархии)
```

### Компании и дилеры
```python
# Dealer model
- id, user_id, company_name, legal_name
- description, specialization
- address, city, region, country
- phone, email, website
- working_hours, established_year
- verification_status, rating, reviews_count
- logo, gallery_images[]

# DealerReview model
- id, dealer_id, user_id, rating (1-5)
- title, comment, pros[], cons[]
- is_verified, created_at
```

### Избранное и сравнение
```python
# Favorite model
- user_id, vehicle_id, created_at

# Comparison model  
- user_id, vehicle_ids[], created_at

# ViewHistory model
- user_id, vehicle_id, viewed_at
```

### ERP система
```python
# Inventory model (склад)
- dealer_id, vehicle_id, quantity
- location, status, cost_price
- notes, updated_at

# Deal model (сделки)
- id, dealer_id, vehicle_id, customer_id
- status (lead/negotiation/closed/cancelled)
- price, commission, profit
- stages[], notes, documents[]
- created_at, updated_at

# Customer model (клиенты дилера)
- id, dealer_id, first_name, last_name
- phone, email, source, preferences
- purchase_history[], notes
```

## 🔌 API Endpoints

### Аутентификация
```
POST /api/auth/register - Регистрация
POST /api/auth/login - Вход
POST /api/auth/logout - Выход  
POST /api/auth/refresh - Обновление токена
GET /api/auth/profile - Профиль пользователя
```

### Автомобили
```
GET /api/vehicles - Список автомобилей с фильтрами
GET /api/vehicles/{id} - Детали автомобиля
POST /api/vehicles - Создать автомобиль (дилер)
PUT /api/vehicles/{id} - Обновить автомобиль
DELETE /api/vehicles/{id} - Удалить автомобиль
GET /api/vehicles/search - Поиск автомобилей
GET /api/vehicles/categories - Категории транспорта
```

### Дилеры
```
GET /api/dealers - Список дилеров
GET /api/dealers/{id} - Профиль дилера  
PUT /api/dealers/{id} - Обновить профиль дилера
GET /api/dealers/{id}/vehicles - Автомобили дилера
GET /api/dealers/{id}/reviews - Отзывы о дилере
POST /api/dealers/{id}/reviews - Добавить отзыв
```

### Избранное
```
GET /api/favorites - Список избранного
POST /api/favorites - Добавить в избранное
DELETE /api/favorites/{vehicle_id} - Удалить из избранного
```

### ERP (для дилеров)
```
GET /api/erp/dashboard - Дашборд статистики
GET /api/erp/inventory - Управление складом
GET /api/erp/deals - Управление сделками
POST /api/erp/deals - Создать сделку
GET /api/erp/customers - База клиентов
GET /api/erp/reports - Отчеты
```

## 🔧 Технический стек

### Backend
- FastAPI (вместо Django для лучшей производительности)
- MongoDB (существующая база)
- JWT аутентификация
- Pydantic модели
- Async/await

### Интеграция Frontend-Backend
- Axios для HTTP запросов  
- React Context для управления состоянием
- React Router для навигации
- Формы с валидацией

## 📋 Текущие Mock данные для замены

### В mock.js нужно заменить:
- `mockCars` → API GET /api/vehicles
- `mockDealers` → API GET /api/dealers  
- `carMakes, bodyTypes` → API GET /api/vehicles/categories
- Поиск автомобилей → API GET /api/vehicles/search
- Добавление в избранное → API POST /api/favorites

## 🚀 План первой итерации

1. **Backend API (Фаза 1)**
   - Модели User, Vehicle, Dealer
   - Аутентификация JWT
   - CRUD операции для автомобилей
   - Система поиска и фильтрации

2. **Интеграция Frontend**
   - Подключение к real API
   - Система авторизации
   - Рабочий поиск и каталог

3. **Тестирование**
   - API тесты
   - Frontend тесты
   - Интеграционное тестирование

Начнем с создания backend API?