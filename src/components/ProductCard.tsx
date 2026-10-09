import React, { useState } from 'react';
import type { Product3D } from '../types/product';
import { ProductViewer3D } from './3d/ProductViewer3D';
import { useCart } from '../context/CartContext';
import { Heart, Eye, Check, Sparkles, Gift, AlertCircle, Star, Palette } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { getColorHex } from '../utils/colorUtils';

interface ProductCardProps {
  product: Product3D;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isWishlisted, setSelectedProductModal } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [addedTemp, setAddedTemp] = useState(false);

  const availableColors =
    product.inStockColors && product.inStockColors.length > 0
      ? product.inStockColors
      : ['Cyan Néon', 'Blanc Pur', 'Noir Cyber', 'Rouge Néon', 'Or Métallisé'];

  const outOfStockColors = product.outOfStockColors || [];

  const [selectedColor, setSelectedColor] = useState<string>(() => {
    const inStockOnly = availableColors.filter((c) => !outOfStockColors.includes(c));
    return inStockOnly.length > 0 ? inStockOnly[0] : availableColors[0];
  });

  const [customHex, setCustomHex] = useState<string>('#00f0ff');

  const selectedHex = selectedColor.startsWith('#')
    ? selectedColor
    : getColorHex(selectedColor, product.primaryColor);

  const wishlisted = isWishlisted(product.id);
  const isOut = product.isOutOfStock || false;

  const hasReviews = (product.reviewsCount || 0) > 0;
  const ratingVal = hasReviews ? product.rating : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOut) return;
    soundFx.playAddToCart();
    addToCart(product, undefined, [selectedColor]);
    setAddedTemp(true);
    setTimeout(() => setAddedTemp(false), 1500);
  };

  const handleSelectColor = (color: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (outOfStockColors.includes(color)) return;
    soundFx.playClick();
    setSelectedColor(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setCustomHex(hex);
    setSelectedColor(hex);
  };

  return (
    <div
      className={`product-card ${isOut ? 'card-out-of-stock' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges Overlay */}
      <div className="card-badge-row">
        <div className="badge-fulfillment-group">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="badge-sale font-bold">
              🔥 -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </span>
          )}

          {isOut ? (
            <span className="badge-stock-out">
              <AlertCircle size={12} /> RUPTURE
            </span>
          ) : (
            product.isNew && (
              <span className="badge-new">
                <Sparkles size={12} /> NEW
              </span>
            )
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            soundFx.playClick();
            toggleWishlist(product.id);
          }}
          className={`wishlist-icon-btn ${wishlisted ? 'active' : ''}`}
          title={wishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart size={16} className={wishlisted ? 'filled-heart' : ''} />
        </button>
      </div>

      {/* Product Image / 3D Canvas Box */}
      <div
        className="card-3d-wrapper"
        onClick={() => setSelectedProductModal(product)}
      >
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="card-product-img" />
        ) : (
          <ProductViewer3D
            product={product}
            customPrimaryColor={selectedHex}
            autoRotate={isHovered}
            interactive={isHovered}
            height="220px"
            lightPreset={isHovered ? 'neon' : 'studio'}
          />
        )}

        <div className="hover-inspect-overlay">
          <Eye size={20} />
          <span>Fiche & Couleurs</span>
        </div>
      </div>

      {/* Product Info */}
      <div className="card-info">
        <div className="card-title-row">
          <h3
            className="product-title"
            onClick={() => setSelectedProductModal(product)}
          >
            {product.name}
          </h3>
        </div>

        <p className="product-subtitle">{product.subtitle}</p>

        {/* Visible Star Rating Row */}
        <div className="card-rating-row">
          <div className="stars-group">
            {[1, 2, 3, 4, 5].map((starIndex) => {
              const isFilled = hasReviews && starIndex <= Math.round(ratingVal);
              return (
                <Star
                  key={starIndex}
                  size={14}
                  className={`star-icon ${isFilled ? 'filled' : 'empty'}`}
                  fill={isFilled ? '#f59e0b' : 'none'}
                  color={isFilled ? '#f59e0b' : '#6b7280'}
                />
              );
            })}
          </div>
          <span className="rating-score font-bold">
            {hasReviews ? `${ratingVal.toFixed(1)}/5` : '0/5'}
          </span>
          <span className="rating-count">
            ({product.reviewsCount || 0} avis)
          </span>
        </div>

        {/* INTERACTIVE COLOR SELECTION ROW ON CARD */}
        <div className="card-stock-colors interactive-color-picker">
          <div className="color-picker-header">
            <Palette size={12} className="text-cyan" />
            <span className="stock-colors-label">
              Couleur choisie : <strong style={{ color: selectedHex }}>{selectedColor}</strong>
            </span>
          </div>
          <div className="stock-colors-pills">
            {availableColors.map((color) => {
              const isColorOut = outOfStockColors.includes(color);
              const isSelected = selectedColor === color;
              const chipHex = getColorHex(color);

              return (
                <button
                  key={color}
                  type="button"
                  onClick={(e) => handleSelectColor(color, e)}
                  disabled={isColorOut}
                  className={`stock-color-tag-btn ${isSelected ? 'selected' : ''} ${isColorOut ? 'color-out' : ''}`}
                  title={isColorOut ? `${color} - Rupture` : `Choisir ${color}`}
                >
                  <span
                    className="color-dot-inline"
                    style={{ background: chipHex }}
                  />
                  <span>{color}</span>
                  {isSelected && <Check size={10} className="check-icon" />}
                </button>
              );
            })}

            {/* Custom Color Input Picker */}
            <label
              className={`stock-color-tag-btn custom-color-picker-btn ${selectedColor.startsWith('#') ? 'selected' : ''}`}
              title="Choisir une couleur personnalisée sur-mesure"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="color"
                value={customHex}
                onChange={handleCustomColorChange}
                style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
              />
              <span className="color-dot-inline" style={{ background: customHex }} />
              <span>Sur-mesure 🎨</span>
            </label>
          </div>
        </div>

        {/* Footer: Price and Order Action */}
        <div className="card-footer">
          <div className="price-container">
            {product.price === 0 ? (
              <span className="price-val free-badge font-bold">🎁 GRATUIT</span>
            ) : product.originalPrice && product.originalPrice > product.price ? (
              <div className="discount-price-stack">
                <span className="price-original">{product.originalPrice.toFixed(2)} €</span>
                <span className="price-val price-discounted">{product.price.toFixed(2)} €</span>
              </div>
            ) : (
              <span className="price-val">{product.price.toFixed(2)} €</span>
            )}
          </div>

          <div className="card-btn-group">
            <button
              onClick={() => setSelectedProductModal(product)}
              className="btn-card-inspect"
              title="Aperçu du produit"
            >
              <Eye size={16} />
            </button>

            <button
              onClick={handleAddToCart}
              disabled={isOut}
              className={`btn-card-cart ${addedTemp ? 'added' : ''} ${isOut ? 'disabled-out' : ''} ${product.price === 0 ? 'free-btn' : ''}`}
              title={`Ajouter à ma liste (${selectedColor})`}
            >
              {addedTemp ? (
                <Check size={16} />
              ) : isOut ? (
                <AlertCircle size={16} />
              ) : (
                <Gift size={16} />
              )}
              <span>
                {addedTemp
                  ? 'Dans ma liste ✓'
                  : isOut
                  ? 'Rupture'
                  : product.price === 0
                  ? 'Liste (Gratuit)'
                  : 'Ajouter à ma liste 🎁'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

