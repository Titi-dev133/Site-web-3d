import React, { useState, useEffect } from 'react';
import { Snowflake } from 'lucide-react';
import { soundFx } from '../utils/audio';

export const ChristmasDecoration: React.FC = () => {
  const [snowEnabled, setSnowEnabled] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        setScrollY(window.scrollY || 0);
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Generate 28 fixed snowflakes with pseudo-random offsets for performance
  const snowflakes = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: `${(i * 3.7) % 100}%`,
    animationDelay: `${(i * 0.4) % 5}s`,
    animationDuration: `${6 + (i % 5) * 2}s`,
    size: `${0.7 + (i % 3) * 0.4}rem`,
    opacity: 0.3 + (i % 4) * 0.15,
    char: i % 3 === 0 ? '❄' : i % 3 === 1 ? '❅' : '❆'
  }));

  // String lights colors (red, gold, green, cyan, white)
  const lightsCount = 28;

  // Calculate dynamic Santa vertical descent offset based on scroll position
  // Santa smoothly descends down the viewport when user scrolls down
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const maxDescent = Math.max(0, viewportHeight - 140);
  const santaYOffset = Math.min(maxDescent, scrollY * 0.4);

  return (
    <div className="christmas-decorations-wrapper">
      {/* 1. Festive Top Announcement Bar */}
      <div className="xmas-top-banner font-bold">
        <div className="xmas-banner-content flex-row-center">
          <span className="twinkle-star">⭐</span>
          <span className="xmas-banner-text">
            🎄 MA LISTE DE CADEAUX DE NOËL 🎄 — Créez, personnalisez vos objets 3D en couleur & envoyez votre liste au Père Noël 🎅 !
          </span>
          <span className="twinkle-star">⭐</span>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setSnowEnabled(!snowEnabled);
            }}
            className={`snow-toggle-pill ${snowEnabled ? 'active' : ''}`}
            title={snowEnabled ? 'Désactiver l\'effet neige ❄️' : 'Activer l\'effet neige ❄️'}
          >
            <Snowflake size={12} className={snowEnabled ? 'spin-slow' : ''} />
            <span>{snowEnabled ? 'Neige ON ❄️' : 'Neige OFF'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Hanging String Lights Garland (Guirlande Lumineuse de Noël) */}
      <div className="xmas-string-lights">
        {Array.from({ length: lightsCount }).map((_, i) => (
          <div
            key={i}
            className={`light-bulb light-color-${i % 5}`}
            style={{
              animationDelay: `${(i * 0.25) % 2}s`
            }}
          />
        ))}
      </div>

      {/* 3. Falling Snowflakes Layer */}
      {snowEnabled && (
        <div className="snowflakes-container" aria-hidden="true">
          {snowflakes.map((sf) => (
            <div
              key={sf.id}
              className="snowflake"
              style={{
                left: sf.left,
                animationDelay: sf.animationDelay,
                animationDuration: sf.animationDuration,
                fontSize: sf.size,
                opacity: sf.opacity
              }}
            >
              {sf.char}
            </div>
          ))}
        </div>
      )}

      {/* 4. Floating Santa Sleigh Silhouette Banner - Descends with Scroll */}
      <div
        className="santa-sleigh-sky"
        aria-hidden="true"
        style={{
          transform: `translateY(${santaYOffset}px)`
        }}
      >
        <div className="santa-sleigh-flyer">
          <span className="santa-trail">🎁 ✨ </span>
          <span className="santa-group">🎅🛷 🦌🦌🦌🦌✨</span>
        </div>
      </div>
    </div>
  );
};

