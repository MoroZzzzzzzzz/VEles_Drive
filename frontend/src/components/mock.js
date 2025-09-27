// Mock данные для VELES DRIVE
export const mockCars = [
  {
    id: 1,
    make: "Bugatti",
    model: "Chiron",
    year: 2024,
    price: 45000000,
    bodyType: "Купе",
    color: "Черный",
    mileage: 0,
    engine: "8.0 W16",
    power: 1500,
    transmission: "Автоматическая",
    images: [
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800&q=80"
    ],
    dealer: "Премиум Авто Москва",
    location: "Москва",
    isNew: true,
    isFeatured: true,
    dealerInfo: {
      name: "Премиум Авто Москва",
      rating: 4.9,
      reviewCount: 127,
      address: "Москва, ул. Автомобильная, 15",
      phone: "+7 (495) 123-45-67",
      email: "info@premiumavto.ru",
      workingHours: "Пн-Пт: 9:00-20:00, Сб-Вс: 10:00-18:00"
    },
    description: "Эксклюзивный гиперкар Bugatti Chiron 2024 года. Двигатель 8.0 W16 мощностью 1500 л.с. Максимальная скорость 420 км/ч. Полный привод, углеволоконный кузов."
  },
  {
    id: 2,
    make: "Lamborghini", 
    model: "Huracán EVO",
    year: 2024,
    price: 28000000,
    bodyType: "Купе",
    color: "Оранжевый",
    mileage: 0,
    engine: "5.2 V10",
    power: 640,
    transmission: "Автоматическая", 
    images: [
      "https://images.unsplash.com/photo-1621135802920-133df287f89c?w=800&q=80",
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80"
    ],
    dealer: "Автодом Люкс",
    location: "Москва",
    isNew: true,
    isFeatured: true,
    dealerInfo: {
      name: "Автодом Люкс",
      rating: 4.8,
      reviewCount: 95,
      address: "Москва, ул. Ленинградская, 78",
      phone: "+7 (495) 234-56-78",
      email: "info@avtodomluks.ru",
      workingHours: "Пн-Пт: 9:00-19:00, Сб-Вс: 10:00-18:00"
    },
    description: "Lamborghini Huracán EVO - идеальный баланс производительности и комфорта. Естественно аспирируемый V10, полный привод, система векторизации крутящего момента."
  },
  {
    id: 3,
    make: "Ferrari",
    model: "SF90 Stradale", 
    year: 2024,
    price: 35000000,
    bodyType: "Купе",
    color: "Красный",
    mileage: 0,
    engine: "4.0 V8 Hybrid",
    power: 1000,
    transmission: "Автоматическая",
    images: [
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80"
    ],
    dealer: "Италия Авто",
    location: "Москва", 
    isNew: true,
    isFeatured: true
  },
  {
    id: 4,
    make: "Porsche",
    model: "911 Turbo S",
    year: 2024,
    price: 15000000,
    bodyType: "Купе",
    color: "Серый",
    mileage: 0,
    engine: "3.8 H6 Turbo",
    power: 650,
    transmission: "Автоматическая",
    images: [
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800&q=80",
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80"
    ],
    dealer: "Порше Центр",
    location: "Москва",
    isNew: true,
    isFeatured: true
  },
  {
    id: 5,
    make: "McLaren",
    model: "720S",
    year: 2023,
    price: 25000000,
    bodyType: "Купе", 
    color: "Синий",
    mileage: 1200,
    engine: "4.0 V8 Twin-Turbo",
    power: 720,
    transmission: "Автоматическая",
    images: [
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80"
    ],
    dealer: "Британские авто",
    location: "Москва",
    isNew: false,
    isFeatured: true
  },
  {
    id: 6,
    make: "Rolls-Royce",
    model: "Phantom",
    year: 2024,
    price: 38000000,
    bodyType: "Седан",
    color: "Белый", 
    mileage: 0,
    engine: "6.75 V12",
    power: 571,
    transmission: "Автоматическая",
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800&q=80"
    ],
    dealer: "Роллс-Ройс Москва",
    location: "Москва",
    isNew: true,
    isFeatured: true
  }
];

export const mockDealers = [
  {
    id: 1,
    name: "Премиум Авто Москва",
    rating: 4.9,
    reviewsCount: 156,
    address: "ул. Тверская, 12, Москва",
    phone: "+7 (495) 123-45-67",
    workingHours: "Пн-Вс: 9:00-21:00",
    image: "https://images.unsplash.com/photo-1562141961-531d80a1a4d3?w=800&q=80",
    specialization: "Суперкары и премиум автомобили",
    carsCount: 45,
    established: 2015
  },
  {
    id: 2,
    name: "Автодом Люкс",
    rating: 4.8,
    reviewsCount: 203,
    address: "Кутузовский пр-т, 36, Москва", 
    phone: "+7 (495) 234-56-78",
    workingHours: "Пн-Сб: 9:00-20:00",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    specialization: "Итальянские спорткары",
    carsCount: 38,
    established: 2010
  },
  {
    id: 3,
    name: "Италия Авто",
    rating: 4.7,
    reviewsCount: 89,
    address: "Ленинградский пр-т, 78, Москва",
    phone: "+7 (495) 345-67-89", 
    workingHours: "Пн-Пт: 10:00-19:00",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    specialization: "Ferrari, Lamborghini, Maserati",
    carsCount: 22,
    established: 2018
  },
  {
    id: 4,
    name: "Роллс-Ройс Москва",
    rating: 4.9,
    reviewsCount: 134,
    address: "Садовое кольцо, 25, Москва",
    phone: "+7 (495) 456-78-90",
    workingHours: "Пн-Вс: 10:00-20:00",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80", 
    specialization: "Rolls-Royce, Bentley",
    carsCount: 18,
    established: 2012
  }
];

export const mockNews = [
  {
    id: 1,
    title: "Ferrari представила новый SF90 XX Stradale",
    excerpt: "Итальянский производитель показал самую мощную версию гибридного суперкара с улучшенной аэродинамикой.",
    image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80",
    date: "2024-12-15",
    category: "Новинки"
  },
  {
    id: 2, 
    title: "Lamborghini объявила о планах электрификации",
    excerpt: "К 2030 году все модели бренда получат гибридные или полностью электрические силовые установки.",
    image: "https://images.unsplash.com/photo-1621135802920-133df287f89c?w=800&q=80",
    date: "2024-12-12",
    category: "Индустрия"
  },
  {
    id: 3,
    title: "Рынок люксовых авто в России показал рост",
    excerpt: "По итогам 2024 года продажи премиум автомобилей выросли на 15% по сравнению с прошлым годом.", 
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
    date: "2024-12-10",
    category: "Аналитика"
  }
];

export const carMakes = [
  "Aston Martin", "Audi", "Bentley", "BMW", "Bugatti", "Ferrari", 
  "Jaguar", "Lamborghini", "Land Rover", "Maserati", "McLaren",
  "Mercedes-Benz", "Porsche", "Rolls-Royce", "Tesla"
];

export const bodyTypes = [
  "Седан", "Купе", "Кабриолет", "Хэтчбек", "Универсал", "Кроссовер", "Внедорожник"
];

export const years = Array.from({ length: 11 }, (_, i) => 2025 - i);

export const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};