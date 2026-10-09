import React from 'react';
import { useCart } from '../context/CartContext';
import {
  X,
  Heart,
  ShoppingCart,
  Eye,
  Trash2,
  Download,
  Printer,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const WishlistModal: React.FC = () => {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlist,
    products,
    toggleWishlist,
    addToCart,
    setSelectedProductModal
  } = useCart();

  if (!isWishlistOpen) return null;

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="modal-backdrop" onClick={() => setIsWishlistOpen(false)}>
      <div className="modal-content wishlist-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="wishlist-badge-icon">
              <Heart size={18} className="filled-heart" />
            </div>
            <div>
              <h3 className="modal-title">Mes Modèles Favoris (J'aime)</h3>
              <span className="staff-subtitle">
                {wishlistedProducts.length} modèle{wishlistedProducts.length > 1 ? 's' : ''} enregistré{wishlistedProducts.length > 1 ? 's' : ''} dans vos coups de cœur
              </span>
            </div>
          </div>

          <button onClick={() => setIsWishlistOpen(false)} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="wishlist-modal-body">
          {wishlistedProducts.length > 0 ? (
            <div className="wishlist-products-grid">
              {wishlistedProducts.map((p) => {
                const isOut = p.isOutOfStock || false;

                return (
                  <div key={p.id} className="wishlist-item-card">
                    {/* Item Thumbnail */}
                    <div className="wishlist-item-thumb">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="wishlist-img" />
                      ) : (
                        <div className="wishlist-placeholder-icon">
                          <Sparkles size={24} className="text-cyan" />
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="wishlist-item-info">
                      <div className="wishlist-badges-row">
                        {p.fulfillmentType === 'digital' ? (
                          <span className="badge-fulfillment digital">
                            <Download size={11} /> Numérique
                          </span>
                        ) : (
                          <span className="badge-fulfillment print">
                            <Printer size={11} /> Impression 3D
                          </span>
                        )}
                        {isOut && (
                          <span className="badge-stock-out font-bold">
                            <AlertCircle size={11} /> RUPTURE
                          </span>
                        )}
                      </div>

                      <h4 className="wishlist-item-title">{p.name}</h4>
                      <p className="wishlist-item-sub">{p.subtitle}</p>

                      <div className="wishlist-price-row">
                        <span className="wishlist-price-val">
                          {p.price === 0 ? '🎁 GRATUIT' : `${p.price.toFixed(2)} €`}
                        </span>
                        <span className="wishlist-rating">({p.reviewsCount} avis)</span>
                      </div>
                    </div>

                    {/* Item Actions */}
                    <div className="wishlist-item-actions">
                      <button
                        onClick={() => {
                          setIsWishlistOpen(false);
                          setSelectedProductModal(p);
                        }}
                        className="btn-glass btn-sm flex-row-center"
                        title="Voir la fiche détaillée"
                      >
                        <Eye size={15} />
                        <span>Fiche</span>
                      </button>

                      <button
                        onClick={() => addToCart(p)}
                        disabled={isOut}
                        className={`btn-primary-glow btn-sm flex-row-center ${isOut ? 'disabled-out' : ''}`}
                        title={isOut ? 'Modèle en rupture de stock' : 'Ajouter au panier'}
                      >
                        <ShoppingCart size={15} />
                        <span>{isOut ? 'Indisponible' : 'Panier'}</span>
                      </button>

                      <button
                        onClick={() => toggleWishlist(p.id)}
                        className="btn-danger-icon"
                        title="Retirer des favoris"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-wishlist-box">
              <div className="empty-heart-icon-wrapper">
                <Heart size={48} className="filled-heart" />
              </div>
              <h4 className="empty-wishlist-title">Aucun modèle dans vos favoris</h4>
              <p className="empty-wishlist-desc">
                Cliquez sur l'icône ❤️ en haut à droite des cartes modèles pour ajouter vos coups de cœur à votre liste de favoris !
              </p>
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="btn-primary-glow"
              >
                Explorer le Catalogue 3D
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
