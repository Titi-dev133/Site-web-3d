import React from 'react';
import { Box, Sparkles, Shield, Cpu, ExternalLink, Heart } from 'lucide-react';
import { soundFx } from '../utils/audio';

export const Footer: React.FC = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-col brand-col">
          <div className="logo-group">
            <div className="logo-icon-wrapper">
              <Box className="logo-icon" />
              <Sparkles className="logo-sparkle" />
            </div>
            <div className="logo-text">
              <span className="brand-title">AETHER<span className="brand-highlight">3D</span></span>
              <span className="brand-subtitle">STUDIO ASSET STORE</span>
            </div>
          </div>
          <p className="footer-desc">
            Plateforme e-commerce haut de gamme spécialisée dans les modèles, assets et animations 3D temps réel pour le jeu vidéo, la publicité et le métavers.
          </p>
          <div className="footer-badges">
            <span className="f-badge"><Shield size={14} /> Garantie AAA</span>
            <span className="f-badge"><Cpu size={14} /> Procedural Engine</span>
          </div>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Navigation</h4>
          <ul className="footer-links">
            <li><a href="#catalog-grid" onClick={() => soundFx.playClick()}>Toutes les catégories</a></li>
            <li><a href="#catalog-grid" onClick={() => soundFx.playClick()}>Sci-Fi & Cyberpunk</a></li>
            <li><a href="#catalog-grid" onClick={() => soundFx.playClick()}>Sculptures VORONOI</a></li>
            <li><a href="#catalog-grid" onClick={() => soundFx.playClick()}>Architecture & Décors</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Spécifications</h4>
          <ul className="footer-links">
            <li><span>Formats: .GLTF, .FBX, .OBJ, .BLEND</span></li>
            <li><span>Textures: PBR 4K & 8K Maps</span></li>
            <li><span>Compatibilité: Unreal 5, Unity, Blender</span></li>
            <li><span>Licences: Commerciales & Indies</span></li>
          </ul>
        </div>

        <div className="footer-col newsletter-col">
          <h4 className="footer-col-title">Restez connecté</h4>
          <p className="newsletter-text">
            Inscrivez-vous pour recevoir les derniers packs 3D gratuits chaque mois.
          </p>
          <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); soundFx.playAddToCart(); alert('Merci pour votre inscription !'); }}>
            <input type="email" placeholder="votre.email@studio.com" className="newsletter-input" required />
            <button type="submit" className="newsletter-btn">
              <ExternalLink size={16} />
            </button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 AETHER 3D STUDIO. Tous droits réservés.</p>
        <p className="made-with">
          Conçu avec <Heart size={14} className="heart-icon" /> & Three.js pour le web 3D.
        </p>
      </div>
    </footer>
  );
};
