import Svg, { Path, type SvgProps } from 'react-native-svg';
import { MonaColors } from '../../utils/theme';

const BankIcon = (props: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
    <Path
      d="M2.79767 15.6001H17.1977M9.99767 10.0001V15.6001M14.7977 10.0001V15.6001M5.19767 10.0001V15.6001M10.3554 2.97899L16.8697 6.23612C17.5493 6.5759 17.3074 7.60011 16.5477 7.60011H3.44764C2.68788 7.60011 2.4461 6.5759 3.12565 6.23612L9.63991 2.97899C9.86511 2.86638 10.1302 2.86638 10.3554 2.97899Z"
      stroke={props.color ?? MonaColors.primary}
      strokeWidth={0.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default BankIcon;
