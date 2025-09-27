# 🚗 VELES DRIVE - Docker Deployment Guide

Полное руководство по развертыванию VELES DRIVE на любом VPS с Docker.

## 📋 Требования

- **Docker**: версия 20.10 или выше
- **Docker Compose**: версия 2.0 или выше
- **VPS**: минимум 2GB RAM, 20GB диска
- **Операционная система**: Linux (Ubuntu/Debian/CentOS)

## 🚀 Быстрый запуск

### Для разработки (с hot reload):
```bash
# Клонируйте проект
git clone <your-repo-url> veles-drive
cd veles-drive

# Запустите development окружение
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh
```

### Для production:
```bash
# Клонируйте проект
git clone <your-repo-url> veles-drive
cd veles-drive

# Запустите production окружение
chmod +x scripts/start-prod.sh
./scripts/start-prod.sh
```

## 🔧 Конфигурация

### Environment переменные

Отредактируйте файл `docker-compose.yml` для production настроек:

```yaml
environment:
  - MONGO_URL=mongodb://admin:password123@mongodb:27017/velesdrive?authSource=admin
  - JWT_SECRET=ваш-секретный-ключ-для-production
  - STRIPE_API_KEY=ваш-stripe-api-ключ
  - SENDGRID_API_KEY=ваш-sendgrid-api-ключ
  - FROM_EMAIL=noreply@yourdomain.com
```

### Изменение паролей MongoDB

В файле `docker-compose.yml` измените:
```yaml
environment:
  MONGO_INITDB_ROOT_USERNAME: your_username
  MONGO_INITDB_ROOT_PASSWORD: your_secure_password
```

## 📱 Доступ к приложению

После запуска приложение будет доступно:

### Development режим:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **MongoDB**: localhost:27017

### Production режим:
- **Приложение**: http://localhost:8001
- **MongoDB**: localhost:27017

## 🔄 Управление сервисами

### Просмотр логов:
```bash
# Development
docker-compose -f docker-compose.dev.yml logs -f

# Production
docker-compose logs -f
```

### Перезапуск сервисов:
```bash
# Development
docker-compose -f docker-compose.dev.yml restart

# Production
docker-compose restart
```

### Остановка сервисов:
```bash
# Development
docker-compose -f docker-compose.dev.yml down

# Production
docker-compose down
```

## 💾 Резервное копирование

### Создание резервной копии:
```bash
chmod +x scripts/backup.sh
./scripts/backup.sh
```

### Восстановление из резервной копии:
```bash
chmod +x scripts/restore.sh
./scripts/restore.sh /path/to/backup.tar.gz
```

## 🔒 Безопасность

### Для production обязательно:

1. **Измените пароли MongoDB**
2. **Установите сильный JWT_SECRET**
3. **Настройте SSL/HTTPS** (рекомендуется Nginx reverse proxy)
4. **Настройте firewall** (откройте только нужные порты)

### Пример Nginx конфигурации:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🐛 Отладка

### Проверка статуса контейнеров:
```bash
docker-compose ps
```

### Просмотр логов конкретного сервиса:
```bash
docker-compose logs -f app
docker-compose logs -f mongodb
```

### Подключение к MongoDB:
```bash
docker exec -it veles_mongodb mongo -u admin -p password123 --authenticationDatabase admin
```

### Вход в контейнер приложения:
```bash
docker exec -it veles_app bash
```

## 📊 Мониторинг

Для production рекомендуется настроить мониторинг:

- **Логи**: централизованное логирование (ELK stack)
- **Метрики**: Prometheus + Grafana
- **Уведомления**: настроить алерты для критических событий

## 🔄 Обновления

### Обновление production:
```bash
# Получить обновления
git pull origin main

# Пересобрать и перезапустить
docker-compose up --build -d

# Проверить статус
docker-compose ps
```

## ❓ Поддержка

При возникновении проблем:

1. Проверьте логи: `docker-compose logs -f`
2. Убедитесь что все контейнеры запущены: `docker-compose ps`
3. Проверьте доступность портов: `netstat -tlnp | grep :8001`

## 📝 Полезные команды

```bash
# Очистка Docker системы
docker system prune -f

# Полная очистка (включая volumes)
docker system prune -a --volumes

# Просмотр использования диска Docker
docker system df

# Обновление images
docker-compose pull
```