export let Colors = {
  primary: '#3045FB',
  secondary: '#6c757d',
  success: '#28a745',
  info: '#17a2b8',
  warning: '#ffc107',
  danger: '#dc3545',
  light: '#f8f9fa',
  dark: '#343a40',
  white: '#ffffff',
  black: '#000000',
  gray: '#6c757d',
  neutral: '#E7E8E6',
  transparent: 'transparent',
};

export const setColors = (newColors: Partial<typeof Colors>) => {
  Colors = { ...Colors, ...newColors };
};

export function withAlpha(hex: string, alpha: number) {
  const a = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return `#${a}${hex.replace('#', '')}`;
}