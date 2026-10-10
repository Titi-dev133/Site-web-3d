import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product3D, ProductReview, CartItem, FilterState, Category, FileFormat, PrintOptions, ShippingAddress, PromoCode, PromoScope } from '../types/product';
import { INITIAL_STAFF_SAMPLES } from '../data/products';

const INITIAL_PROMO_CODES: PromoCode[] = [
  {
    id: 'promo-1',
    code: 'NOEL2026',
    discountPercent: 20,
    description: 'Offre Spéciale Noël (-20% sur tout le site)',
    isActive: true,
    usageCount: 0,
    scope: 'all'
  },
  {
    id: 'promo-2',
    code: 'MAISON30',
    discountPercent: 30,
    description: 'Offre Thématique (-30% sur Cuisine & Maison)',
    isActive: true,
    usageCount: 0,
    scope: 'category',
    targetCategory: 'Cuisine & Art de la Table'
  },
  {
    id: 'promo-3',
    code: 'SANTA100',
    discountPercent: 100,
    description: 'Pass Père Noël 100% Gratuit sur tout le site',
    isActive: true,
    usageCount: 0,
    scope: 'all'
  }
];

interface CartContextType {
  products: Product3D[];
  cart: CartItem[];
  wishlist: string[];
  filters: FilterState;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isStaffOpen: boolean;
  isWishlistOpen: boolean;
  isLoginModalOpen: boolean;
  userPseudo: string;
  isAdmin: boolean;
  userLists: Record<string, CartItem[]>;
  purchasedUserLists: Record<string, boolean>;

  selectedProductModal: Product3D | null;
  promoCode: string;
  discountPercentage: number;
  promoCodes: PromoCode[];
  shippingAddress: ShippingAddress;
  
  // User Profile & Login Actions
  setUserPseudo: (pseudo: string) => void;
  logoutUser: () => void;
  setIsLoginModalOpen: (open: boolean) => void;
  setIsAdmin: (admin: boolean) => void;
  deleteUserList: (pseudo: string) => void;
  clearAllUserLists: () => void;
  toggleUserListPurchasedBySanta: (pseudo: string) => void;

  // Product Management Actions (Staff)
  addProduct: (newProduct: Omit<Product3D, 'id' | 'rating' | 'reviewsCount'>) => void;
  updateProduct: (productId: string, updatedFields: Partial<Product3D>) => void;
  deleteProduct: (productId: string) => void;
  toggleOutOfStock: (productId: string) => void;
  toggleColorOutOfStock: (productId: string, colorName: string) => void;
  loadSampleProducts: () => void;
  clearAllProducts: () => void;
  incrementSale: (productId: string, qty?: number) => void;
  recordSalesBatch: (items: { productId: string; quantity: number }[]) => void;
  setIsStaffOpen: (open: boolean) => void;

  // Promo Code Staff Management Actions
  addPromoCode: (
    code: string,
    discountPercent: number,
    scope: PromoScope,
    targetCategory?: Category,
    targetProductId?: string,
    description?: string
  ) => boolean;
  togglePromoCodeActive: (id: string) => void;
  deletePromoCode: (id: string) => void;

  // E-Commerce & Customer Actions
  addReview: (productId: string, review: Omit<ProductReview, 'id' | 'date'>) => void;
  addToCart: (product: Product3D, format?: FileFormat, selectedColors?: string[], printOptions?: PrintOptions) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: Category) => void;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setIsWishlistOpen: (open: boolean) => void;
  setSelectedProductModal: (product: Product3D | null) => void;
  setShippingAddress: React.Dispatch<React.SetStateAction<ShippingAddress>>;
  applyPromoCode: (code: string) => { success: boolean; message: string; discountPercent?: number };
  removePromoCode: () => void;
  
  // Computed
  totalItems: number;
  subtotal: number;
  discountAmount: number;
  totalPrice: number;
}

const initialFilters: FilterState = {
  searchQuery: '',
  category: 'All',
  maxPrice: 200,
  maxPolygons: 100000,
  format: 'All',
  fulfillmentType: 'All',
  inStockOnly: false,
  sortBy: 'popular'
};

const initialAddress: ShippingAddress = {
  fullName: '',
  street: '',
  city: '',
  postalCode: '',
  country: 'France'
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Ensure storage persistence key is set without purging user data
  useEffect(() => {
    try {
      if (!localStorage.getItem('aether_v4_clean_start')) {
        localStorage.setItem('aether_v4_clean_start', 'true');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Default products: Empty catalog unless loaded by staff or localStorage
  const [products, setProducts] = useState<Product3D[]>(() => {
    try {
      const saved = localStorage.getItem('aether_dynamic_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return INITIAL_STAFF_SAMPLES;
    } catch {
      return INITIAL_STAFF_SAMPLES;
    }
  });

  // Default pseudo is empty until user enters their name
  const [userPseudo, setUserPseudoState] = useState<string>(() => {
    try {
      const hasReset = localStorage.getItem('aether_v4_clean_start');
      if (!hasReset) return '';
      const saved = localStorage.getItem('aether_user_pseudo');
      if (saved && saved !== 'Lucas' && saved !== 'Sophie' && saved !== 'Emma' && saved !== 'Thomas') {
        return saved;
      }
      return '';
    } catch {
      return '';
    }
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem('aether_is_admin') === 'true';
    } catch {
      return false;
    }
  });

  // Always open login modal on site load if user has not chosen a pseudo yet
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(() => {
    try {
      const hasReset = localStorage.getItem('aether_v4_clean_start');
      if (!hasReset) return true;
      const saved = localStorage.getItem('aether_user_pseudo');
      return !saved || saved.trim() === '' || saved === 'Lucas' || saved === 'Sophie';
    } catch {
      return true;
    }
  });

  // Multi-user Xmas Lists map - COMPLETELY EMPTY (0 lists) BY DEFAULT
  const [userLists, setUserLists] = useState<Record<string, CartItem[]>>(() => {
    try {
      const hasReset = localStorage.getItem('aether_v4_clean_start');
      if (!hasReset) {
        localStorage.removeItem('aether_user_christmas_lists');
        return {};
      }

      const saved = localStorage.getItem('aether_user_christmas_lists');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) {
          const nonEmpty: Record<string, CartItem[]> = {};
          Object.entries(parsed).forEach(([key, items]) => {
            if (Array.isArray(items) && items.length > 0) {
              nonEmpty[key] = items;
            }
          });
          return nonEmpty;
        }
      }
      return {};
    } catch {
      return {};
    }
  });

  const [purchasedUserLists, setPurchasedUserLists] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('aether_purchased_user_lists');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Current active user's cart/xmas list items
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (userPseudo && userLists[userPseudo] && Array.isArray(userLists[userPseudo])) {
      return userLists[userPseudo];
    }
    return [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aether_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isStaffOpen, setIsStaffOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedProductModal, setSelectedProductModal] = useState<Product3D | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(initialAddress);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    try {
      const saved = localStorage.getItem('aether_promo_codes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_PROMO_CODES;
    } catch {
      return INITIAL_PROMO_CODES;
    }
  });

  // Helper to notify other tabs/windows in real time
  const notifyBroadcastSync = (actionType: string) => {
    try {
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('aether_lists_realtime');
        bc.postMessage({ type: actionType, timestamp: Date.now() });
        bc.close();
      }
    } catch {
      // Ignore fallback
    }
  };

  // Real-time synchronization across browser tabs & windows
  useEffect(() => {
    let bc: BroadcastChannel | null = null;

    const reloadFromStorage = () => {
      try {
        const savedProds = localStorage.getItem('aether_dynamic_products');
        if (savedProds) {
          const parsed = JSON.parse(savedProds);
          if (Array.isArray(parsed)) setProducts(parsed);
        }

        const savedLists = localStorage.getItem('aether_user_christmas_lists');
        if (savedLists) {
          const parsed = JSON.parse(savedLists);
          if (typeof parsed === 'object' && parsed !== null) {
            setUserLists(parsed);
            const currentPseudo = localStorage.getItem('aether_user_pseudo') || '';
            if (currentPseudo && parsed[currentPseudo]) {
              setCart(parsed[currentPseudo]);
            }
          }
        }

        const savedPurchased = localStorage.getItem('aether_purchased_user_lists');
        if (savedPurchased) setPurchasedUserLists(JSON.parse(savedPurchased));

        const savedWishlist = localStorage.getItem('aether_wishlist');
        if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

        const savedPromos = localStorage.getItem('aether_promo_codes');
        if (savedPromos) setPromoCodes(JSON.parse(savedPromos));
      } catch (err) {
        console.error('Erreur de synchronisation temps réel:', err);
      }
    };

    if ('BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('aether_lists_realtime');
        bc.onmessage = () => {
          reloadFromStorage();
        };
      } catch {
        // ignore
      }
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (
        !e.key ||
        e.key === 'aether_user_christmas_lists' ||
        e.key === 'aether_dynamic_products' ||
        e.key === 'aether_purchased_user_lists' ||
        e.key === 'aether_wishlist' ||
        e.key === 'aether_promo_codes'
      ) {
        reloadFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Persist Products
  useEffect(() => {
    localStorage.setItem('aether_dynamic_products', JSON.stringify(products));
    notifyBroadcastSync('PRODUCTS_UPDATED');
  }, [products]);

  // Persist User Pseudo & Admin
  useEffect(() => {
    if (userPseudo) {
      localStorage.setItem('aether_user_pseudo', userPseudo);
    }
    localStorage.setItem('aether_is_admin', String(isAdmin));
  }, [userPseudo, isAdmin]);

  // Sync Cart -> UserLists (Only keep lists with at least 1 item)
  useEffect(() => {
    if (!userPseudo || userPseudo.trim() === '') return;
    setUserLists((prev) => {
      const copy = { ...prev };
      if (Array.isArray(cart) && cart.length > 0) {
        copy[userPseudo] = cart;
      } else {
        delete copy[userPseudo];
      }
      localStorage.setItem('aether_user_christmas_lists', JSON.stringify(copy));
      return copy;
    });
    localStorage.setItem('aether_cart', JSON.stringify(cart));
    notifyBroadcastSync('USER_LISTS_UPDATED');
  }, [cart, userPseudo]);

  useEffect(() => {
    localStorage.setItem('aether_purchased_user_lists', JSON.stringify(purchasedUserLists));
    notifyBroadcastSync('PURCHASED_LISTS_UPDATED');
  }, [purchasedUserLists]);

  useEffect(() => {
    localStorage.setItem('aether_wishlist', JSON.stringify(wishlist));
    notifyBroadcastSync('WISHLIST_UPDATED');
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('aether_promo_codes', JSON.stringify(promoCodes));
    notifyBroadcastSync('PROMO_CODES_UPDATED');
  }, [promoCodes]);

  const setUserPseudo = (newPseudo: string) => {
    const clean = newPseudo.trim();
    if (!clean) return;
    setUserPseudoState(clean);
    localStorage.setItem('aether_user_pseudo', clean);
    // Switch active cart to the new user's Xmas list
    const userCart = userLists[clean] || [];
    setCart(userCart);
  };

  const logoutUser = () => {
    setUserPseudoState('');
    setCart([]);
    setIsAdmin(false);
    localStorage.removeItem('aether_user_pseudo');
    localStorage.removeItem('aether_cart');
    localStorage.removeItem('aether_is_admin');
  };

  const deleteUserList = (pseudoToDelete: string) => {
    setUserLists((prev) => {
      const copy = { ...prev };
      delete copy[pseudoToDelete];
      localStorage.setItem('aether_user_christmas_lists', JSON.stringify(copy));
      return copy;
    });
    if (userPseudo === pseudoToDelete) {
      setCart([]);
    }
  };

  const clearAllUserLists = () => {
    setUserLists({});
    setCart([]);
    localStorage.removeItem('aether_user_christmas_lists');
    localStorage.removeItem('aether_cart');
  };

  const toggleUserListPurchasedBySanta = (pseudo: string) => {
    setPurchasedUserLists((prev) => ({
      ...prev,
      [pseudo]: !prev[pseudo]
    }));
  };

  // Staff Actions
  const addProduct = (newProd: Omit<Product3D, 'id' | 'rating' | 'reviewsCount'>) => {
    const created: Product3D = {
      ...newProd,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      rating: 0.0,
      reviewsCount: 0,
      isOutOfStock: newProd.isOutOfStock || false,
      outOfStockColors: newProd.outOfStockColors || [],
      colorZonesCount: newProd.colorZonesCount || 1,
      reviews: []
    };
    setProducts((prev) => [created, ...prev]);
  };

  const updateProduct = (productId: string, updatedFields: Partial<Product3D>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updatedFields } : p))
    );
    if (selectedProductModal?.id === productId) {
      setSelectedProductModal((prev) => (prev ? { ...prev, ...updatedFields } : null));
    }
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    if (selectedProductModal?.id === productId) {
      setSelectedProductModal(null);
    }
  };

  const toggleOutOfStock = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updated = { ...p, isOutOfStock: !p.isOutOfStock };
          if (selectedProductModal?.id === productId) {
            setSelectedProductModal(updated);
          }
          return updated;
        }
        return p;
      })
    );
  };

  const toggleColorOutOfStock = (productId: string, colorName: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const currentOut = p.outOfStockColors || [];
          const newOut = currentOut.includes(colorName)
            ? currentOut.filter((c) => c !== colorName)
            : [...currentOut, colorName];
          const updated = { ...p, outOfStockColors: newOut };
          if (selectedProductModal?.id === productId) {
            setSelectedProductModal(updated);
          }
          return updated;
        }
        return p;
      })
    );
  };

  const loadSampleProducts = () => {
    setProducts(INITIAL_STAFF_SAMPLES);
  };

  const clearAllProducts = () => {
    setProducts([]);
    localStorage.removeItem('aether_dynamic_products');
  };

  const incrementSale = (productId: string, qty: number = 1) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updated = {
            ...p,
            salesCount: (p.salesCount || 0) + qty,
            viewsCount: (p.viewsCount || 0) + qty * 3
          };
          if (selectedProductModal?.id === productId) {
            setSelectedProductModal(updated);
          }
          return updated;
        }
        return p;
      })
    );
  };

  const recordSalesBatch = (items: { productId: string; quantity: number }[]) => {
    const qtyMap: Record<string, number> = {};
    items.forEach((item) => {
      qtyMap[item.productId] = (qtyMap[item.productId] || 0) + item.quantity;
    });

    setProducts((prev) =>
      prev.map((p) => {
        if (qtyMap[p.id]) {
          const qty = qtyMap[p.id];
          const updated = {
            ...p,
            salesCount: (p.salesCount || 0) + qty,
            viewsCount: (p.viewsCount || 0) + qty * 4
          };
          if (selectedProductModal?.id === p.id) {
            setSelectedProductModal(updated);
          }
          return updated;
        }
        return p;
      })
    );
  };

  // Customer Reviews Action
  const addReview = (productId: string, reviewData: Omit<ProductReview, 'id' | 'date'>) => {
    const newReview: ProductReview = {
      ...reviewData,
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    };

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const existingReviews = p.reviews || [];
          const updatedReviews = [newReview, ...existingReviews];
          const newCount = updatedReviews.length;
          const totalRatingSum = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
          const newRating = Number((totalRatingSum / newCount).toFixed(1));

          const updatedProd = {
            ...p,
            reviews: updatedReviews,
            reviewsCount: newCount,
            rating: newRating
          };

          if (selectedProductModal?.id === productId) {
            setSelectedProductModal(updatedProd);
          }
          return updatedProd;
        }
        return p;
      })
    );
  };

  // E-Commerce Actions (Adding to Christmas List)
  const addToCart = (
    product: Product3D,
    format?: FileFormat,
    selectedColors?: string[],
    printOptions?: PrintOptions
  ) => {
    if (!product || product.isOutOfStock) return;

    // Check if user has chosen a pseudo first
    if (!userPseudo || userPseudo.trim() === '') {
      setIsLoginModalOpen(true);
      return;
    }

    const selectedFormat = format || (product.formats && product.formats.length > 0 ? product.formats[0] : '.GLTF');
    const colors = selectedColors && selectedColors.length > 0
      ? selectedColors
      : [product.inStockColors?.[0] || 'Standard'];

    setCart((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const existingIndex = safePrev.findIndex(
        (item) =>
          item.product &&
          item.product.id === product.id &&
          item.selectedFormat === selectedFormat &&
          JSON.stringify(item.selectedColors) === JSON.stringify(colors)
      );
      if (existingIndex > -1) {
        const copy = [...safePrev];
        copy[existingIndex].quantity += 1;
        if (printOptions) copy[existingIndex].printOptions = printOptions;
        return copy;
      }
      return [...safePrev, { product, quantity: 1, selectedFormat, selectedColors: colors, printOptions }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => (Array.isArray(prev) ? prev.filter((item) => item.product?.id !== productId) : []));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      if (!Array.isArray(prev)) return [];
      return prev
        .map((item) => {
          if (item.product?.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
    setPromoCode('');
    setDiscountPercentage(0);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const setSearchQuery = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  const setCategoryFilter = (category: Category) => {
    setFilters((prev) => ({ ...prev, category }));
  };

  const setFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const addPromoCode = (
    code: string,
    discountPercent: number,
    scope: PromoScope,
    targetCategory?: Category,
    targetProductId?: string,
    description?: string
  ): boolean => {
    const clean = code.trim().toUpperCase();
    if (!clean) return false;
    if (promoCodes.some((p) => p.code === clean)) return false;

    const created: PromoCode = {
      id: `promo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: clean,
      discountPercent: Math.min(100, Math.max(1, discountPercent)),
      description: description?.trim() || `Réduction de ${discountPercent}%`,
      isActive: true,
      usageCount: 0,
      scope,
      targetCategory: scope === 'category' ? targetCategory : undefined,
      targetProductId: scope === 'product' ? targetProductId : undefined
    };

    setPromoCodes((prev) => [created, ...prev]);
    return true;
  };

  const togglePromoCodeActive = (id: string) => {
    setPromoCodes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const deletePromoCode = (id: string) => {
    setPromoCodes((prev) => prev.filter((p) => p.id !== id));
  };

  const applyPromoCode = (code: string): { success: boolean; message: string; discountPercent?: number } => {
    const clean = code.trim().toUpperCase();
    if (!clean) return { success: false, message: 'Veuillez saisir un code promo.' };

    const found = promoCodes.find((p) => p.code === clean);
    if (!found) {
      return { success: false, message: `Code "${clean}" non reconnu.` };
    }

    if (!found.isActive) {
      return { success: false, message: `Le code "${clean}" est actuellement désactivé par le staff.` };
    }

    // Check Scope Constraints
    if (found.scope === 'category' && found.targetCategory) {
      const hasCat = cart.some((item) => item.product?.category === found.targetCategory);
      if (cart.length > 0 && !hasCat) {
        return {
          success: false,
          message: `⚠️ Le code "${clean}" (-${found.discountPercent}%) s'applique uniquement à la catégorie "${found.targetCategory}". Aucun modèle de cette catégorie dans votre liste.`
        };
      }
    }

    if (found.scope === 'product' && found.targetProductId) {
      const hasProd = cart.some((item) => item.product?.id === found.targetProductId);
      const targetProdName = products.find((p) => p.id === found.targetProductId)?.name || 'spécifique';
      if (cart.length > 0 && !hasProd) {
        return {
          success: false,
          message: `⚠️ Le code "${clean}" (-${found.discountPercent}%) s'applique uniquement au modèle "${targetProdName}". Ce modèle n'est pas dans votre liste.`
        };
      }
    }

    setPromoCode(clean);
    setDiscountPercentage(found.discountPercent);

    // Increment usage count
    setPromoCodes((prev) =>
      prev.map((p) => (p.id === found.id ? { ...p, usageCount: p.usageCount + 1 } : p))
    );

    const scopeDesc =
      found.scope === 'all'
        ? 'sur tout le site'
        : found.scope === 'category'
        ? `sur la catégorie ${found.targetCategory}`
        : `sur le modèle sélectionné`;

    return {
      success: true,
      message: `Code promo "${clean}" appliqué (-${found.discountPercent}% ${scopeDesc}) !`,
      discountPercent: found.discountPercent
    };
  };

  const removePromoCode = () => {
    setPromoCode('');
    setDiscountPercentage(0);
  };

  const totalItems = (Array.isArray(cart) ? cart : []).reduce((sum, item) => sum + (item.quantity || 1), 0);
  const subtotal = (Array.isArray(cart) ? cart : []).reduce((sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1), 0);

  const appliedPromoObj = promoCodes.find((p) => p.code === promoCode && p.isActive);
  let discountAmount = 0;

  if (appliedPromoObj && cart.length > 0) {
    if (appliedPromoObj.scope === 'all') {
      const sub = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
      discountAmount = (sub * appliedPromoObj.discountPercent) / 100;
    } else if (appliedPromoObj.scope === 'category' && appliedPromoObj.targetCategory) {
      const eligibleSub = cart
        .filter((item) => item.product?.category === appliedPromoObj.targetCategory)
        .reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
      discountAmount = (eligibleSub * appliedPromoObj.discountPercent) / 100;
    } else if (appliedPromoObj.scope === 'product' && appliedPromoObj.targetProductId) {
      const eligibleSub = cart
        .filter((item) => item.product?.id === appliedPromoObj.targetProductId)
        .reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
      discountAmount = (eligibleSub * appliedPromoObj.discountPercent) / 100;
    } else {
      const sub = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
      discountAmount = (sub * appliedPromoObj.discountPercent) / 100;
    }
  } else if (discountPercentage > 0) {
    const sub = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
    discountAmount = (sub * discountPercentage) / 100;
  }

  const totalPrice = Math.max(0, subtotal - discountAmount);

  return (
    <CartContext.Provider
      value={{
        products,
        cart,
        wishlist,
        filters,
        isCartOpen,
        isCheckoutOpen,
        isStaffOpen,
        isWishlistOpen,
        isLoginModalOpen,
        userPseudo,
        isAdmin,
        userLists,
        purchasedUserLists,
        selectedProductModal,
        promoCode,
        discountPercentage,
        promoCodes,
        shippingAddress,
        setUserPseudo,
        logoutUser,
        setIsLoginModalOpen,
        setIsAdmin,
        deleteUserList,
        clearAllUserLists,
        toggleUserListPurchasedBySanta,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleOutOfStock,
        toggleColorOutOfStock,
        loadSampleProducts,
        clearAllProducts,
        incrementSale,
        recordSalesBatch,
        setIsStaffOpen,
        addPromoCode,
        togglePromoCodeActive,
        deletePromoCode,
        addReview,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isWishlisted,
        setSearchQuery,
        setCategoryFilter,
        setFilter,
        resetFilters,
        setIsCartOpen,
        setIsCheckoutOpen,
        setIsWishlistOpen,
        setSelectedProductModal,
        setShippingAddress,
        applyPromoCode,
        removePromoCode,
        totalItems,
        subtotal,
        discountAmount,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
