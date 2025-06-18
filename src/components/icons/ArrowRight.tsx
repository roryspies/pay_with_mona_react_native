import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgArrowRight = (props: SvgProps) => (
  <Svg
    fill="none"
    viewBox="0 0 7 10"
    {...props}
  >
    <Path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M1.5 1.25 5.25 5 1.5 8.75"
    />
  </Svg>
);
export default SvgArrowRight;
