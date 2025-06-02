import {Animated} from 'react-native';
import React, {useEffect, useRef} from 'react';

const AnimatedIcon = ({
  animatedToValue,
  children,
}: {
  animatedToValue?: number;
  children: React.ReactElement;
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: animatedToValue ?? 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [animatedValue, animatedToValue]);

  const rotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const animatedStyle = {
    transform: [{rotate: rotate}],
  };
  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

export default AnimatedIcon;
