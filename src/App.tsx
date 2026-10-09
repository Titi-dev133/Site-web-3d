import React from 'react';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductFilter } from './components/ProductFilter';
import { ProductGrid } from './components/ProductGrid';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { StaffModal } from './components/StaffModal';
import { WishlistModal } from './components/WishlistModal';
import { LoginModal } from './components/LoginModal';
import { ChristmasDecoration } from './components/ChristmasDecoration';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  return (
    <CartProvider>
      <ChristmasDecoration />
      <div className="app-container">
        <Navbar />

        <main className="main-content">
          <HeroSection />
          <ProductFilter />
          <ProductGrid />
        </main>

        <ProductModal />
        <CartDrawer />
        <CheckoutModal />
        <StaffModal />
        <WishlistModal />
        <LoginModal />

        <Footer />
      </div>
    </CartProvider>
  );
};

export default App;
