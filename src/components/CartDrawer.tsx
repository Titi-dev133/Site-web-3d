import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, Trash2, Plus, Minus, Tag, ArrowRight, Gift, Check, Share2, Sparkles, User } from 'lucide-react';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';
import { getColorHex } from '../utils/colorUtils';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    discountAmount,
    totalPrice,
    promoCode,
    discountPercentage,
    promoCodes,
    applyPromoCode,
    removePromoCode,
    setIsCheckoutOpen,
    userPseudo,
    setIsLoginModalOpen
  } = useCart();

  const [inputCode, setInputCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [santaSentSuccess, setSantaSentSuccess] = useState(false);

  if (!isCartOpen) return null;

  const validCart = Array.isArray(cart) ? cart.filter((item) => item && item.product) : [];

  const handleApplyCode = (e: React.FormEvent, codeToUse?: string) => {
    if (e) e.preventDefault();
    const code = codeToUse || inputCode;
    if (!code.trim()) return;

    soundFx.playClick();
    const res = applyPromoCode(code);
    if (res.success) {
      setPromoMessage({ text: res.message });
      setInputCode('');
    } else {
      setPromoMessage({ text: res.message, error: true });
    }
  };

  const handleRemoveCode = () => {
    soundFx.playClick();
    removePromoCode();
    setPromoMessage(null);
  };

  const handleCopyList = () => {
    soundFx.playClick();
    if (validCart.length === 0) return;

    const listLines = validCart.map(
      (item, idx) =>
        `${idx + 1}. ${item.product.name} (x${item.quantity}) - Format: ${item.selectedFormat} [${item.selectedColors?.join(', ') || 'Standard'}] - ${(item.product.price * item.quantity).toFixed(2)}€`
    );

    const fullText = `🎄 LISTE DE CADEAUX DE NOËL DE ${userPseudo.toUpperCase()} 🎁\n\n${listLines.join('\n')}\n\n💰 Budget total estimé: ${totalPrice.toFixed(2)} €\n✨ Liste créée sur Aether 3D Studio`;

    navigator.clipboard.writeText(fullText);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const handleSendToSanta = () => {
    soundFx.playCheckoutSuccess();
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
    setSantaSentSuccess(true);
    setTimeout(() => setSantaSentSuccess(false), 4000);
  };

  return (
    <div className="drawer-backdrop" onClick={() => { soundFx.playClick(); setIsCartOpen(false); }}>
      <div className="drawer-content christmas-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header christmas-header">
          <div className="drawer-title-group">
            <Gift size={22} className="drawer-title-icon text-cyan" />
            <div>
              <h3 className="drawer-title">Ma Liste de Noël 🎄</h3>
              <div
                className="user-pseudo-badge"
                onClick={() => {
                  setIsCartOpen(false);
                  setIsLoginModalOpen(true);
                }}
                title="Cliquer pour changer de prénom"
              >
                <User size={12} />
                <span>Liste de <strong>{userPseudo || 'Utilisateur'}</strong></span>
                <span className="change-link"> (Changer)</span>
              </div>
            </div>
            <span className="drawer-count">({validCart.length})</span>
          </div>

          <button onClick={() => { soundFx.playClick(); setIsCartOpen(false); }} className="drawer-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Santa Confirmation Banner */}
        {santaSentSuccess && (
          <div className="santa-sent-banner">
            <Sparkles size={20} />
            <div>
              <strong>🎅 Liste envoyée au Père Noël !</strong>
              <p>Votre liste de cadeaux pour {userPseudo} est enregistrée et visible dans l'Espace Admin !</p>
            </div>
          </div>
        )}

        {/* Item List */}
        <div className="drawer-body">
          {validCart.length > 0 ? (
            <div className="cart-items-list">
              <div className="share-list-top-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <button
                  type="button"
                  onClick={handleCopyList}
                  className={`btn-share-list ${copiedSuccess ? 'copied' : ''}`}
                  style={{ marginBottom: 0 }}
                >
                  {copiedSuccess ? <Check size={14} /> : <Share2 size={14} />}
                  <span>{copiedSuccess ? 'Copié !' : 'Copier ma Liste'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Voulez-vous vraiment vider votre liste de Noël ?')) {
                      soundFx.playClick();
                      clearCart();
                    }
                  }}
                  className="btn-danger-icon flex-row-center font-bold"
                  style={{ padding: '0.55rem', fontSize: '0.78rem', gap: '0.3rem', borderRadius: 'var(--radius-sm)', width: '100%' }}
                  title="Effacer tous les articles de ma liste"
                >
                  <Trash2 size={14} />
                  <span>Vider ma Liste</span>
                </button>
              </div>

              {validCart.map((item, idx) => {
                const prod = item.product;
                const primaryColorHex = getColorHex(item.selectedColors?.[0] || prod.primaryColor || '#00f0ff');

                return (
                  <div key={`${prod.id}-${item.selectedFormat || 'gltf'}-${idx}`} className="cart-item-card christmas-item-card">
                    <div
                      className="cart-item-thumb"
                      style={{
                        background: `radial-gradient(circle, ${primaryColorHex} 0%, #111122 80%)`
                      }}
                    >
                      <Gift size={22} style={{ color: primaryColorHex }} />
                    </div>

                    <div className="cart-item-details">
                      <h4 className="item-name">{prod.name}</h4>
                      
                      <div className="item-meta">
                        <span className="item-format">Format: {item.selectedFormat}</span>
                        <span className="item-colors">
                          Couleurs: <strong style={{ color: primaryColorHex }}>{item.selectedColors?.join(', ') || 'Standard'}</strong>
                        </span>
                      </div>

                      <div className="item-price">
                        {prod.price === 0
                          ? '🎁 GRATUIT'
                          : `${(prod.price * item.quantity).toFixed(2)} €`}
                      </div>
                    </div>

                    {/* Quantity Controls & Delete */}
                    <div className="cart-item-actions">
                      <div className="qty-controls">
                        <button
                          onClick={() => updateQuantity(prod.id, -1)}
                          className="qty-btn"
                          title="Diminuer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="qty-val">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(prod.id, 1)}
                          className="qty-btn"
                          title="Augmenter"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(prod.id)}
                        className="delete-item-btn"
                        title="Retirer de ma liste"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="cart-empty-box">
              <Gift size={54} className="empty-cart-icon text-cyan" />
              <p className="empty-cart-text">Votre liste de cadeaux pour Noël est vide 🎁.</p>
              <p className="empty-cart-subtext">Parcourez les objets 3D de la maison et cliquez sur <strong>"Ajouter à ma liste 🎁"</strong> !</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn-primary-glow"
              >
                Parcourir les objets de la maison
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {validCart.length > 0 && (
          <div className="drawer-footer">
            {/* Promo Code Form */}
            {promoCode ? (
              <div className="promo-applied-card">
                <div className="promo-applied-info">
                  <Tag size={16} className="text-cyan" />
                  <div>
                    <strong className="text-cyan">Code "{promoCode}" actif</strong>
                    <span className="promo-percent-badge font-bold">-{discountPercentage}% de réduction</span>
                  </div>
                </div>
                <button type="button" onClick={handleRemoveCode} className="btn-remove-promo">
                  <X size={14} /> Supprimer
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCode} className="promo-code-form">
                <div className="promo-input-group">
                  <Tag size={16} className="promo-icon" />
                  <input
                    type="text"
                    placeholder="Code promo Noël (ex: NOEL2026)"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="promo-input"
                  />
                  <button type="submit" className="promo-apply-btn">
                    Appliquer
                  </button>
                </div>

                {/* Quick Chips for active codes */}
                {promoCodes.filter((p) => p.isActive).length > 0 && (
                  <div className="promo-chips-row">
                    <span className="chips-label">Codes disponibles :</span>
                    {promoCodes
                      .filter((p) => p.isActive)
                      .slice(0, 4)
                      .map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={(e) => handleApplyCode(e, p.code)}
                          className="promo-chip-pill"
                          title={p.description}
                        >
                          🎟️ {p.code} (-{p.discountPercent}%)
                        </button>
                      ))}
                  </div>
                )}

                {promoMessage && (
                  <div className={`promo-msg ${promoMessage.error ? 'error' : 'success'}`}>
                    {promoMessage.error ? null : <Check size={14} />}
                    <span>{promoMessage.text}</span>
                  </div>
                )}
              </form>
            )}

            {/* Calculations Breakdown */}
            <div className="summary-breakdown">
              <div className="summary-row">
                <span>Budget estimé des cadeaux</span>
                <span>{subtotal === 0 ? '0.00 € (Gratuit)' : `${subtotal.toFixed(2)} €`}</span>
              </div>
              {discountAmount > 0 && (
                <div className="summary-row discount">
                  <span>Remise Noël ({promoCode})</span>
                  <span>-{discountAmount.toFixed(2)} €</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total de ma Liste</span>
                <span className="total-val">
                  {totalPrice === 0 ? '🎁 0.00 € (Offert)' : `${totalPrice.toFixed(2)} €`}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="xmas-drawer-actions">
              <button
                type="button"
                onClick={handleSendToSanta}
                className="btn-send-santa"
              >
                <span>🎅 Confirmer & Envoyer au Père Noël !</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className={`btn-checkout ${totalPrice === 0 ? 'free-checkout-btn' : ''}`}
              >
                <span>
                  {totalPrice === 0
                    ? '🎁 Commander/Télécharger la liste (Gratuit)'
                    : 'Procéder à la Commande'}
                </span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
