export type Category = 
  | 'All' 
  | 'Rangement & Organisation' 
  | 'Cuisine & Art de la Table' 
  | 'Décoration & Maison' 
  | 'Outillage & Bricolage' 
  | 'Salle de Bain & Sanitaire' 
  | 'Électroménager & Tech' 
  | 'Jardin & Extérieur';

export interface UserChristmasList {
  userPseudo: string;
  updatedAt: string;
  items: CartItem[];
  isPurchasedBySanta?: boolean;
}

export type FileFormat = '.GLTF' | '.FBX' | '.OBJ' | '.STL' | '.USDZ' | '.BLEND';

export type RenderMode = 'standard' | 'wireframe' | 'glow' | 'chrome';

export type FulfillmentType = 'digital' | 'print';

export type PrintMaterial = 'PLA Écologique' | 'Résine SLA Haute Définition' | 'ABS Résistant';

export interface ProductReview {
  id: string;
  author: string;
  rating: number; // 1 to 5 stars
  comment: string;
  date: string;
}

export interface PrintOptions {
  material: PrintMaterial;
  colors: string[]; // Selected colors for object color zones
  scalePercent: number; // 100, 150, 200
  layerHeight: string;
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Product3D {
  id: string;
  name: string;
  subtitle: string;
  category: Category;
  price: number;
  originalPrice?: number; // Optional original price for discount display
  rating: number;
  reviewsCount: number;
  polygons: number;
  vertices: number;
  formats: FileFormat[];
  primaryColor: string;
  secondaryColor: string;
  description: string;
  
  // Image & Stock options
  imageUrl?: string; 
  inStockColors?: string[]; // All color choices offered for this product
  outOfStockColors?: string[]; // Colors marked out of stock by staff
  isOutOfStock?: boolean; // Global out of stock status
  colorZonesCount?: number; // Number of customizable color slots (1 to 3, default 1)

  // Customer Reviews & Ratings
  reviews?: ProductReview[];
  
  // Fulfillment Config
  fulfillmentType: FulfillmentType;
  downloadUrl?: string; 
  printEstimatedDays?: number; 
  
  isFeatured?: boolean;
  isNew?: boolean;
  tags: string[];
  texturesIncluded: string[];
  rigged: boolean;
  animated: boolean;

  // Statistics
  salesCount?: number;
  viewsCount?: number;
}

export interface CartItem {
  product: Product3D;
  quantity: number;
  selectedFormat: FileFormat;
  selectedColors: string[];
  printOptions?: PrintOptions;
}

export interface FilterState {
  searchQuery: string;
  category: Category;
  maxPrice: number;
  maxPolygons: number;
  format: FileFormat | 'All';
  fulfillmentType: FulfillmentType | 'All';
  inStockOnly: boolean;
  onSaleOnly?: boolean;
  sortBy: 'popular' | 'price-low' | 'price-high' | 'polys';
}

export type PromoScope = 'all' | 'category' | 'product';

export interface PromoCode {
  id: string;
  code: string;
  discountPercent: number;
  description?: string;
  isActive: boolean;
  usageCount: number;
  scope: PromoScope;
  targetCategory?: Category;
  targetProductId?: string;
}
