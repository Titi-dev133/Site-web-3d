export const COLOR_HEX_MAP: Record<string, string> = {
  'Cyan Néon': '#00f0ff',
  'Noir Cyber': '#111122',
  'Blanc Pur': '#ffffff',
  'Rouge Néon': '#ff0055',
  'Or Métallisé': '#ffaa00',
  'Vert Émeraude': '#00ff66',
  'Violet Spatiale': '#7000ff',
  'Bleu Canard': '#008080',
  'Jaune Moutarde': '#e1ad01',
  'Gris Anthracite': '#36454f',
  'Rose Poudré': '#ffb6c1',
  'Terracotta': '#e2725b',
  'Vert Sauge': '#9caf88'
};

export function getColorHex(colorNameOrHex: string, fallback: string = '#00f0ff'): string {
  if (!colorNameOrHex) return fallback;
  if (colorNameOrHex.startsWith('#')) return colorNameOrHex;
  return COLOR_HEX_MAP[colorNameOrHex] || fallback;
}
