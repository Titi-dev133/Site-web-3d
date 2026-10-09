import React from 'react';
import { useCart } from '../context/CartContext';
import { ProductCard } from './ProductCard';
import { SearchX, Box, PlusCircle, RefreshCcw } from 'lucide-react';
import { soundFx } from '../utils/audio';

export const ProductGrid: React.FC = () => {
  const { products, filters, resetFilters, setIsStaffOpen, loadSampleProducts } = useCart();

  // Filter & Sort Logic
  const filteredProducts = products.filter((product) => {
    // 1. Search Query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchesName = product.name.toLowerCase().includes(q);
      const matchesSub = product.subtitle.toLowerCase().includes(q);
      const matchesDesc = product.description.toLowerCase().includes(q);
      const matchesTag = product.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchesName && !matchesSub && !matchesDesc && !matchesTag) return false;
    }

    // 2. Category
    if (filters.category !== 'All' && product.category !== filters.category) {
      return false;
    }

    // 3. Price
    if (product.price > filters.maxPrice) {
      return false;
    }

    // 4. Polygons
    if (product.polygons > filters.maxPolygons) {
      return false;
    }

    // 5. Format
    if (filters.format !== 'All' && !product.formats.includes(filters.format)) {
      return false;
    }

    // 6. Fulfillment Type
    if (filters.fulfillmentType !== 'All' && product.fulfillmentType !== filters.fulfillmentType) {
      return false;
    }

    // 7. On Sale Only
    if (filters.onSaleOnly && (!product.originalPrice || product.originalPrice <= product.price)) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'price-low') return a.price - b.price;
    if (filters.sortBy === 'price-high') return b.price - a.price;
    if (filters.sortBy === 'polys') return b.polygons - a.polygons;
    return b.rating - a.rating;
  });

  return (
    <div className="catalog-section" id="catalog-grid">
      <div className="catalog-bar">
        <div className="catalog-title-group">
          <h2 className="catalog-heading">
            <Box className="heading-icon" size={24} />
            <span>Catalogue des Modèles 3D</span>
          </h2>
          <span className="results-count">
            {filteredProducts.length} modèle{filteredProducts.length > 1 ? 's' : ''} disponible{filteredProducts.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid-container">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="empty-state">
          <SearchX size={48} className="empty-icon" />
          <h3 className="empty-title">Aucun modèle 3D ne correspond à vos filtres</h3>
          <p className="empty-desc">
            Essayez de réinitialiser la tranche de prix, la limite de polygones ou le mot-clé de recherche.
          </p>
          <button onClick={resetFilters} className="btn-primary-glow">
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="empty-state empty-catalog-welcome">
          <Box size={56} className="empty-icon-box" />
          <h3 className="empty-title">Le catalogue est actuellement vide</h3>
          <p className="empty-desc">
            Vous êtes administrateur / staff ? Cliquez ci-dessous pour ajouter vos premiers modèles 3D avec leurs liens de téléchargement ou leurs options d'impression 3D !
          </p>

          <div className="empty-cta-row">
            <button
              onClick={() => { soundFx.playClick(); setIsStaffOpen(true); }}
              className="btn-primary-glow"
            >
              <PlusCircle size={18} />
              Ouvrir l'Espace Staff (Ajouter un objet)
            </button>

            <button
              onClick={loadSampleProducts}
              className="btn-glass"
            >
              <RefreshCcw size={18} />
              Charger des modèles de démonstration
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
