import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import type { Product3D, Category, FileFormat, FulfillmentType, PromoScope } from '../types/product';
import {
  X,
  PlusCircle,
  Trash2,
  Download,
  Printer,
  Sparkles,
  Layers,
  Check,
  RefreshCcw,
  ShieldAlert,
  Image as ImageIcon,
  AlertCircle,
  Pencil,
  Palette,
  Upload,
  BarChart2,
  TrendingUp,
  Star,
  Award,
  ShoppingBag,
  DollarSign,
  Tag,
  Gift,
  Plus
} from 'lucide-react';

const CATEGORIES: Category[] = [
  'Rangement & Organisation',
  'Cuisine & Art de la Table',
  'Décoration & Maison',
  'Outillage & Bricolage',
  'Salle de Bain & Sanitaire',
  'Électroménager & Tech',
  'Jardin & Extérieur'
];

const PRESET_COLORS = [
  { name: 'Noir Cyber', hex: '#111111' },
  { name: 'Blanc Pur', hex: '#ffffff' },
  { name: 'Cyan Néon', hex: '#00f0ff' },
  { name: 'Rouge Néon', hex: '#ff0055' },
  { name: 'Or Métallisé', hex: '#ffaa00' },
  { name: 'Vert Émeraude', hex: '#00ff66' },
  { name: 'Violet Spatiale', hex: '#7000ff' }
];

const FORMAT_OPTIONS: FileFormat[] = ['.GLTF', '.FBX', '.OBJ', '.STL', '.USDZ', '.BLEND'];

export const StaffModal: React.FC = () => {
  const {
    isStaffOpen,
    setIsStaffOpen,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleOutOfStock,
    toggleColorOutOfStock,
    loadSampleProducts,
    clearAllProducts,
    incrementSale,
    promoCodes,
    addPromoCode,
    togglePromoCodeActive,
    deletePromoCode,
    userLists,
    purchasedUserLists,
    deleteUserList,
    clearAllUserLists,
    toggleUserListPurchasedBySanta
  } = useCart();

  const [activeTab, setActiveTab] = useState<'xmas-lists' | 'add' | 'list' | 'stats' | 'promos'>('xmas-lists');
  const userKeys = Object.keys(userLists).filter((key) => {
    const items = userLists[key];
    if (!Array.isArray(items) || items.length === 0) return false;
    const totalQty = items.reduce((sum, item) => sum + (item?.quantity || 0), 0);
    return totalQty > 0;
  });
  const [selectedUserPseudo, setSelectedUserPseudo] = useState<string>(userKeys[0] || '');
  const [successMsg, setSuccessMsg] = useState(false);
  const [successMsgText, setSuccessMsgText] = useState('Modèle 3D publié avec succès !');

  // New Promo Code Form state
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoPercent, setNewPromoPercent] = useState<number>(20);
  const [newPromoDesc, setNewPromoDesc] = useState('');
  const [newPromoScope, setNewPromoScope] = useState<PromoScope>('all');
  const [newTargetCategory, setNewTargetCategory] = useState<Category>('Rangement & Organisation');
  const [newTargetProductId, setNewTargetProductId] = useState<string>('');
  const [promoFormSuccess, setPromoFormSuccess] = useState<string | null>(null);
  const [promoFormError, setPromoFormError] = useState<string | null>(null);

  // Edit Mode state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<Category>('Rangement & Organisation');
  const [price, setPrice] = useState<number | string>(29.99);
  const [originalPrice, setOriginalPrice] = useState<number | string>('');
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('digital');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadFileName, setDownloadFileName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedStockColors, setSelectedStockColors] = useState<string[]>([
    'Noir Cyber',
    'Blanc Pur',
    'Cyan Néon'
  ]);
  const [outOfStockColors, setOutOfStockColors] = useState<string[]>([]);
  const [colorZonesCount, setColorZonesCount] = useState<number>(1);

  const [isInitialOutOfStock, setIsInitialOutOfStock] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<FileFormat[]>(['.GLTF', '.FBX']);
  const [description, setDescription] = useState('');

  // Dynamic Color Palette state (Custom Colors)
  const [allColors, setAllColors] = useState<{ name: string; hex: string }[]>(() => {
    try {
      const saved = localStorage.getItem('aether_custom_colors');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return PRESET_COLORS;
    } catch {
      return PRESET_COLORS;
    }
  });
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#00f0ff');

  useEffect(() => {
    localStorage.setItem('aether_custom_colors', JSON.stringify(allColors));
  }, [allColors]);

  const handleAddCustomColor = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customColorName.trim();
    if (!trimmed) return;

    if (allColors.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      alert(`La couleur "${trimmed}" existe déjà dans la palette.`);
      return;
    }

    const newCol = { name: trimmed, hex: customColorHex };
    setAllColors((prev) => [...prev, newCol]);
    setSelectedStockColors((prev) => [...prev, trimmed]);
    setCustomColorName('');
  };

  const handleDeleteColorFromPalette = (colorName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAllColors((prev) => prev.filter((c) => c.name !== colorName));
    setSelectedStockColors((prev) => prev.filter((n) => n !== colorName));
    setOutOfStockColors((prev) => prev.filter((n) => n !== colorName));
  };

  if (!isStaffOpen) return null;

  // --- SALON STAFF STATISTICAL CALCULATIONS ---
  const totalSalesCount = products.reduce((sum, p) => sum + (p.salesCount || 0), 0);
  const totalRevenue = products.reduce((sum, p) => sum + (p.salesCount || 0) * p.price, 0);

  // Ranked products by sales (Meilleur au moins bon)
  const productsBySales = [...products].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));

  // Ranked products by rating (Meilleurs notés)
  const productsByRating = [...products].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return b.reviewsCount - a.reviewsCount;
  });

  // Group by Category / Theme & rank categories by sales
  const categoryStatsMap = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = { category: cat, totalSales: 0, totalRevenue: 0, productCount: 0, topProduct: null as Product3D | null };
    return acc;
  }, {} as Record<Category, { category: Category; totalSales: number; totalRevenue: number; productCount: number; topProduct: Product3D | null }>);

  products.forEach((p) => {
    const cat = p.category;
    if (!categoryStatsMap[cat]) {
      categoryStatsMap[cat] = { category: cat, totalSales: 0, totalRevenue: 0, productCount: 0, topProduct: null };
    }
    const stat = categoryStatsMap[cat];
    stat.productCount += 1;
    stat.totalSales += (p.salesCount || 0);
    stat.totalRevenue += (p.salesCount || 0) * p.price;
    if (!stat.topProduct || (p.salesCount || 0) > (stat.topProduct.salesCount || 0)) {
      stat.topProduct = p;
    }
  });

  const categoryStatsList = Object.values(categoryStatsMap).sort((a, b) => b.totalSales - a.totalSales);
  const topSellingCategory = categoryStatsList.length > 0 ? categoryStatsList[0] : null;
  const topSellingProduct = productsBySales.length > 0 ? productsBySales[0] : null;

  const handleCreatePromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;

    const chosenProductId = newTargetProductId || (products.length > 0 ? products[0].id : '');

    const ok = addPromoCode(
      newPromoCode,
      newPromoPercent,
      newPromoScope,
      newTargetCategory,
      chosenProductId,
      newPromoDesc
    );

    if (ok) {
      const scopeLabel =
        newPromoScope === 'all'
          ? 'sur tout le site'
          : newPromoScope === 'category'
          ? `sur le thème "${newTargetCategory}"`
          : `sur le modèle "${products.find((p) => p.id === chosenProductId)?.name || 'spécifique'}"`;

      setPromoFormSuccess(`Le code promo "${newPromoCode.trim().toUpperCase()}" (-${newPromoPercent}% ${scopeLabel}) a été créé avec succès !`);
      setPromoFormError(null);
      setNewPromoCode('');
      setNewPromoDesc('');
      setNewPromoPercent(20);
      setNewPromoScope('all');
      setTimeout(() => setPromoFormSuccess(null), 3000);
    } else {
      setPromoFormError(`Le code promo "${newPromoCode.trim().toUpperCase()}" existe déjà dans la base.`);
      setPromoFormSuccess(null);
      setTimeout(() => setPromoFormError(null), 3000);
    }
  };

  const handleToggleColor = (colorName: string) => {
    setSelectedStockColors((prev) => {
      if (prev.includes(colorName)) {
        // If removing color from stock options, also clean up outOfStockColors
        setOutOfStockColors((oPrev) => oPrev.filter((c) => c !== colorName));
        return prev.filter((c) => c !== colorName);
      }
      return [...prev, colorName];
    });
  };

  const handleToggleColorRupture = (colorName: string) => {
    setOutOfStockColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  };

  const handleToggleFormat = (fmt: FileFormat) => {
    setSelectedFormats((prev) =>
      prev.includes(fmt) ? prev.filter((f) => f !== fmt) : [...prev, fmt]
    );
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handle3DFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDownloadFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setDownloadUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyDiscountPercent = (percent: number) => {
    const base = originalPrice !== '' && Number(originalPrice) > 0 ? Number(originalPrice) : Number(price) || 29.99;
    if (originalPrice === '' || Number(originalPrice) <= Number(price)) {
      setOriginalPrice(base);
    }
    const discounted = base * (1 - percent / 100);
    setPrice(Number(discounted.toFixed(2)));
  };

  const handleClearDiscount = () => {
    if (originalPrice !== '' && Number(originalPrice) > 0) {
      setPrice(Number(originalPrice));
    }
    setOriginalPrice('');
  };

  const handleStartEdit = (p: Product3D) => {
    setEditingProductId(p.id);
    setName(p.name);
    setSubtitle(p.subtitle);
    setCategory(p.category);
    setPrice(p.price);
    setOriginalPrice(p.originalPrice ?? '');
    setFulfillmentType(p.fulfillmentType);
    setDownloadUrl(p.downloadUrl || '');
    setDownloadFileName(p.downloadUrl ? p.downloadUrl.split('/').pop() || 'Fichier 3D' : '');
    setImageUrl(p.imageUrl || '');
    setSelectedStockColors(
      p.inStockColors && p.inStockColors.length > 0
        ? p.inStockColors
        : ['Noir Cyber', 'Blanc Pur', 'Cyan Néon']
    );
    setOutOfStockColors(p.outOfStockColors || []);
    setColorZonesCount(p.colorZonesCount || 1);
    setIsInitialOutOfStock(p.isOutOfStock || false);
    setSelectedFormats(p.formats && p.formats.length > 0 ? p.formats : ['.GLTF', '.FBX']);
    setDescription(p.description || '');
    setActiveTab('add');
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setName('');
    setSubtitle('');
    setPrice(29.99);
    setOriginalPrice('');
    setDownloadUrl('');
    setDownloadFileName('');
    setImageUrl('');
    setDescription('');
    setOutOfStockColors([]);
    setColorZonesCount(1);
    setIsInitialOutOfStock(false);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalImageUrl =
      imageUrl.trim() ||
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';

    const activeFormats: FileFormat[] = selectedFormats.length > 0 ? selectedFormats : ['.GLTF'];

    const numPrice = Number(price);
    const numOrig = originalPrice !== '' ? Number(originalPrice) : undefined;
    const validOrig = numOrig && numOrig > numPrice ? numOrig : undefined;

    const payload = {
      name,
      subtitle: subtitle || 'Modèle 3D Téléchargeable',
      category,
      price: numPrice,
      originalPrice: validOrig,
      polygons: 25000,
      vertices: 12000,
      formats: activeFormats,
      primaryColor: '#00f0ff',
      secondaryColor: '#7000ff',
      imageUrl: finalImageUrl,
      inStockColors:
        selectedStockColors.length > 0 ? selectedStockColors : ['Noir Cyber', 'Blanc Pur'],
      outOfStockColors,
      colorZonesCount: Number(colorZonesCount),
      isOutOfStock: isInitialOutOfStock,
      description: description || 'Modèle 3D prêt à l\'emploi publié par l\'équipe staff.',
      tags: [category, 'Numérique'],
      fulfillmentType: 'digital' as const,
      downloadUrl: downloadUrl || 'https://aether3d.store/file.zip'
    };

    if (editingProductId) {
      updateProduct(editingProductId, payload);
      setSuccessMsgText(`Le modèle "${name}" a été mis à jour en ligne !`);
    } else {
      addProduct({
        ...payload,
        texturesIncluded: ['Textures 4K PBR', 'Normal Map'],
        rigged: false,
        animated: false,
        isNew: true
      });
      setSuccessMsgText(`Le modèle "${name}" a été publié dans le catalogue !`);
    }

    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2500);

    handleCancelEdit();
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsStaffOpen(false)}>
      <div className="modal-content staff-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="staff-badge-icon">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="modal-title">Panneau d'Administration Staff</h3>
              <span className="staff-subtitle">
                Publication, édition, avis clients, zones de couleur & ruptures par couleur
              </span>
            </div>
          </div>

          <button onClick={() => setIsStaffOpen(false)} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Staff Tabs */}
        <div className="staff-tabs-bar">
          <button
            onClick={() => setActiveTab('xmas-lists')}
            className={`staff-tab-btn xmas-tab-btn ${activeTab === 'xmas-lists' ? 'active' : ''}`}
          >
            <Sparkles size={16} />
            <span>🎅 Listes de Noël ({userKeys.length} Utilisateurs)</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`staff-tab-btn staff-stats-tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          >
            <BarChart2 size={16} />
            <span>📊 Statistiques</span>
          </button>

          <button
            onClick={() => setActiveTab('promos')}
            className={`staff-tab-btn staff-promos-tab-btn ${activeTab === 'promos' ? 'active' : ''}`}
          >
            <Tag size={16} />
            <span>🎟️ Codes Promo ({promoCodes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`staff-tab-btn ${activeTab === 'add' ? 'active' : ''}`}
          >
            {editingProductId ? <Pencil size={16} /> : <PlusCircle size={16} />}
            <span>{editingProductId ? 'Éditer le Modèle 3D' : 'Ajouter un Modèle 3D'}</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`staff-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          >
            <Layers size={16} />
            <span>Catalogue ({products.length})</span>
          </button>
        </div>

        {/* Tab 0: Admin View of All Users' Christmas Gift Lists */}
        {activeTab === 'xmas-lists' && (
          <div className="staff-stats-body">
            <div className="stats-section-box">
              <div className="section-header-row">
                <div className="flex-row-gap">
                  <Sparkles size={22} className="text-gold" />
                  <div>
                    <h4 className="section-title">Tableau de Bord des Listes de Noël 🎅</h4>
                    <span className="staff-subtitle">Consultez, gérez et supprimez toutes les listes de cadeaux créées par les utilisateurs</span>
                  </div>
                </div>

                {userKeys.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir vider TOUTES les listes d\'utilisateurs ?')) {
                        clearAllUserLists();
                      }
                    }}
                    className="btn-danger-icon flex-row-gap"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                    title="Vider toutes les listes de cadeaux"
                  >
                    <Trash2 size={14} /> Vider toutes les listes
                  </button>
                )}
              </div>

              {/* User Selection Pills Bar */}
              {userKeys.length > 0 ? (
                <div className="xmas-user-selector-bar">
                  <span className="preset-label font-bold">Sélectionner un Utilisateur :</span>
                  <div className="user-selector-grid">
                    {userKeys.map((pseudoKey) => {
                      const itemsCount = (userLists[pseudoKey] || []).reduce((sum, item) => sum + (item?.quantity || 0), 0);
                      const listPrice = (userLists[pseudoKey] || []).reduce((sum, item) => sum + (item?.product?.price || 0) * (item?.quantity || 1), 0);
                      const isPurchased = purchasedUserLists[pseudoKey] || false;
                      const isSelected = selectedUserPseudo === pseudoKey;

                      return (
                        <div
                          key={pseudoKey}
                          onClick={() => setSelectedUserPseudo(pseudoKey)}
                          className={`admin-user-card ${isSelected ? 'active' : ''} ${isPurchased ? 'santa-purchased' : ''}`}
                        >
                          <div className="admin-user-card-header">
                            <strong className="user-card-name">👤 {pseudoKey}</strong>
                            <div className="flex-row-gap">
                              {isPurchased && <span className="santa-badge">🎁 Acheté</span>}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Supprimer la liste de Noël de ${pseudoKey} ?`)) {
                                    deleteUserList(pseudoKey);
                                    const remaining = Object.keys(userLists).filter((k) => k !== pseudoKey);
                                    if (remaining.length > 0) setSelectedUserPseudo(remaining[0]);
                                  }
                                }}
                                className="delete-prod-btn"
                                title={`Supprimer la liste de ${pseudoKey}`}
                                style={{ padding: '2px 4px' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                          <div className="admin-user-card-meta">
                            <span>{itemsCount} cadeau{itemsCount > 1 ? 'x' : ''}</span>
                            <span className="font-bold text-cyan">{listPrice.toFixed(2)} €</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="empty-user-list-box" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                  <Gift size={44} className="text-cyan" style={{ margin: '0 auto 0.8rem auto' }} />
                  <h4 className="font-bold text-white" style={{ fontSize: '1.1rem' }}>Aucune liste de Noël enregistrée pour le moment 🎁</h4>
                  <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                    Les listes de cadeaux créées par les utilisateurs apparaîtront ici automatiquement dès qu'ils ajouteront des objets 3D à leur liste !
                  </p>
                </div>
              )}

              {/* Selected User List Detailed View */}
              {selectedUserPseudo && userLists[selectedUserPseudo] ? (
                <div className="admin-user-detail-card">
                  <div className="admin-user-detail-header">
                    <div>
                      <h3 className="user-detail-title">🎁 Liste de Cadeaux de Noël de : <span className="text-cyan">{selectedUserPseudo}</span></h3>
                      <span className="staff-subtitle">
                        Total des cadeaux : {(userLists[selectedUserPseudo] || []).reduce((sum, item) => sum + (item?.quantity || 0), 0)} articles • Budget estimé :{' '}
                        <strong>{(userLists[selectedUserPseudo] || []).reduce((sum, item) => sum + (item?.product?.price || 0) * (item?.quantity || 1), 0).toFixed(2)} €</strong>
                      </span>
                    </div>

                    <div className="user-detail-actions">
                      <button
                        type="button"
                        onClick={() => toggleUserListPurchasedBySanta(selectedUserPseudo)}
                        className={`btn-santa-toggle ${purchasedUserLists[selectedUserPseudo] ? 'purchased' : ''}`}
                      >
                        {purchasedUserLists[selectedUserPseudo] ? '🎁 Marqué Acheté par Père Noël ✓' : '🎅 Marquer Acheté par Père Noël'}
                      </button>

                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="btn-glass btn-sm"
                        title="Imprimer la liste"
                      >
                        <Printer size={14} /> Imprimer
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Voulez-vous supprimer la liste de Noël de ${selectedUserPseudo} ?`)) {
                            deleteUserList(selectedUserPseudo);
                            const remaining = Object.keys(userLists).filter((k) => k !== selectedUserPseudo);
                            if (remaining.length > 0) setSelectedUserPseudo(remaining[0]);
                          }
                        }}
                        className="btn-danger-icon"
                        title="Supprimer la liste"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {userLists[selectedUserPseudo].length > 0 ? (
                    <div className="admin-user-items-table">
                      {userLists[selectedUserPseudo].map((item, idx) => {
                        if (!item || !item.product) return null;
                        const prod = item.product;

                        return (
                          <div key={`${prod.id}-${idx}`} className="admin-xmas-item-row">
                            <div className="admin-item-thumb">
                              {prod.imageUrl ? (
                                <img src={prod.imageUrl} alt={prod.name} />
                              ) : (
                                <Sparkles size={20} className="text-cyan" />
                              )}
                            </div>

                            <div className="admin-item-info">
                              <strong className="item-name">{prod.name}</strong>
                              <div className="item-sub-tags">
                                <span className="tag-cat">{prod.category}</span>
                                <span className="tag-format">Format: {item.selectedFormat}</span>
                                <span className="tag-colors">Couleurs: {item.selectedColors?.join(', ') || 'Standard'}</span>
                              </div>
                            </div>

                            <div className="admin-item-pricing">
                              <span className="item-qty">Qté : {item.quantity}</span>
                              <span className="item-total-val">{(prod.price * item.quantity).toFixed(2)} €</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="empty-user-list-box">
                      <ShoppingBag size={36} className="text-muted" />
                      <p>Cette liste de cadeaux est actuellement vide.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-user-list-box">
                  <p>Aucun utilisateur n'a de liste active.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 1: Form (Add or Edit) */}
        {activeTab === 'add' && (
          <form onSubmit={handleSubmitForm} className="staff-form-body">
            {/* Editing Notice Banner */}
            {editingProductId && (
              <div className="editing-banner">
                <span>✏️ Mode Édition : Modification du modèle en ligne</span>
                <button type="button" onClick={handleCancelEdit} className="btn-cancel-edit">
                  Annuler l'Édition
                </button>
              </div>
            )}

            {/* General Info Fields */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Nom du modèle 3D *</label>
                <input
                  type="text"
                  placeholder="Ex: Masque Cyber V3"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sous-titre / Court résumé</label>
                <input
                  type="text"
                  placeholder="Ex: Impression résine HD ou fichier PBR"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="form-input custom-select"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label">Prix de Vente (€) *</label>
                  <span className="price-hint-tag">
                    {Number(price) === 0 ? '🎁 Objet Gratuit (0€)' : `${Number(price || 0).toFixed(2)} €`}
                  </span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={price === 0 ? '0' : price}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPrice(val === '' ? '' : parseFloat(val));
                  }}
                  className="form-input"
                  required
                />
                <div className="price-presets-row">
                  <button
                    type="button"
                    onClick={() => setPrice(0)}
                    className={`price-preset-pill ${Number(price) === 0 ? 'active free-pill' : ''}`}
                  >
                    🎁 0€ (Gratuit)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrice(9.90)}
                    className={`price-preset-pill ${Number(price) === 9.90 ? 'active' : ''}`}
                  >
                    9.90 €
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrice(19.90)}
                    className={`price-preset-pill ${Number(price) === 19.90 ? 'active' : ''}`}
                  >
                    19.90 €
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrice(29.90)}
                    className={`price-preset-pill ${Number(price) === 29.90 ? 'active' : ''}`}
                  >
                    29.90 €
                  </button>
                </div>
              </div>

              {/* Original Price / Discount Field */}
              <div className="form-group highlight-input">
                <div className="form-label-row">
                  <label className="form-label">Prix d'Origine / Prix Barré (€) (Optionnel)</label>
                  {originalPrice !== '' && Number(originalPrice) > Number(price) && (
                    <span className="discount-calc-tag">
                      🔥 -{Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)}% de réduction
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 39.90 (laisser vide si pas de promo)"
                  value={originalPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setOriginalPrice(val === '' ? '' : parseFloat(val));
                  }}
                  className="form-input"
                />
                <div className="price-presets-row">
                  <span className="preset-label">Appliquer Réduction :</span>
                  <button
                    type="button"
                    onClick={() => handleApplyDiscountPercent(20)}
                    className="price-preset-pill promo-pill"
                    title="Appliquer 20% de réduction"
                  >
                    🔥 -20%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyDiscountPercent(30)}
                    className="price-preset-pill promo-pill"
                    title="Appliquer 30% de réduction"
                  >
                    🔥 -30%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyDiscountPercent(50)}
                    className="price-preset-pill promo-pill"
                    title="Appliquer 50% de réduction"
                  >
                    🔥 -50%
                  </button>
                  {originalPrice !== '' && (
                    <button
                      type="button"
                      onClick={handleClearDiscount}
                      className="price-preset-pill reset-promo-pill"
                    >
                      Effacer Promo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Image Selection & File Upload */}
            <div className="form-group highlight-input">
              <label className="form-label">
                <ImageIcon size={14} /> Image de Présentation (Fichier PC ou URL Web)
              </label>

              <div className="image-input-options-row">
                <label className="btn-file-upload-glow">
                  <Upload size={16} />
                  <span>📁 Importer une Image depuis mon ordinateur</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden-file-input"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setImageUrl('/images/gemini_generated_model.jpg')}
                  className="btn-preset-image"
                  title="Utiliser l'image d'organiseur 3D générée dans les téléchargements"
                >
                  <Sparkles size={14} />
                  <span>Image Organiseur 3D (Gemini)</span>
                </button>
              </div>

              <div className="url-input-subrow">
                <input
                  type="text"
                  placeholder="Ou collez une URL d'image web (https://...)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Notice hint if user pastes a file:// link directly */}
              {imageUrl.startsWith('file://') && (
                <div className="file-url-warning-banner">
                  <AlertCircle size={14} />
                  <span>
                    💡 Les liens local <code style={{ color: '#00f0ff' }}>file://</code> sont bloqués par la sécurité du navigateur web. Cliquez sur <strong>"📁 Importer une Image depuis mon ordinateur"</strong> ci-dessus pour charger directement l'image !
                  </span>
                </div>
              )}

              {/* Live Preview Box */}
              {imageUrl && !imageUrl.startsWith('file://') && (
                <div className="staff-image-preview-card">
                  <div className="preview-header">
                    <span>Aperçu de l'image sélectionnée :</span>
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="btn-remove-image"
                    >
                      <Trash2 size={12} /> Supprimer l'image
                    </button>
                  </div>
                  <img
                    src={imageUrl}
                    alt="Aperçu du modèle"
                    className="staff-preview-img"
                    onError={() => {
                      // fallback if image fails to load
                    }}
                  />
                </div>
              )}
            </div>

            {/* Digital Download 3D File Selection & Upload */}
            {fulfillmentType === 'digital' && (
              <div className="form-group highlight-input">
                <label className="form-label">
                  <Download size={14} /> Fichier 3D à Télécharger (.STL, .OBJ, .GLTF, .ZIP, .BLEND, .FBX)
                </label>

                <div className="image-input-options-row">
                  <label className="btn-file-upload-glow blue-glow">
                    <Upload size={16} />
                    <span>📦 Importer un fichier 3D depuis mon PC</span>
                    <input
                      type="file"
                      accept=".stl,.obj,.gltf,.glb,.zip,.blend,.fbx,.3ds,.usdz"
                      onChange={handle3DFileUpload}
                      className="hidden-file-input"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setDownloadUrl('/downloads/spice_rack_only_for_3dprint.stl');
                      setDownloadFileName('spice_rack_only_for_3dprint.stl');
                    }}
                    className="btn-preset-image"
                  >
                    <Sparkles size={14} />
                    <span>Exemple STL Porte-Épices</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDownloadUrl('/downloads/calibration_cube.stl');
                      setDownloadFileName('calibration_cube.stl');
                    }}
                    className="btn-preset-image"
                  >
                    <Sparkles size={14} />
                    <span>Cube Calibration STL</span>
                  </button>
                </div>

                <div className="url-input-subrow">
                  <input
                    type="text"
                    placeholder="Ou collez un lien de téléchargement (Google Drive, Mega, Dropbox...)"
                    value={downloadUrl}
                    onChange={(e) => setDownloadUrl(e.target.value)}
                    className="form-input"
                  />
                </div>

                {downloadUrl.startsWith('file://') && (
                  <div className="file-url-warning-banner">
                    <AlertCircle size={14} />
                    <span>
                      💡 Pour inclure un fichier local de votre ordinateur, utilisez le bouton <strong>"📦 Importer un fichier 3D depuis mon PC"</strong> ci-dessus !
                    </span>
                  </div>
                )}

                {downloadUrl && !downloadUrl.startsWith('file://') && (
                  <div className="staff-file-preview-card">
                    <div className="file-preview-info">
                      <Download size={18} className="text-cyan" />
                      <div>
                        <strong>Fichier 3D configuré :</strong>
                        <span className="file-name-tag">
                          {downloadFileName || (downloadUrl.length > 55 ? downloadUrl.substring(0, 55) + '...' : downloadUrl)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDownloadUrl('');
                        setDownloadFileName('');
                      }}
                      className="btn-remove-image"
                    >
                      <Trash2 size={12} /> Supprimer
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Color Zones Count Choice */}
            <div className="form-group highlight-input">
              <label className="form-label">
                <Palette size={14} /> Nombre de Zones / Parties de Couleur Choisissables sur l'Objet
              </label>
              <div className="format-pills-selector">
                {[1, 2, 3].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setColorZonesCount(num)}
                    className={`format-pill ${colorZonesCount === num ? 'active' : ''}`}
                  >
                    {num} Couleur{num > 1 ? 's' : ''} ({num === 1 ? 'Une seule couleur' : num === 2 ? 'Principale + Secondaire' : '3 Couleurs'})
                  </button>
                ))}
              </div>
            </div>

            {/* In-Stock Colors Selection with Custom Color Add & Delete */}
            <div className="form-group highlight-input">
              <div className="form-label-row">
                <label className="form-label font-bold flex-row-gap">
                  <Palette size={14} className="text-cyan" /> Palette de Couleurs Proposées (Cliquer pour activer/désactiver)
                </label>
                <span className="price-hint-tag">{selectedStockColors.length} couleur(s) activée(s)</span>
              </div>

              <div className="colors-stock-grid" style={{ marginBottom: '12px' }}>
                {allColors.map((c) => {
                  const isSelected = selectedStockColors.includes(c.name);
                  return (
                    <div
                      key={c.name}
                      onClick={() => handleToggleColor(c.name)}
                      className={`color-stock-pill ${isSelected ? 'active' : ''}`}
                      style={{ position: 'relative', paddingRight: '28px', cursor: 'pointer', userSelect: 'none' }}
                    >
                      <span className="color-dot" style={{ background: c.hex }} />
                      <span>{c.name}</span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteColorFromPalette(c.name, e)}
                        className="btn-delete-color-icon"
                        title={`Supprimer définitivement "${c.name}" de la palette`}
                        style={{
                          position: 'absolute',
                          right: '4px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          color: '#f87171',
                          borderRadius: '4px',
                          padding: '2px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Form to Add New Custom Color */}
              <div style={{ background: 'rgba(0, 240, 255, 0.05)', padding: '12px', borderRadius: '8px', border: '1px dashed rgba(0, 240, 255, 0.25)', marginTop: '8px' }}>
                <label className="form-label font-bold" style={{ fontSize: '0.8rem', marginBottom: '8px', display: 'block', color: '#00f0ff' }}>
                  🎨 Ajouter une Couleur Personnalisée à la Palette
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={customColorHex}
                    onChange={(e) => setCustomColorHex(e.target.value)}
                    style={{ width: '38px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }}
                    title="Choisir la couleur exacte"
                  />
                  <input
                    type="text"
                    placeholder="Nom (ex: Vert Pomme, Rose Néon, Doré...)"
                    value={customColorName}
                    onChange={(e) => setCustomColorName(e.target.value)}
                    className="form-input"
                    style={{ flex: 1, minWidth: '160px', padding: '6px 12px', fontSize: '0.85rem' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomColor}
                    className="btn-primary-glow btn-sm"
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    <PlusCircle size={14} />
                    <span>Créer Couleur</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Per-Color Stock / Rupture Manager */}
            {selectedStockColors.length > 0 && (
              <div className="form-group">
                <label className="form-label">Gestion des Ruptures de Stock par Couleur</label>
                <div className="color-out-manage-grid">
                  {selectedStockColors.map((colorName) => {
                    const isColorOut = outOfStockColors.includes(colorName);
                    return (
                      <div key={colorName} className="color-out-row">
                        <span className="color-out-name">🎨 {colorName}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleColorRupture(colorName)}
                          className={`color-out-toggle-btn ${isColorOut ? 'is-out' : 'is-in'}`}
                        >
                          {isColorOut ? '⚠️ Mettre EN STOCK' : '❌ Marquer en RUPTURE'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Global Out of stock switch */}
            <div className="form-group flex-row-gap">
              <input
                type="checkbox"
                id="outOfStockCheck"
                checked={isInitialOutOfStock}
                onChange={(e) => setIsInitialOutOfStock(e.target.checked)}
                className="custom-checkbox"
              />
              <label htmlFor="outOfStockCheck" className="form-label font-bold cursor-pointer">
                Mettre TOUT l'objet en Rupture de Stock générale
              </label>
            </div>

            {/* Formats Selection */}
            <div className="form-group">
              <label className="form-label">Formats de Fichiers Inclus</label>
              <div className="format-pills-selector">
                {FORMAT_OPTIONS.map((fmt) => (
                  <button
                    type="button"
                    key={fmt}
                    onClick={() => handleToggleFormat(fmt)}
                    className={`format-pill ${selectedFormats.includes(fmt) ? 'active' : ''}`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description détaillée du modèle</label>
              <textarea
                placeholder="Spécifications, conseils d'impression ou détails de licence..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-textarea"
                rows={3}
              />
            </div>

            {/* Success Notification */}
            {successMsg && (
              <div className="staff-success-banner">
                <Check size={18} />
                <span>{successMsgText}</span>
              </div>
            )}

            <button type="submit" className="btn-primary-glow btn-full">
              {editingProductId ? <Check size={18} /> : <PlusCircle size={18} />}
              <span>{editingProductId ? 'Enregistrer les Modifications' : 'Publier le Modèle 3D'}</span>
            </button>
          </form>
        )}

        {/* Tab 2: Existing Staff Products List */}
        {activeTab === 'list' && (
          <div className="staff-list-body">
            <div className="staff-list-toolbar">
              <button onClick={loadSampleProducts} className="btn-glass btn-sm">
                <RefreshCcw size={14} />
                <span>Charger des Modèles de Démo</span>
              </button>

              <button onClick={clearAllProducts} className="btn-danger-glass btn-sm">
                <Trash2 size={14} />
                <span>Vider tout le Catalogue</span>
              </button>
            </div>

            {products.length > 0 ? (
              <div className="staff-products-grid">
                {products.map((p) => {
                  const productInColors = p.inStockColors || ['Cyan Néon', 'Noir Cyber'];
                  const productOutColors = p.outOfStockColors || [];

                  return (
                    <div
                      key={p.id}
                      className={`staff-product-row ${p.isOutOfStock ? 'out-of-stock-row' : ''}`}
                    >
                      <div className="staff-product-info">
                        <div className="staff-type-badge">
                          {p.originalPrice && p.originalPrice > p.price && (
                            <span className="badge-promo-staff">
                              🔥 -{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% PROMO
                            </span>
                          )}
                          {p.isOutOfStock && (
                            <span className="badge-stock-out">
                              <AlertCircle size={12} /> Rupture Globale
                            </span>
                          )}
                          {productOutColors.length > 0 && !p.isOutOfStock && (
                            <span className="badge-stock-out">
                              <AlertCircle size={12} /> {productOutColors.length} couleur(s) en rupture
                            </span>
                          )}
                        </div>
                        <h4 className="staff-prod-name">{p.name}</h4>
                        <span className="staff-prod-meta">
                          {p.category} • {p.price === 0 ? '🎁 GRATUIT (0.00 €)' : `${p.price.toFixed(2)} €`}
                          {p.originalPrice && p.originalPrice > p.price && (
                            <span className="strikethrough-staff-price"> (Ancien: {p.originalPrice.toFixed(2)} €)</span>
                          )}
                          {' • '}{p.colorZonesCount || 1} zone(s) couleur
                        </span>

                        {/* Quick Per-Color Rupture Toggles */}
                        <div className="staff-color-quick-row">
                          {productInColors.map((colorName) => {
                            const isOut = productOutColors.includes(colorName);
                            return (
                              <button
                                key={colorName}
                                onClick={() => toggleColorOutOfStock(p.id, colorName)}
                                className={`color-stock-pill-quick ${isOut ? 'is-out' : 'is-in'}`}
                                title={isOut ? `Remettre ${colorName} en stock` : `Mettre ${colorName} en rupture`}
                              >
                                <span>{colorName}</span>
                                <span className="pill-status">{isOut ? ' (Rupture)' : ' (En stock)'}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="staff-row-actions">
                        <button
                          onClick={() => handleStartEdit(p)}
                          className="edit-prod-btn"
                          title="Modifier les détails de ce modèle 3D"
                        >
                          <Pencil size={14} />
                          <span>Éditer</span>
                        </button>

                        <button
                          onClick={() => toggleOutOfStock(p.id)}
                          className={`stock-toggle-btn ${p.isOutOfStock ? 'is-out' : 'is-in'}`}
                          title={p.isOutOfStock ? 'Remettre en Stock' : 'Mettre en Rupture de Stock'}
                        >
                          {p.isOutOfStock ? 'Remettre en Stock' : 'Rupture'}
                        </button>

                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="delete-prod-btn"
                          title="Supprimer ce modèle 3D"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-staff-box">
                <ShieldAlert size={40} className="empty-icon" />
                <p>Aucun modèle 3D dans le catalogue pour le moment.</p>
                <p className="empty-sub">
                  Créez votre premier modèle 3D ci-dessus ou chargez les modèles de démo.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Salon Staff Statistiques */}
        {activeTab === 'stats' && (
          <div className="staff-stats-body">
            {/* Salon Header Banner */}
            <div className="stats-salon-header">
              <div className="salon-title-row">
                <BarChart2 size={24} className="text-cyan" />
                <div>
                  <h4 className="salon-title">Salon Staff • Analytics & Statistiques des Ventes</h4>
                  <span className="salon-sub">
                    Espace d'analyse confidentiel Staff : classement des modèles du meilleur au moins vendu, avis clients & thèmes les plus populaires
                  </span>
                </div>
              </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="stats-kpi-grid">
              <div className="kpi-card cyan-kpi">
                <div className="kpi-icon-wrapper"><DollarSign size={22} /></div>
                <div className="kpi-info">
                  <span className="kpi-label">Chiffre d'Affaires Cumulé</span>
                  <strong className="kpi-value text-cyan">{totalRevenue.toFixed(2)} €</strong>
                </div>
              </div>

              <div className="kpi-card blue-kpi">
                <div className="kpi-icon-wrapper"><ShoppingBag size={22} /></div>
                <div className="kpi-info">
                  <span className="kpi-label">Total Modèles Vendus</span>
                  <strong className="kpi-value text-cyan">{totalSalesCount} unités</strong>
                </div>
              </div>

              <div className="kpi-card gold-kpi">
                <div className="kpi-icon-wrapper"><Award size={22} /></div>
                <div className="kpi-info">
                  <span className="kpi-label">N°1 Modèle Best-Seller</span>
                  <strong className="kpi-value truncate text-gold">
                    {topSellingProduct ? topSellingProduct.name : 'Aucun'}
                  </strong>
                  <span className="kpi-sub font-bold">{topSellingProduct?.salesCount || 0} ventes</span>
                </div>
              </div>

              <div className="kpi-card purple-kpi">
                <div className="kpi-icon-wrapper"><Tag size={22} /></div>
                <div className="kpi-info">
                  <span className="kpi-label">Thème / Catégorie N°1</span>
                  <strong className="kpi-value">
                    {topSellingCategory && topSellingCategory.totalSales > 0 ? topSellingCategory.category : 'N/A'}
                  </strong>
                  <span className="kpi-sub font-bold">{topSellingCategory?.totalSales || 0} ventes globales</span>
                </div>
              </div>
            </div>

            {/* Section 1: Classement des Ventes (Du Meilleur au Moins Bon) */}
            <div className="stats-section-box">
              <div className="section-header-row">
                <div className="flex-row-gap">
                  <TrendingUp size={18} className="text-cyan" />
                  <h4 className="section-title">1. Classement des Modèles par Ventes (Du Meilleur au Moins Bon)</h4>
                </div>
                <span className="section-badge">{productsBySales.length} modèles au catalogue</span>
              </div>

              <div className="rankings-list">
                {productsBySales.map((p, idx) => {
                  const revenue = (p.salesCount || 0) * p.price;
                  return (
                    <div key={p.id} className={`ranking-row ${idx === 0 ? 'rank-gold' : idx === 1 ? 'rank-silver' : idx === 2 ? 'rank-bronze' : ''}`}>
                      <div className="rank-badge">
                        {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                      </div>

                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="rank-img" />
                      ) : (
                        <div className="rank-img-placeholder">3D</div>
                      )}

                      <div className="rank-info">
                        <div className="rank-title-group">
                          <strong className="rank-name">{p.name}</strong>
                          <span className="rank-category-tag">{p.category}</span>
                          {p.isOutOfStock && <span className="badge-stock-out">Rupture Globale</span>}
                        </div>
                        <span className="rank-price-tag">
                          Prix: {p.price === 0 ? '🎁 GRATUIT' : `${p.price.toFixed(2)} €`} • Avis: ⭐ {p.rating}/5 ({p.reviewsCount} avis)
                        </span>
                      </div>

                      <div className="rank-metrics-group">
                        <div className="metric-box">
                          <span className="metric-lbl">Ventes Totales</span>
                          <strong className="metric-val text-cyan">{p.salesCount || 0} ventes</strong>
                        </div>

                        <div className="metric-box">
                          <span className="metric-lbl">Revenu Généré</span>
                          <strong className="metric-val text-gold">{revenue.toFixed(2)} €</strong>
                        </div>

                        <button
                          onClick={() => incrementSale(p.id)}
                          className="btn-sim-sale"
                          title="Simuler 1 vente supplémentaire pour ce modèle"
                        >
                          <Plus size={14} />
                          <span>+1 Vente</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Classement des Meilleurs Notés */}
            <div className="stats-section-box">
              <div className="section-header-row">
                <div className="flex-row-gap">
                  <Star size={18} className="text-gold" />
                  <h4 className="section-title">2. Classement des Modèles les Mieux Notés par la Communauté</h4>
                </div>
              </div>

              <div className="ratings-grid">
                {productsByRating.slice(0, 6).map((p, idx) => (
                  <div key={p.id} className="rating-card">
                    <div className="rating-card-header">
                      <span className="rating-rank">#{idx + 1}</span>
                      <div className="rating-stars font-bold">
                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                        <span>{p.rating.toFixed(1)} / 5.0</span>
                      </div>
                    </div>
                    <h5 className="rating-card-name">{p.name}</h5>
                    <div className="rating-card-sub">
                      <span>{p.reviewsCount} avis client{p.reviewsCount > 1 ? 's' : ''}</span>
                      <span>• {p.salesCount || 0} ventes</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Quel Thème ou Catégorie vend le plus ? */}
            <div className="stats-section-box">
              <div className="section-header-row">
                <div className="flex-row-gap">
                  <Tag size={18} className="text-cyan" />
                  <h4 className="section-title">3. Ventes par Thème & Catégorie (Quel Thème vend le plus)</h4>
                </div>
              </div>

              <div className="categories-stats-list">
                {categoryStatsList.map((stat, idx) => {
                  const sharePercent = totalSalesCount > 0 ? Math.round((stat.totalSales / totalSalesCount) * 100) : 0;
                  return (
                    <div key={stat.category} className="cat-stat-row">
                      <div className="cat-stat-meta">
                        <div className="cat-stat-title">
                          <span className="cat-rank">#{idx + 1}</span>
                          <strong className="cat-name">{stat.category}</strong>
                          {idx === 0 && stat.totalSales > 0 && <span className="cat-best-badge">🔥 Thème N°1 Vendu</span>}
                        </div>
                        <div className="cat-numbers">
                          <span>{stat.totalSales} ventes</span>
                          <span className="cat-rev">{stat.totalRevenue.toFixed(2)} € CA</span>
                        </div>
                      </div>

                      {/* Share Progress Bar */}
                      <div className="cat-progress-wrapper">
                        <div className="cat-progress-bar" style={{ width: `${Math.max(4, sharePercent)}%` }} />
                        <span className="cat-progress-text">{sharePercent}% des ventes globales</span>
                      </div>

                      {stat.topProduct && (
                        <div className="cat-top-item">
                          <span>Modèle Phare du Thème :</span>
                          <strong className="text-cyan">{stat.topProduct.name} ({stat.topProduct.salesCount || 0} ventes)</strong>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Gestion des Codes Promo */}
        {activeTab === 'promos' && (
          <div className="staff-promos-body">
            {/* Header Banner */}
            <div className="stats-salon-header">
              <div className="salon-title-row">
                <Tag size={24} className="text-cyan" />
                <div>
                  <h4 className="salon-title">Gestionnaire de Codes Promo & Réductions Staff</h4>
                  <span className="salon-sub">
                    Créez vos propres codes de réduction, choisissez le pourcentage de remise et gérez les codes actifs
                  </span>
                </div>
              </div>
            </div>

            {/* Create Promo Code Form */}
            <form onSubmit={handleCreatePromoCode} className="staff-form-body highlight-input">
              <h4 className="form-section-title font-bold flex-row-gap">
                <PlusCircle size={16} className="text-cyan" />
                <span>Créer un Nouveau Code Promo</span>
              </h4>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Code Promo (Lettres & Chiffres) *</label>
                  <input
                    type="text"
                    placeholder="Ex: PROMO2026, SUMMER30, SPECIAL50"
                    value={newPromoCode}
                    onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                    className="form-input"
                    style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}
                    required
                  />
                </div>

                <div className="form-group">
                  <div className="form-label-row">
                    <label className="form-label">Pourcentage de Réduction (%) *</label>
                    <span className="price-hint-tag font-bold text-cyan">-{newPromoPercent}% DE REMISE</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newPromoPercent}
                    onChange={(e) => setNewPromoPercent(parseInt(e.target.value) || 0)}
                    className="form-input"
                    required
                  />
                  <div className="price-presets-row">
                    {[10, 20, 30, 50, 100].map((percent) => (
                      <button
                        key={percent}
                        type="button"
                        onClick={() => setNewPromoPercent(percent)}
                        className={`price-preset-pill promo-pill ${newPromoPercent === percent ? 'active' : ''}`}
                      >
                        {percent === 100 ? '🎁 100% (Gratuit)' : `-${percent}%`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Scope Selector: Tout le site / Thème / Modèle */}
              <div className="form-group highlight-input">
                <label className="form-label font-bold">1. Application du Code Promo (Portée) *</label>
                <div className="fulfillment-grid">
                  <div
                    onClick={() => setNewPromoScope('all')}
                    className={`fulfillment-option-btn ${newPromoScope === 'all' ? 'active' : ''}`}
                    style={{ cursor: 'pointer', padding: '12px' }}
                  >
                    <div className="fulfillment-text">
                      <strong>🌐 Sur tout le site</strong>
                      <span>Réduction sur tous les articles du panier</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setNewPromoScope('category')}
                    className={`fulfillment-option-btn ${newPromoScope === 'category' ? 'active' : ''}`}
                    style={{ cursor: 'pointer', padding: '12px' }}
                  >
                    <div className="fulfillment-text">
                      <strong>🏷️ Un Thème / Catégorie</strong>
                      <span>Seulement sur les modèles de ce thème</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setNewPromoScope('product')}
                    className={`fulfillment-option-btn ${newPromoScope === 'product' ? 'active' : ''}`}
                    style={{ cursor: 'pointer', padding: '12px' }}
                  >
                    <div className="fulfillment-text">
                      <strong>📦 Un Modèle Spécifique</strong>
                      <span>Seulement sur un modèle 3D précis</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conditional target selector */}
              {newPromoScope === 'category' && (
                <div className="form-group highlight-input">
                  <label className="form-label font-bold text-cyan">2. Choisir le Thème / Catégorie Cible *</label>
                  <select
                    value={newTargetCategory}
                    onChange={(e) => setNewTargetCategory(e.target.value as Category)}
                    className="form-input custom-select"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        Thème : {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {newPromoScope === 'product' && (
                <div className="form-group highlight-input">
                  <label className="form-label font-bold text-cyan">2. Choisir le Modèle 3D Cible *</label>
                  <select
                    value={newTargetProductId || (products[0]?.id ?? '')}
                    onChange={(e) => setNewTargetProductId(e.target.value)}
                    className="form-input custom-select"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.category} - {p.price === 0 ? 'Gratuit' : `${p.price.toFixed(2)}€`})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Description / Campagne (Optionnel)</label>
                <input
                  type="text"
                  placeholder="Ex: Offre spéciale abonnés newsletter ou promo de lancement"
                  value={newPromoDesc}
                  onChange={(e) => setNewPromoDesc(e.target.value)}
                  className="form-input"
                />
              </div>

              {promoFormSuccess && (
                <div className="staff-success-banner">
                  <Check size={18} />
                  <span>{promoFormSuccess}</span>
                </div>
              )}

              {promoFormError && (
                <div className="file-url-warning-banner">
                  <AlertCircle size={18} />
                  <span>{promoFormError}</span>
                </div>
              )}

              <button type="submit" className="btn-primary-glow btn-full">
                <PlusCircle size={18} />
                <span>Créer et Activer le Code Promo</span>
              </button>
            </form>

            {/* Existing Promo Codes List */}
            <div className="stats-section-box">
              <div className="section-header-row">
                <div className="flex-row-gap">
                  <Tag size={18} className="text-gold" />
                  <h4 className="section-title">Codes Promo Enregistrés ({promoCodes.length})</h4>
                </div>
              </div>

              <div className="promos-list-grid">
                {promoCodes.map((p) => {
                  const targetProd = products.find((prod) => prod.id === p.targetProductId);
                  return (
                    <div key={p.id} className={`promo-item-card ${!p.isActive ? 'promo-disabled' : ''}`}>
                      <div className="promo-item-header">
                        <div className="promo-code-badge">
                          <span>🎟️ {p.code}</span>
                          <span className="promo-discount-tag font-bold">-{p.discountPercent}%</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => togglePromoCodeActive(p.id)}
                          className={`promo-status-btn ${p.isActive ? 'is-active' : 'is-inactive'}`}
                          title={p.isActive ? 'Désactiver ce code promo' : 'Activer ce code promo'}
                        >
                          {p.isActive ? '✅ Actif' : '❌ Inactif'}
                        </button>
                      </div>

                      {/* Scope Badge */}
                      <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                        {p.scope === 'all' && (
                          <span
                            className="badge-digital"
                            style={{
                              background: 'rgba(0, 240, 255, 0.12)',
                              color: '#00f0ff',
                              border: '1px solid rgba(0, 240, 255, 0.3)'
                            }}
                          >
                            🌐 Valable sur : Tout le site
                          </span>
                        )}
                        {p.scope === 'category' && (
                          <span
                            className="badge-digital"
                            style={{
                              background: 'rgba(112, 0, 255, 0.15)',
                              color: '#b066ff',
                              border: '1px solid rgba(112, 0, 255, 0.3)'
                            }}
                          >
                            🏷️ Valable sur Thème : {p.targetCategory || 'Catégorie'}
                          </span>
                        )}
                        {p.scope === 'product' && (
                          <span
                            className="badge-digital"
                            style={{
                              background: 'rgba(255, 170, 0, 0.15)',
                              color: '#ffbb11',
                              border: '1px solid rgba(255, 170, 0, 0.3)'
                            }}
                          >
                            📦 Valable sur Modèle : {targetProd ? targetProd.name : p.targetProductId}
                          </span>
                        )}
                      </div>

                      <p className="promo-item-desc">{p.description || `Réduction de ${p.discountPercent}%`}</p>

                      <div className="promo-item-footer">
                        <span className="promo-usage">📈 {p.usageCount} utilisation{p.usageCount > 1 ? 's' : ''}</span>

                        <button
                          type="button"
                          onClick={() => deletePromoCode(p.id)}
                          className="delete-prod-btn"
                          title="Supprimer définitivement ce code promo"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
