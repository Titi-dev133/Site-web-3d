import React from 'react';
import { useCart } from '../context/CartContext';
import type { Category } from '../types/product';
import { Gift, Heart, Search, Sparkles, Filter, ShieldCheck, User } from 'lucide-react';
import { soundFx } from '../utils/audio';

const CATEGORIES: Category[] = [
  'All',
  'Rangement & Organisation',
  'Cuisine & Art de la Table',
  'Décoration & Maison',
  'Outillage & Bricolage',
  'Salle de Bain & Sanitaire',
  'Électroménager & Tech',
  'Jardin & Extérieur'
];

export const Navbar: React.FC = () => {
  const {
    wishlist,
    filters,
    totalItems,
    totalPrice,
    userPseudo,
    logoutUser,
    setIsLoginModalOpen,
    setSearchQuery,
    setCategoryFilter,
    setIsCartOpen,
    setIsStaffOpen,
    setIsWishlistOpen
  } = useCart();

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        {/* Brand Logo */}
        <div className="logo-group" onClick={() => { soundFx.playClick(); setCategoryFilter('All'); setSearchQuery(''); }}>
          <div className="logo-icon-wrapper">
            <Gift className="logo-icon text-cyan" />
            <Sparkles className="logo-sparkle" />
          </div>
          <div className="logo-text">
            <span className="brand-title">AETHER<span className="brand-highlight">NOËL</span></span>
            <span className="brand-subtitle">OBJETS 3D MAISON & UTILITAIRE</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Rechercher un objet utilitaire ou déco..."
            value={filters.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="clear-search-btn"
            >
              ✕
            </button>
          )}
        </div>

        {/* Actions (User Profile, Admin, Wishlist, Xmas List) */}
        <div className="nav-actions">
          {/* User Profile / Login Button */}
          {userPseudo ? (
            <div className="user-profile-badge-group">
              <button
                onClick={() => { soundFx.playClick(); setIsLoginModalOpen(true); }}
                className="user-profile-pill"
                title="Changer de prénom"
              >
                <User size={16} className="text-cyan" />
                <span>🎄 Coucou, <strong>{userPseudo}</strong> !</span>
              </button>
              <button
                onClick={() => { soundFx.playClick(); logoutUser(); }}
                className="btn-logout-pill"
                title="Se déconnecter"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <button
              onClick={() => { soundFx.playClick(); setIsLoginModalOpen(true); }}
              className="user-profile-pill btn-login-pill font-bold"
              title="Se connecter avec votre prénom"
            >
              <User size={16} className="text-cyan" />
              <span>Se connecter 👤</span>
            </button>
          )}

          {/* Espace Admin Noël Button */}
          <button
            onClick={() => { soundFx.playClick(); setIsStaffOpen(true); }}
            className="btn-staff-trigger"
            title="Ouvrir l'Espace Admin (voir toutes les listes de Noël)"
          >
            <ShieldCheck size={18} className="staff-icon" />
            <span>Espace Admin 🎅</span>
          </button>

          {/* Wishlist Button */}
          <button
            onClick={() => { soundFx.playClick(); setIsWishlistOpen(true); }}
            className="icon-btn wishlist-btn"
            title="Mes Favoris"
          >
            <Heart size={20} className={wishlist.length > 0 ? 'filled-heart' : ''} />
            {wishlist.length > 0 && <span className="badge-count">{wishlist.length}</span>}
          </button>

          {/* Christmas Gift List Button */}
          <button
            onClick={() => { soundFx.playClick(); setIsCartOpen(true); }}
            className="cart-trigger-btn xmas-list-btn"
            title="Ouvrir ma liste de cadeaux de Noël"
          >
            <div className="cart-icon-wrapper">
              <Gift size={20} />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </div>
            <div className="cart-price-tag">
              <span className="cart-label">Ma Liste 🎁</span>
              <span className="cart-val">{totalPrice.toFixed(2)} €</span>
            </div>
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <nav className="category-bar">
        <div className="category-scroll">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { soundFx.playClick(); setCategoryFilter(cat); }}
              className={`category-pill ${filters.category === cat ? 'active' : ''}`}
            >
              {cat === 'All' && <Filter size={14} className="cat-icon" />}
              {cat === 'All' ? 'Toutes les catégories maison' : cat}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
