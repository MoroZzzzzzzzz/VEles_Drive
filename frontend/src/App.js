import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { FeaturedCars } from "./components/FeaturedCars";
import { TopDealers } from "./components/TopDealers";
import { Features } from "./components/Features";
import { Footer } from "./components/Footer";

// Import pages
import { CatalogPage } from "./pages/CatalogPage";
import { VehicleDetailPage } from "./pages/VehicleDetailPage";
import { DealersPage } from "./pages/DealersPage";
import { ProfilePage } from "./pages/ProfilePage";
import { FavoritesPage } from "./pages/FavoritesPage";

const Home = () => {
  return (
    <div className="min-h-screen bg-black">
      <main>
        <HeroSection />
        <FeaturedCars />
        <TopDealers />
        <Features />
      </main>
    </div>
  );
};

const About = () => (
  <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-white mb-4">О нас</h1>
      <p className="text-gray-400 max-w-2xl">
        VELES DRIVE - ведущая платформа для покупки и продажи автомобилей премиум класса. 
        Мы объединяем покупателей с проверенными дилерами и предоставляем безопасные условия сделок.
      </p>
    </div>
  </div>
);

const Contacts = () => (
  <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-white mb-4">Контакты</h1>
      <div className="text-gray-400 space-y-2">
        <p>📧 info@velesdrive.ru</p>
        <p>📞 +7 (495) 123-45-67</p>
        <p>📍 Москва, ул. Тверская, 12</p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
            <Route path="/dealers" element={<DealersPage />} />
            <Route path="/dealers/:id" element={<DealersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contacts" element={<Contacts />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;