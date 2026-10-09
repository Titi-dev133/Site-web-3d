import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, User, Gift, ShieldCheck, Check } from 'lucide-react';
import { soundFx } from '../utils/audio';

export const LoginModal: React.FC = () => {
  const {
    userPseudo,
    setUserPseudo,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isAdmin,
    setIsAdmin,
    setIsStaffOpen
  } = useCart();

  const [inputPseudo, setInputPseudo] = useState(userPseudo);
  const [isAdminModeSelected, setIsAdminModeSelected] = useState(isAdmin);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isLoginModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    const clean = inputPseudo.trim();

    if (!clean && !isAdminModeSelected) {
      setErrorMsg('Veuillez saisir votre prénom ou pseudo pour continuer !');
      return;
    }

    if (isAdminModeSelected) {
      setIsAdmin(true);
      setUserPseudo(clean || 'Admin Père Noël');
      setIsLoginModalOpen(false);
      setIsStaffOpen(true);
      return;
    }

    setIsAdmin(false);
    setUserPseudo(clean);
    setIsLoginModalOpen(false);
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsLoginModalOpen(false)}>
      <div className="modal-content login-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="login-badge-icon">
              <Gift size={20} className="text-cyan" />
            </div>
            <div>
              <h3 className="modal-title">Identification & Liste de Noël 🎄</h3>
              <span className="staff-subtitle">
                Entrez votre prénom pour enregistrer et partager votre liste de cadeaux pour Noël
              </span>
            </div>
          </div>

          <button onClick={() => setIsLoginModalOpen(false)} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="login-modal-body">

          {/* User Pseudo Input */}
          <div className="form-group">
            <label className="form-label">
              <User size={15} /> Votre Prénom / Pseudo *
            </label>
            <input
              type="text"
              placeholder="Ex: Lucas, Marie, Mamie..."
              value={inputPseudo}
              onChange={(e) => {
                setInputPseudo(e.target.value);
                setErrorMsg(null);
              }}
              className="form-input pseudo-big-input"
              autoFocus
            />
          </div>

          {/* Admin Switch */}
          <div className="admin-switch-card">
            <div className="admin-switch-header">
              <div className="flex-row-gap">
                <ShieldCheck size={18} className="text-cyan" />
                <strong>Connexion Administrateur 🎅</strong>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsAdminModeSelected(!isAdminModeSelected);
                }}
                className={`toggle-admin-btn ${isAdminModeSelected ? 'active' : ''}`}
              >
                {isAdminModeSelected ? 'Mode Admin Activé ✓' : 'Se connecter comme Admin'}
              </button>
            </div>
            {isAdminModeSelected && (
              <p className="admin-notice-text">
                🔑 En tant qu'administrateur, vous pourrez consulter toutes les listes de Noël créées par les utilisateurs et les gérer dans l'Espace Admin !
              </p>
            )}
          </div>

          {errorMsg && <div className="login-error-banner">{errorMsg}</div>}

          {/* Actions */}
          <div className="login-actions-row">
            <button type="submit" className="btn-primary-glow btn-full big-btn">
              <Check size={18} />
              <span>
                {isAdminModeSelected
                  ? 'Accéder à l\'Espace Admin Noël 🎅'
                  : inputPseudo.trim()
                  ? `Se connecter en tant que "${inputPseudo.trim()}" 👤`
                  : 'Se connecter 👤'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
