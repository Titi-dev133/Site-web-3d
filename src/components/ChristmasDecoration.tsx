import React, { useState } from 'react';

export const ChristmasDecoration: React.FC = () => {
  const [snowEnabled] = useState(true);

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

  return (
    <div className="christmas-decorations-wrapper">
      {/* 1. Top Hanging String Lights Garland (Guirlande Lumineuse de Noël) */}
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

      {/* 2. Falling Snowflakes Layer */}
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

      {/* 3. Floating Santa Sleigh Silhouette Banner - Fixed altitude horizontal flight */}
      <div className="santa-sleigh-sky" aria-hidden="true">
        <div className="santa-sleigh-flyer">
          <span className="santa-trail">🎁 ✨ </span>
          <span className="santa-group">🎅🛷 🦌🦌🦌🦌✨</span>
        </div>
      </div>
    </div>
  );
};


