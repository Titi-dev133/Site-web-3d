import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import confetti from 'canvas-confetti';
import {
  X,
  CreditCard,
  ShieldCheck,
  Download,
  CheckCircle2,
  Lock,
  Sparkles,
  Mail,
  User,
  Truck,
  MapPin
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export const CheckoutModal: React.FC = () => {
  const { isCheckoutOpen, setIsCheckoutOpen, cart, totalPrice, clearCart, shippingAddress, setShippingAddress, recordSalesBatch } = useCart();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto' | 'paypal'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const hasPrintItems = (Array.isArray(cart) ? cart : []).some((item) => item?.product?.fulfillmentType === 'print');

  if (!isCheckoutOpen) return null;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    if (step === 1) {
      if (!email) return;
      setStep(2);
    } else if (step === 2) {
      // Process Payment Simulation
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setStep(3);
        // Record sales for statistics
        recordSalesBatch(
          cart
            .filter((item) => item && item.product)
            .map((item) => ({
              productId: item.product.id,
              quantity: item.quantity
            }))
        );
        soundFx.playCheckoutSuccess();
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.55 }
        });
      }, 1500);
    }
  };

  const handleClose = () => {
    soundFx.playClick();
    if (step === 3) {
      clearCart();
      setStep(1);
    }
    setIsCheckoutOpen(false);
  };

  const handleOpenStaffDownload = (url?: string, name?: string) => {
    soundFx.playAddToCart();
    const finalUrl = url || 'https://aether3d.store/downloads/package.zip';
    if (finalUrl.startsWith('http')) {
      window.open(finalUrl, '_blank');
    } else {
      const content = `AETHER 3D STORE - COMMANDE #ORD-${Math.floor(100000 + Math.random() * 900000)}
Modèle: ${name}
URL de téléchargement direct: ${finalUrl}

Merci pour votre achat !`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${name?.replace(/\s+/g, '_')}_Link.txt`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content checkout-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <ShieldCheck size={20} className="modal-icon-shield" />
            <h3 className="modal-title">
              {step === 3 ? 'Commande Validée & Confirmée !' : 'Paiement Sécurisé SSL'}
            </h3>
          </div>
          <button onClick={handleClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Steps Progress */}
        <div className="checkout-steps-bar">
          <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
            <span className="step-num">1</span>
            <span className="step-label">{hasPrintItems ? 'Livraison & Contact' : 'Contact'}</span>
          </div>
          <div className="step-line" />
          <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
            <span className="step-num">2</span>
            <span className="step-label">Règlement</span>
          </div>
          <div className="step-line" />
          <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
            <span className="step-num">3</span>
            <span className="step-label">Confirmation</span>
          </div>
        </div>

        {/* Step 1: Customer Contact & Shipping Address (If Print) */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="checkout-step-body">
            <h4 className="checkout-subtitle">Coordonnées du Destinataire</h4>
            
            <div className="form-group">
              <label className="form-label">Nom Complet *</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="Ex: Jean Dupont"
                  value={shippingAddress.fullName}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Adresse Email *</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="votre.email@domaine.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Physical Shipping Address if Print Items present */}
            {hasPrintItems && (
              <div className="physical-shipping-card">
                <h5 className="shipping-card-title flex-row-gap">
                  <Truck size={16} className="text-cyan" />
                  <span>Adresse d'Expédition pour l'Impression 3D</span>
                </h5>

                <div className="form-group">
                  <label className="form-label">Rue et Numéro</label>
                  <div className="input-with-icon">
                    <MapPin size={18} className="input-icon" />
                    <input
                      type="text"
                      placeholder="123 Rue de la République"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Code Postal</label>
                    <input
                      type="text"
                      placeholder="75001"
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ville</label>
                    <input
                      type="text"
                      placeholder="Paris"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="order-summary-box">
              <span className="summary-title">Total ({cart.length} articles)</span>
              <strong className="summary-total">
                {totalPrice === 0 ? '🎁 0.00 € (Offert)' : `${totalPrice.toFixed(2)} €`}
              </strong>
            </div>

            <button type="submit" className="btn-primary-glow btn-full">
              {totalPrice === 0 ? 'Valider la Commande Gratuite' : 'Continuer vers le Paiement'}
            </button>
          </form>
        )}

        {/* Step 2: Payment Options */}
        {step === 2 && (
          <form onSubmit={handleNextStep} className="checkout-step-body">
            {totalPrice === 0 ? (
              <div className="free-checkout-banner">
                <Sparkles size={20} className="text-cyan" />
                <div>
                  <strong>🎉 Commande 100% Gratuite !</strong>
                  <p>Aucun paiement n'est requis. Cliquez ci-dessous pour valider immédiatement.</p>
                </div>
              </div>
            ) : (
              <>
                <h4 className="checkout-subtitle">Sélectionnez le mode de paiement</h4>

                <div className="payment-options-grid">
                  <div
                    onClick={() => { soundFx.playClick(); setPaymentMethod('card'); }}
                    className={`payment-option-card ${paymentMethod === 'card' ? 'active' : ''}`}
                  >
                    <CreditCard size={20} />
                    <span>Carte Bancaire</span>
                  </div>

                  <div
                    onClick={() => { soundFx.playClick(); setPaymentMethod('crypto'); }}
                    className={`payment-option-card ${paymentMethod === 'crypto' ? 'active' : ''}`}
                  >
                    <Sparkles size={20} />
                    <span>Crypto / Web3</span>
                  </div>

                  <div
                    onClick={() => { soundFx.playClick(); setPaymentMethod('paypal'); }}
                    className={`payment-option-card ${paymentMethod === 'paypal' ? 'active' : ''}`}
                  >
                    <Lock size={20} />
                    <span>PayPal</span>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="card-simulation-fields">
                    <div className="form-group">
                      <label className="form-label">Numéro de Carte (Simulé)</label>
                      <input type="text" defaultValue="4532 9012 3456 8892" className="form-input" />
                    </div>
                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label">Expire</label>
                        <input type="text" defaultValue="12/28" className="form-input" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVC</label>
                        <input type="text" defaultValue="888" className="form-input" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className={`btn-primary-glow btn-full ${totalPrice === 0 ? 'free-checkout-submit' : ''}`}
            >
              {isProcessing
                ? 'Traitement en cours...'
                : totalPrice === 0
                ? '🎁 Obtenir Gratuitement (0.00 €)'
                : `Payer ${totalPrice.toFixed(2)} €`}
            </button>
          </form>
        )}

        {/* Step 3: Confirmation & Links */}
        {step === 3 && (
          <div className="checkout-success-body">
            <CheckCircle2 size={64} className="success-icon" />
            <h3 className="success-title">Merci pour votre commande !</h3>
            <p className="success-desc">
              Votre paiement a été validé. Les instructions pour vos objets 3D sont ci-dessous :
            </p>

            <div className="download-assets-list">
              {cart.map((item, idx) => {
                if (!item || !item.product) return null;
                const prod = item.product;

                return (
                  <div key={`${prod.id}-${idx}`} className="download-item-row">
                    <div className="download-item-info">
                      <strong>{prod.name}</strong>
                      <span>📥 Téléchargement Direct • Format {item.selectedFormat} • Couleurs: {item.selectedColors?.join(', ') || 'Standard'}</span>
                    </div>

                    <button
                      onClick={() => handleOpenStaffDownload(prod.downloadUrl, prod.name)}
                      className="btn-download-asset"
                    >
                      <Download size={14} />
                      <span>Télécharger ({item.selectedFormat})</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {hasPrintItems && (
              <div className="shipping-confirmation-box">
                <Truck size={20} className="text-cyan" />
                <div>
                  <strong>Expédition prévue sous 3 à 5 jours</strong>
                  <p>Colis livré à : {shippingAddress.fullName}, {shippingAddress.street}, {shippingAddress.city}</p>
                </div>
              </div>
            )}

            <button onClick={handleClose} className="btn-primary-glow btn-full">
              Fermer & Retour au site
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
