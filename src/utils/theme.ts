export const defaultTheme = {
  bgGrey: '#F2F2F3',
  white: '#FFFFFF',
  textHeading: '#131503',
  textBody: '#6A6C60',
  primary: '#006400',
  secondary: '#FE7048',
  textInput: '#F7F7F8',
  hintText: '#999999',
  error: '#DE102A',
  success: '#0F973D',
  neutral: '#E7E8E6',
};

export let MonaColors = defaultTheme;

export const setMonaColors = (colors: Partial<typeof defaultTheme>) => {
  MonaColors = { ...defaultTheme, ...colors };
};

export const getMonaColors = () => MonaColors;

export function withAlpha(hex: string, alpha: number) {
  const hexClean = hex.replace('#', '');
  const a = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return `#${hexClean}${a}`;
}

export function lighten(hex: string, percent: number) {
  const num = parseInt(hex.replace('#', ''), 16);
  let r = (num >> 16) + Math.round(2.55 * percent);
  let g = ((num >> 8) & 0x00FF) + Math.round(2.55 * percent);
  let b = (num & 0x0000FF) + Math.round(2.55 * percent);

  r = r < 255 ? (r < 0 ? 0 : r) : 255;
  g = g < 255 ? (g < 0 ? 0 : g) : 255;
  b = b < 255 ? (b < 0 ? 0 : b) : 255;

  return "#" + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}