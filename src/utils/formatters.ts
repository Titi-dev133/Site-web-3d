export const formatPrice = (price: number): string => {
  if (price === 0) return 'GRATUIT';
  return `${price.toFixed(2)} €`;
};

export const formatPriceDetailed = (price: number): string => {
  if (price === 0) return '0.00 € (Gratuit)';
  return `${price.toFixed(2)} €`;
};
