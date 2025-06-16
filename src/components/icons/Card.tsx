import Svg, { Path, type SvgProps } from 'react-native-svg';
import { MonaColors } from '../../utils/theme';

const CardIcon = (props: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
    <Path
      d="M2 7.2041H18"
      stroke={props.color ?? MonaColors.primary}
      strokeWidth={0.9}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5.19922 13.6045H6.79922"
      stroke={props.color ?? MonaColors.primary}
      strokeWidth={0.9}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8.79688 13.6045H11.9969"
      stroke={props.color ?? MonaColors.primary}
      strokeWidth={0.9}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5.552 3.2041H14.44C17.288 3.2041 18 3.9081 18 6.7161V13.2841C18 16.0921 17.288 16.7961 14.448 16.7961H5.552C2.712 16.8041 2 16.1001 2 13.2921V6.7161C2 3.9081 2.712 3.2041 5.552 3.2041Z"
      stroke={props.color ?? MonaColors.primary}
      strokeWidth={0.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default CardIcon;
