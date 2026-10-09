import React, { useState, useEffect } from 'react';
import { ProductViewer3D } from './3d/ProductViewer3D';
import { useCart } from '../context/CartContext';
import type { Product3D } from '../types/product';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Layers,
  Printer,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pause,
  Play,
  PlusCircle,
  Box
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { products, wishlist, addToCart, setSelectedProductModal, setIsStaffOpen } = useCart();
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Dynamic Statistical Ranking for Coup de Cœur selection:
  // Combines salesCount, rating, reviewsCount and wishlist popularity score!
  const showcaseItems: Product3D[] = [...products].sort((a, b) => {
    const scoreA = (a.salesCount || 0) * 10 + (a.rating || 0) * 20 + (a.reviewsCount || 0) * 2 + (wishlist.includes(a.id) ? 15 : 0);
    const scoreB = (b.salesCount || 0) * 10 + (b.rating || 0) * 20 + (b.reviewsCount || 0) * 2 + (wishlist.includes(b.id) ? 15 : 0);
    return scoreB - scoreA;
  });

  const hasModels = showcaseItems.length > 0;
  const currentProduct = hasModels ? showcaseItems[activeIdx % showcaseItems.length] : null;

  // Auto-scroll effect: changes product every 4.5 seconds unless hovered or paused
  useEffect(() => {
    if (!hasModels || showcaseItems.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % showcaseItems.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [hasModels, showcaseItems.length, isPaused]);

  const handlePrev = () => {
    if (!hasModels) return;
    setActiveIdx((prev) => (prev - 1 + showcaseItems.length) % showcaseItems.length);
  };

  const handleNext = () => {
    if (!hasModels) return;
    setActiveIdx((prev) => (prev + 1) % showcaseItems.length);
  };

  // Dynamic Marketing Badge based on real statistical rank
  const getMarketingBadge = (index: number, product: Product3D) => {
    if (index === 0) {
      return {
        text: `🏆 N°1 Coup de Cœur • ${product.salesCount || 0} Ventes • ⭐ ${product.rating}`,
        class: 'badge-hot'
      };
    }
    if (product.originalPrice && product.originalPrice > product.price) {
      return {
        text: `🔥 Offre Spéciale • -${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% de réduction`,
        class: 'badge-discount'
      };
    }
    if (index === 1) {
      return {
        text: `⭐ Top 2 des Ventes • ${product.salesCount || 0} Commandes`,
        class: 'badge-featured'
      };
    }
    return {
      text: `⚡ Modèle Populaire • ${product.reviewsCount || 0} avis clients`,
      class: 'badge-speed'
    };
  };

  const currentBadge = hasModels && currentProduct ? getMarketingBadge(activeIdx % showcaseItems.length, currentProduct) : null;
  const isOut = currentProduct?.isOutOfStock || false;

  return (
    <section className="hero-section">
      <div className="hero-content">
        {/* Left Column: Headline & Value Proposition */}
        <div className="hero-text-col">
          <div className="hero-badge">
            <Sparkles size={16} className="badge-sparkle" />
            <span>🎄 SPÉCIAL NOËL • MAISON & UTILITAIRE</span>
          </div>

          <h1 className="hero-title">
            Objets 3D de la Maison <br />
            <span className="gradient-text">Ma Liste de Cadeaux pour Noël 🎁</span>
          </h1>

          <p className="hero-description">
            Créez votre liste de cadeaux de Noël avec nos objets 3D utilitaires et déco pour la maison ! Connectez-vous avec votre prénom et partagez votre liste avec vos proches ou le Père Noël 🎅.
          </p>

          <div className="hero-cta-group">
            <button
              onClick={() => {
                document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-primary-glow"
            >
              <Zap size={18} />
              Explorer les Objets Maison
            </button>

            <button onClick={() => setIsStaffOpen(true)} className="btn-glass">
              <Sparkles size={18} />
              Espace Admin 🎅 (Voir les listes)
            </button>
          </div>

          {/* Key Value Metrics */}
          <div className="hero-metrics">
            <div className="metric-item">
              <ShieldCheck size={20} className="metric-icon" />
              <div>
                <strong className="metric-num">Catégories Maison</strong>
                <span className="metric-desc">Rangement, Cuisine, Déco & Outillage</span>
              </div>
            </div>
            <div className="metric-item">
              <Layers size={20} className="metric-icon" />
              <div>
                <strong className="metric-num">Accès Admin Noël</strong>
                <span className="metric-desc">Consultez toutes les listes en 1 clic</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Product Showcase (Only active if catalog has models) */}
        <div
          className="hero-viewer-card"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {hasModels && currentProduct && currentBadge ? (
            <>
              {/* Header Bar with Live Badge & Controls */}
              <div className="viewer-card-header">
                <div className="status-indicator">
                  <span className="live-dot pulse" />
                  <span className="hero-live-label">
                    {activeIdx % showcaseItems.length === 0
                      ? '👑 N°1 Coup de Cœur (Statistiques)'
                      : `📊 Top #${(activeIdx % showcaseItems.length) + 1} Ventes & Popularité`}
                  </span>
                </div>

                {showcaseItems.length > 1 && (
                  <div className="hero-carousel-controls">
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className="carousel-pause-btn"
                      title={isPaused ? 'Reprendre le défilement auto' : 'Mettre en pause le défilement'}
                    >
                      {isPaused ? <Play size={12} /> : <Pause size={12} />}
                    </button>

                    <button onClick={handlePrev} className="carousel-nav-btn" title="Précédent">
                      <ChevronLeft size={16} />
                    </button>

                    <span className="carousel-counter">
                      {activeIdx + 1} / {showcaseItems.length}
                    </span>

                    <button onClick={handleNext} className="carousel-nav-btn" title="Suivant">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Marketing Highlight Banner */}
              <div className={`hero-promo-banner ${currentBadge.class}`}>
                <span>{currentBadge.text}</span>
              </div>

              {/* Image / 3D Canvas Box */}
              <div
                className="hero-3d-canvas-wrapper"
                onClick={() => setSelectedProductModal(currentProduct)}
              >
                {currentProduct.imageUrl ? (
                  <img src={currentProduct.imageUrl} alt={currentProduct.name} className="hero-product-img" />
                ) : (
                  <ProductViewer3D
                    product={currentProduct}
                    autoRotate={true}
                    interactive={true}
                    height="310px"
                    lightPreset="neon"
                  />
                )}

                <div className="hero-overlay-inspect font-bold">
                  <Eye size={16} />
                  <span>Cliquer pour Fiche & Couleurs</span>
                </div>
              </div>

              {/* Dots Indicator Row */}
              {showcaseItems.length > 1 && (
                <div className="hero-carousel-dots">
                  {showcaseItems.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIdx(i)}
                      className={`dot-pill ${i === activeIdx % showcaseItems.length ? 'active' : ''}`}
                      title={`Voir modèle ${i + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Card Footer: Product Info & Order Action */}
              <div className="viewer-card-footer">
                <div className="featured-meta">
                  <h3 className="featured-name">{currentProduct.name}</h3>
                  <p className="featured-subtitle">{currentProduct.subtitle}</p>
                  <div className="featured-tags">
                    <span className="tag-poly font-bold">
                      {currentProduct.fulfillmentType === 'digital' ? '📥 Fichier 3D' : '🖨️ Impression 3D'}
                    </span>
                    <span className="tag-sales-stat">
                      📈 {currentProduct.salesCount || 0} Ventes • ⭐ {(currentProduct.reviewsCount || 0) > 0 ? `${currentProduct.rating.toFixed(1)}/5` : '0/5'}
                    </span>
                    {currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price ? (
                      <div className="hero-discount-tag-stack">
                        <span className="tag-price-original">{currentProduct.originalPrice.toFixed(2)} €</span>
                        <span className="tag-price tag-discounted">{currentProduct.price.toFixed(2)} €</span>
                      </div>
                    ) : (
                      <span className="tag-price">
                        {currentProduct.price === 0 ? '🎁 GRATUIT' : `${currentProduct.price.toFixed(2)} €`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="hero-action-buttons">
                  <button
                    onClick={() => setSelectedProductModal(currentProduct)}
                    className="btn-hero-inspect"
                    title="Aperçu rapide"
                  >
                    <Eye size={16} />
                  </button>

                  <button
                    onClick={() => {
                      if (!isOut) {
                        addToCart(currentProduct);
                      } else {
                        setSelectedProductModal(currentProduct);
                      }
                    }}
                    className={`btn-add-hero ${isOut ? 'disabled-out' : ''}`}
                    disabled={isOut}
                  >
                    {currentProduct.fulfillmentType === 'digital' ? (
                      <Download size={16} />
                    ) : (
                      <Printer size={16} />
                    )}
                    <span>
                      {isOut
                        ? 'Rupture'
                        : currentProduct.fulfillmentType === 'digital'
                        ? 'Acheter'
                        : 'Commander'}
                    </span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* EMPTY CATALOG STATE FOR HERO SHOWCASE */
            <div className="empty-hero-card">
              <Box size={44} className="text-cyan" />
              <h4 className="empty-hero-title">Aucun modèle 3D dans le catalogue</h4>
              <p className="empty-hero-sub">
                Publiez votre premier modèle 3D depuis l'Espace Staff pour lancer la vitrine interactive et le défilement automatique !
              </p>
              <button
                onClick={() => setIsStaffOpen(true)}
                className="btn-primary-glow btn-sm flex-row-center"
              >
                <PlusCircle size={16} />
                <span>Publier un Modèle (Staff)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
