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
  const a = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return `#${a}${hex.replace('#', '')}`;
}