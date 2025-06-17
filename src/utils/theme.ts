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

type Listener = (colors: typeof defaultTheme) => void;
const listeners: Listener[] = [];

export const setMonaColors = (colors: Partial<typeof defaultTheme>) => {
  MonaColors = { ...defaultTheme, ...colors };
  listeners.forEach((cb) => cb(MonaColors));
};

export const getMonaColors = () => MonaColors;

export const subscribeMonaColors = (cb: Listener) => {
  listeners.push(cb);
  // Return a cleanup function to unsubscribe
  return () => {
    const idx = listeners.indexOf(cb);
    if (idx > -1) listeners.splice(idx, 1);
  };
};