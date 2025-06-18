import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgSecuritySafe = (props: SvgProps) => (
  <Svg
    fill="none"
    viewBox="0 0 20 20"
    {...props}
  >
    <Path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M17.424 9.267c0 4.075-2.958 7.891-7 9.008a1.63 1.63 0 0 1-.85 0c-4.041-1.117-7-4.933-7-9.008V5.608c0-.683.517-1.458 1.159-1.716l4.641-1.9a4.32 4.32 0 0 1 3.258 0l4.642 1.9c.634.258 1.159 1.033 1.159 1.716z"
    />
    <Path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.5}
      d="M9.999 10.416a1.667 1.667 0 1 0 0-3.333 1.667 1.667 0 0 0 0 3.333M10 10.416v2.5"
    />
  </Svg>
);
export default SvgSecuritySafe;
