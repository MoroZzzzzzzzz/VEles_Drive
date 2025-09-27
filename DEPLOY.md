# 🚗 VELES DRIVE - Инструкция по развертыванию на VPS

## 📋 Что было сделано

### ✅ Исправления логотипа
- **Проблема**: Старый логотип содержал лишний оранжевый кружочек с иконкой машины
- **Решение**: Создан новый SVG логотип с современным спорткаром оранжевого цвета
- **Результат**: Чистый, профессиональный логотип без лишних элементов

### ✅ Docker окружение
Создана полная Docker инфраструктура:
- **Dockerfile** - основной образ для production
- **Dockerfile.dev** - образ для разработки с hot reload  
- **docker-compose.yml** - production окружение
- **docker-compose.dev.yml** - development окружение
- **Скрипты управления** - автоматизация запуска/остановки

## 🚀 Быстрое развертывание на VPS

### 1️⃣ Подготовка VPS

```bash
# Обновление системы (Ubuntu/Debian)
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Перезагрузка для применения изменений
sudo reboot
```

### 2️⃣ Клонирование и настройка

```bash
# Клонирование проекта
git clone <ваш-репозиторий> veles-drive
cd veles-drive

# Копирование конфигурации
cp .env.docker .env

# Редактирование настроек (ВАЖНО!)
nano .env
```

### 3️⃣ Настройка переменных окружения

Отредактируйте файл `.env`:

```bash
# Обязательно измените:
JWT_SECRET=ваш-уникальный-секретный-ключ-32-символа
MONGO_INITDB_ROOT_PASSWORD=ваш-сильный-пароль-mongodb

# Для полной функциональности добавьте:
STRIPE_API_KEY=sk_live_ваш-stripe-ключ
SENDGRID_API_KEY=SG.ваш-sendgrid-ключ
FROM_EMAIL=noreply@ваш-домен.ru
```

### 4️⃣ Запуск приложения

```bash
# Сделать скрипты исполняемыми
chmod +x scripts/*.sh

# Запуск production окружения
./scripts/start-prod.sh

# Проверка статуса
docker-compose ps

# Тестирование системы
./scripts/test-docker.sh
```

## 🌐 Настройка домена и SSL

### Nginx Reverse Proxy

```bash
# Установка Nginx
sudo apt install nginx

# Создание конфигурации
sudo nano /etc/nginx/sites-available/veles-drive
```

Конфигурация Nginx:
```nginx
server {
    listen 80;
    server_name ваш-домен.ru www.ваш-домен.ru;

    location / {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Активация конфигурации
sudo ln -s /etc/nginx/sites-available/veles-drive /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL сертификат (Let's Encrypt)

```bash
# Установка Certbot
sudo apt install snapd
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Получение сертификата
sudo certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru
```

## 🔒 Безопасность

### Настройка Firewall

```bash
# Базовая настройка UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Регулярные обновления

```bash
# Создание cron задачи для обновлений
echo "0 2 * * 0 cd /home/user/veles-drive && git pull && docker-compose up --build -d" | sudo crontab -
```

## 💾 Резервное копирование

### Автоматическое резервное копирование

```bash
# Создание директории для бэкапов
mkdir -p /home/backup/veles-drive

# Настройка cron для ежедневных бэкапов
echo "0 3 * * * cd /home/user/veles-drive && ./scripts/backup.sh" | crontab -
```

## 📊 Мониторинг

### Проверка работоспособности

```bash
# Статус контейнеров
docker-compose ps

# Логи приложения
docker-compose logs -f app

# Использование ресурсов
docker stats

# Тест всех сервисов
./scripts/test-docker.sh
```

## ⚡ Производительность

### Рекомендуемые характеристики VPS

- **CPU**: минимум 2 ядра
- **RAM**: минимум 4GB
- **Диск**: минимум 40GB SSD
- **Bandwidth**: неограниченный

### Оптимизация для продакшена

```bash
# В docker-compose.yml добавьте ограничения ресурсов:
deploy:
  resources:
    limits:
      cpus: '1.5'
      memory: 2G
    reservations:
      memory: 1G
```

## 🆘 Решение проблем

### Частые проблемы

1. **Контейнер не запускается**:
   ```bash
   docker-compose logs app
   ```

2. **База данных недоступна**:
   ```bash
   docker exec -it veles_mongodb mongosh --username admin --password password123
   ```

3. **Нехватка места**:
   ```bash
   docker system prune -a
   ```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `docker-compose logs -f`
2. Запустите тест: `./scripts/test-docker.sh`
3. Проверьте статус: `docker-compose ps`

## ✅ Готово!

После выполнения всех шагов ваше приложение VELES DRIVE будет доступно по адресу:
- **HTTP**: http://ваш-домен.ru
- **HTTPS**: https://ваш-домен.ru

🎉 **Поздравляем! Ваш автомобильный маркетплейс готов к работе!**