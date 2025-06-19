import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface ProgressBarProps {
    size?: number;
    strokeWidth?: number;
    backgroundColor?: string;
    progressColor?: string;
    arcLength?: number;
    padding?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    size = 100,
    strokeWidth = 8,
    backgroundColor = '#E8E8F0',
    progressColor = '#4F7EFF',
    arcLength = 25,
    padding = 7,
}) => {
    const rotateValue = useRef(new Animated.Value(0)).current;

    const adjustedSize = size - (padding * 2);
    const radius = (adjustedSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashLength = (circumference * arcLength) / 100;
    const gapLength = circumference - dashLength;

    useEffect(() => {
        const rotate = () => {
            rotateValue.setValue(0);
            Animated.timing(rotateValue, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }).start(() => rotate());
        };
        rotate();
    }, []);

    const AnimatedCircle = Animated.createAnimatedComponent(Circle);

    const rotation = rotateValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={[styles.container, { width: size, height: size, backgroundColor: backgroundColor }]}>
            <Animated.View
                style={{
                    transform: [{ rotate: rotation }],
                    position: 'absolute',
                    width: size,
                    height: size,
                }}
            >
                <Svg width={size} height={size}>
                    <AnimatedCircle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={progressColor}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={`${dashLength} ${gapLength}`}
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                </Svg>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '50%',
    },
    svg: {
        position: 'absolute',
    },
    textContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 14,
        fontWeight: '500',
    },
});

export default ProgressBar;