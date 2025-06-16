import Svg, { Path, type SvgProps } from 'react-native-svg';

const DirectionsIcon = (props: SvgProps) => (
  <Svg width="23" height="22" viewBox="0 0 23 22" fill="none" {...props}>
    <Path
      d="M9.16797 14H19.8346M19.8346 14L17.168 11.3333M19.8346 14L17.168 16.6666"
      stroke="#C6C7C3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3.16797 7.99998H13.8346M3.16797 7.99998L5.83464 5.33331M3.16797 7.99998L5.83464 10.6666"
      stroke="#C6C7C3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default DirectionsIcon;
