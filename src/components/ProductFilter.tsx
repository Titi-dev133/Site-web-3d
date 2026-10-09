import React from 'react';
import { useCart } from '../context/CartContext';
import type { FileFormat } from '../types/product';
import { SlidersHorizontal, RotateCcw, ArrowUpDown } from 'lucide-react';
import { soundFx } from '../utils/audio';

const FORMATS: (FileFormat | 'All')[] = ['All', '.GLTF', '.FBX', '.OBJ', '.USDZ', '.BLEND'];

export const ProductFilter: React.FC = () => {
  const { filters, setFilter, resetFilters } = useCart();

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <div className="filter-title">
          <SlidersHorizontal size={18} />
          <span>Filtres de recherche</span>
        </div>
        <button onClick={resetFilters} className="reset-btn" title="Réinitialiser les filtres">
          <RotateCcw size={14} />
          <span>Effacer</span>
        </button>
      </div>

      <div className="filter-grid">
        {/* File Format Filter */}
        <div className="filter-group">
          <label className="filter-label">Format de Fichier</label>
          <div className="format-pills">
            {FORMATS.map((fmt) => (
              <button
                key={fmt}
                onClick={() => {
                  soundFx.playClick();
                  setFilter('format', fmt);
                }}
                className={`format-pill ${filters.format === fmt ? 'active' : ''}`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Max Price Filter */}
        <div className="filter-group">
          <div className="filter-label-row">
            <label className="filter-label">Prix Max</label>
            <span className="filter-val">
              {filters.maxPrice === 0 ? '🎁 0 € (Gratuits)' : `${filters.maxPrice} €`}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={filters.maxPrice}
            onChange={(e) => setFilter('maxPrice', Number(e.target.value))}
            className="custom-range"
          />
        </div>

        {/* Sort By Filter */}
        <div className="filter-group">
          <label className="filter-label">
            <ArrowUpDown size={14} />
            <span>Trier Par</span>
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => {
              soundFx.playClick();
              setFilter('sortBy', e.target.value as unknown as typeof filters.sortBy);
            }}
            className="custom-select"
          >
            <option value="popular">Popularité & Notes</option>
            <option value="price-low">Prix : croissant</option>
            <option value="price-high">Prix : décroissant</option>
            <option value="polys">Nombre de Polygones</option>
          </select>
        </div>

        {/* Promotions Filter Toggle */}
        <div className="filter-group flex-col-center">
          <label className="filter-label">Offres Spéciales</label>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setFilter('onSaleOnly', !filters.onSaleOnly);
            }}
            className={`filter-sale-toggle ${filters.onSaleOnly ? 'active' : ''}`}
          >
            🔥 Modèles en Réduction ({filters.onSaleOnly ? 'Activé' : 'Tous'})
          </button>
        </div>
      </div>
    </div>
  );
};
