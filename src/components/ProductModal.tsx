import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import type { RenderMode, FileFormat } from '../types/product';
import { ProductViewer3D } from './3d/ProductViewer3D';
import {
  X,
  Gift,
  Check,
  FileCode,
  Maximize2,
  AlertCircle,
  MessageSquare,
  Send,
  Palette,
  Star
} from 'lucide-react';
import { getColorHex } from '../utils/colorUtils';

export const ProductModal: React.FC = () => {
  const { selectedProductModal, setSelectedProductModal, addToCart, addReview } = useCart();

  const [renderMode, setRenderMode] = useState<RenderMode>('standard');
  const [selectedFormat, setSelectedFormat] = useState<FileFormat | undefined>(undefined);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // Review Form State
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState(false);

  useEffect(() => {
    if (selectedProductModal) {
      const allColors =
        selectedProductModal.inStockColors && selectedProductModal.inStockColors.length > 0
          ? selectedProductModal.inStockColors
          : ['Cyan Néon', 'Noir Cyber', 'Blanc Pur'];
      const outColors = selectedProductModal.outOfStockColors || [];
      const inStockOnly = allColors.filter((c) => !outColors.includes(c));
      const firstAvailable = inStockOnly.length > 0 ? inStockOnly[0] : allColors[0];
      const zonesCount = selectedProductModal.colorZonesCount || 1;

      const initialZoneColors = Array.from(
        { length: zonesCount },
        (_, i) => inStockOnly[i % inStockOnly.length] || firstAvailable
      );
      setSelectedColors(initialZoneColors);
    }
  }, [selectedProductModal?.id]);

  if (!selectedProductModal) return null;

  const product = selectedProductModal;
  const activeFormat = selectedFormat || product.formats[0];
  const isOut = product.isOutOfStock || false;

  const allOfferedColors =
    product.inStockColors && product.inStockColors.length > 0
      ? product.inStockColors
      : ['Cyan Néon', 'Noir Cyber', 'Blanc Pur'];

  const outOfStockColors = product.outOfStockColors || [];
  const zonesCount = product.colorZonesCount || 1;

  const primaryHex = getColorHex(selectedColors[0] || '', product.primaryColor);
  const secondaryHex = getColorHex(selectedColors[1] || '', product.secondaryColor);

  const handleClose = () => {
    setSelectedProductModal(null);
  };

  const handleSelectColorForZone = (zoneIndex: number, colorName: string) => {
    if (outOfStockColors.includes(colorName)) return;
    setSelectedColors((prev) => {
      const copy = [...prev];
      copy[zoneIndex] = colorName;
      return copy;
    });
  };

  const handleCustomColorZoneChange = (zoneIndex: number, hex: string) => {
    setSelectedColors((prev) => {
      const copy = [...prev];
      copy[zoneIndex] = hex;
      return copy;
    });
  };

  const handleAddToCart = () => {
    if (isOut) return;
    addToCart(
      product,
      activeFormat,
      selectedColors
    );
    setSelectedProductModal(null);
  };

  const handleSampleDownload = () => {
    setDownloadSuccess(true);
    const linkToDownload = product.downloadUrl || 'https://aether3d.store/file.zip';

    const sampleData = `AETHER 3D STORE - FICHE D'INFORMATION
Modèle: ${product.name}
Statut Stock: ${isOut ? 'RUPTURE DE STOCK' : 'EN STOCK'}
Couleurs Sélectionnées: ${selectedColors.join(', ')}
Lien de Téléchargement Direct: ${linkToDownload}
Formats: ${product.formats.join(', ')}

Merci pour votre visite sur AETHER 3D STORE!`;

    const blob = new Blob([sampleData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${product.name.replace(/\s+/g, '_')}_Fiche.txt`;
    link.click();
    URL.revokeObjectURL(url);

    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) return;

    addReview(product.id, {
      author: reviewAuthor.trim(),
      rating: reviewRating,
      comment: reviewComment.trim()
    });

    setReviewSuccessMsg(true);
    setTimeout(() => setReviewSuccessMsg(false), 3000);

    setReviewAuthor('');
    setReviewComment('');
    setReviewRating(5);
  };

  const hasReviews = (product.reviewsCount || 0) > 0;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            {/* Rating Tag */}
            <div className="modal-rating-badge font-bold flex-row-gap">
              <Star size={14} fill={hasReviews ? '#f59e0b' : 'none'} color={hasReviews ? '#f59e0b' : '#9ca3af'} />
              <span>
                {hasReviews
                  ? `${product.rating.toFixed(1)} / 5.0 (${product.reviewsCount} avis)`
                  : '0/5 (Aucun avis)'}
              </span>
            </div>

            {isOut && (
              <div className="badge-stock-out-modal">
                <AlertCircle size={14} /> RUPTURE DE STOCK
              </div>
            )}
            <h2 className="modal-title">{product.name}</h2>
          </div>

          <button onClick={handleClose} className="modal-close-btn" title="Fermer (Échap)">
            <X size={20} />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="modal-body-grid">
          {/* Left Column: Image or 3D Viewport Studio */}
          <div className="viewport-studio">
            {product.imageUrl ? (
              <div className="modal-image-wrapper">
                <img src={product.imageUrl} alt={product.name} className="modal-product-img" />
              </div>
            ) : (
              <>
                <div className="studio-top-controls">
                  <div className="control-btn-group">
                    <button
                      onClick={() => setRenderMode('standard')}
                      className={`studio-pill ${renderMode === 'standard' ? 'active' : ''}`}
                    >
                      Standard
                    </button>
                    <button
                      onClick={() => setRenderMode('wireframe')}
                      className={`studio-pill ${renderMode === 'wireframe' ? 'active' : ''}`}
                    >
                      Filaire
                    </button>
                    <button
                      onClick={() => setRenderMode('glow')}
                      className={`studio-pill ${renderMode === 'glow' ? 'active' : ''}`}
                    >
                      Néon Glow
                    </button>
                  </div>
                </div>

                <div className="modal-canvas-box">
                  <ProductViewer3D
                    product={product}
                    customPrimaryColor={primaryHex}
                    customSecondaryColor={secondaryHex}
                    renderMode={renderMode}
                    autoRotate={false}
                    interactive={true}
                    height="400px"
                  />

                  <div className="viewport-overlay-hint">
                    <Maximize2 size={14} />
                    <span>Pivotez & zoomez à la souris</span>
                  </div>
                </div>
              </>
            )}

            {/* CUSTOMER REVIEWS SECTION */}
            <div className="modal-reviews-section">
              <div className="reviews-header">
                <div className="reviews-title-group">
                  <MessageSquare size={18} className="text-cyan" />
                  <h4 className="reviews-title">Commentaires & Évaluation</h4>
                </div>
                <div className="reviews-count-badge">
                  <span>{hasReviews ? `${product.rating.toFixed(1)}/5 • ${product.reviewsCount} avis` : '0/5 (0 avis)'}</span>
                </div>
              </div>

              {/* Add Review Form */}
              <form onSubmit={handleAddReviewSubmit} className="add-review-form">
                <h5 className="form-subtitle">Laissez un avis et une note sur ce modèle</h5>

                <div className="form-row-2">
                  <input
                    type="text"
                    placeholder="Votre Nom / Pseudo *"
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    className="form-input"
                    required
                  />

                  {/* Interactive Star Picker */}
                  <div className="star-rating-picker">
                    <span className="picker-label">Note :</span>
                    <div className="stars-picker-row">
                      {[1, 2, 3, 4, 5].map((starNum) => (
                        <button
                          key={starNum}
                          type="button"
                          onClick={() => setReviewRating(starNum)}
                          className="star-btn-select"
                        >
                          <Star
                            size={18}
                            fill={starNum <= reviewRating ? '#f59e0b' : 'none'}
                            color={starNum <= reviewRating ? '#f59e0b' : '#6b7280'}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="picker-score font-bold">{reviewRating}/5</span>
                  </div>
                </div>

                <textarea
                  placeholder="Votre avis sur la qualité du modèle 3D ou de l'impression..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="form-textarea"
                  rows={2}
                  required
                />

                {reviewSuccessMsg && (
                  <div className="review-success-banner">
                    <Check size={16} />
                    <span>Merci ! Votre commentaire a été publié.</span>
                  </div>
                )}

                <button type="submit" className="btn-primary-glow btn-sm flex-row-center">
                  <Send size={14} />
                  <span>Publier mon Commentaire</span>
                </button>
              </form>

              {/* Reviews List */}
              <div className="reviews-list">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((rev) => (
                    <div key={rev.id} className="review-card">
                      <div className="review-card-header">
                        <div className="review-author-group">
                          <span className="review-author">{rev.author}</span>
                          <div className="review-stars-inline">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={12}
                                fill={s <= rev.rating ? '#f59e0b' : 'none'}
                                color={s <= rev.rating ? '#f59e0b' : '#6b7280'}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="review-date">{rev.date}</span>
                      </div>
                      <p className="review-text">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="no-reviews-text">
                    Soyez le premier à donner votre avis sur ce modèle 3D !
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Details & Multi-Color Slot Selection */}
          <div className="modal-details-col">
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="modal-promo-banner font-bold">
                🔥 OFFRE SPÉCIALE EN COURS : -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% DE RÉDUCTION (Prix habituel: {product.originalPrice.toFixed(2)} €)
              </div>
            )}
            <p className="modal-desc">{product.description}</p>

            {/* MULTI-COLOR SELECTION PER COLOR ZONE */}
            <div className="color-zones-card">
              <h4 className="options-title font-bold flex-row-gap">
                <Palette size={16} className="text-cyan" />
                <span>Personnalisation des Couleurs ({zonesCount} zone{zonesCount > 1 ? 's' : ''})</span>
              </h4>

              {Array.from({ length: zonesCount }).map((_, zoneIndex) => {
                const zoneTitle =
                  zonesCount === 1
                    ? 'Couleur de l\'Objet'
                    : zoneIndex === 0
                    ? '1. Couleur Principale'
                    : zoneIndex === 1
                    ? '2. Couleur Secondaire'
                    : `3. Couleur Détails ${zoneIndex + 1}`;

                const activeZoneColor = selectedColors[zoneIndex] || allOfferedColors[0];
                const activeZoneHex = getColorHex(activeZoneColor);

                return (
                  <div key={zoneIndex} className="options-section">
                    <div className="flex-row-between" style={{ marginBottom: '6px' }}>
                      <label className="option-label" style={{ marginBottom: 0 }}>{zoneTitle}</label>
                      <span style={{ fontSize: '0.78rem', color: activeZoneHex, fontWeight: 'bold' }}>
                        {activeZoneColor}
                      </span>
                    </div>

                    <div className="format-selector-grid">
                      {allOfferedColors.map((colorName) => {
                        const isColorOut = outOfStockColors.includes(colorName);
                        const isSelected = selectedColors[zoneIndex] === colorName;
                        const chipHex = getColorHex(colorName);

                        return (
                          <button
                            key={colorName}
                            type="button"
                            onClick={() => handleSelectColorForZone(zoneIndex, colorName)}
                            disabled={isColorOut}
                            className={`format-option-btn color-choice-btn ${
                              isSelected ? 'active' : ''
                            } ${isColorOut ? 'is-color-out' : ''}`}
                            title={isColorOut ? `${colorName} - En Rupture de Stock` : colorName}
                          >
                            <span
                              className="color-dot-inline"
                              style={{
                                background: isColorOut ? '#ef4444' : chipHex
                              }}
                            />
                            <span>{colorName}</span>
                            {isColorOut && <span className="color-out-tag">Rupture</span>}
                          </button>
                        );
                      })}

                      {/* Custom Picker for this Zone */}
                      <label
                        className={`format-option-btn color-choice-btn ${activeZoneColor.startsWith('#') ? 'active' : ''}`}
                        title="Choisir une couleur sur-mesure"
                      >
                        <input
                          type="color"
                          value={activeZoneColor.startsWith('#') ? activeZoneColor : '#00f0ff'}
                          onChange={(e) => handleCustomColorZoneChange(zoneIndex, e.target.value)}
                          style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                        />
                        <span className="color-dot-inline" style={{ background: activeZoneHex }} />
                        <span>Sur-mesure 🎨</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Formats Inclus */}
            <div className="digital-options-card" style={{ marginTop: '12px' }}>
              <div className="options-section">
                <label className="option-label font-bold">Format de Fichier Inclus</label>
                <div className="format-selector-grid">
                  {product.formats.map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setSelectedFormat(fmt)}
                      className={`format-option-btn ${activeFormat === fmt ? 'active' : ''}`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Out of Stock Notice */}
            {isOut && (
              <div className="out-of-stock-alert">
                <AlertCircle size={18} />
                <span>Ce modèle est actuellement en rupture de stock. Vous ne pouvez pas le commander pour le moment.</span>
              </div>
            )}

            {/* Action Bar & Price */}
            <div className="modal-action-bar">
              <div className="modal-price-box">
                <span className="modal-price-label">Prix Total</span>
                {product.price === 0 ? (
                  <span className="modal-price-val free-badge font-bold">🎁 GRATUIT (0.00 €)</span>
                ) : product.originalPrice && product.originalPrice > product.price ? (
                  <div className="modal-discount-price-stack">
                    <span className="modal-price-original">{product.originalPrice.toFixed(2)} €</span>
                    <span className="modal-price-val price-discounted">{product.price.toFixed(2)} €</span>
                  </div>
                ) : (
                  <span className="modal-price-val">{product.price.toFixed(2)} €</span>
                )}
              </div>

              <div className="modal-btn-row">
                <button
                  onClick={handleSampleDownload}
                  className="btn-sample-download"
                  title="Télécharger la fiche info"
                >
                  {downloadSuccess ? <Check size={16} /> : <FileCode size={16} />}
                  <span>{downloadSuccess ? 'Téléchargé !' : 'Fiche Info'}</span>
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={isOut}
                  className={`btn-modal-cart ${isOut ? 'disabled-out' : ''} ${product.price === 0 ? 'free-btn' : ''}`}
                >
                  {isOut ? (
                    <AlertCircle size={18} />
                  ) : (
                    <Gift size={18} />
                  )}
                  <span>
                    {isOut
                      ? 'Actuellement Indisponible'
                      : product.price === 0
                      ? 'Ajouter à ma liste Noël (Gratuit)'
                      : 'Ajouter à ma liste 🎁'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
