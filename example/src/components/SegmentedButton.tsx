import {useEffect, useMemo, useRef} from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

export type SegmentedButtonTab<T> = {
  label: string;
  value: T;
};

type SegmentedButtonProps<T> = {
  selectedTab: T;
  tabs: SegmentedButtonTab<T>[];
  onTabChanged?: (value: T, index: number) => void;
};

const SegmentedButton = <T,>({
  selectedTab,
  tabs,
  onTabChanged,
}: SegmentedButtonProps<T>) => {
  const selectedTabIndex = useMemo(
    () => tabs.findIndex(tab => tab.value === selectedTab),
    [tabs, selectedTab],
  );
  const animValue = useRef(new Animated.Value(selectedTabIndex)).current;
  const width = useWindowDimensions().width - 40;
  const tabWidth = width / tabs.length;

  useEffect(() => {
    Animated.spring(animValue, {
      toValue: selectedTabIndex,
      tension: 100,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [selectedTabIndex, animValue]);

  const translateX = animValue.interpolate({
    inputRange: tabs.map((_, index) => index),
    outputRange: tabs.map((_, index) => index * tabWidth),
  });

  const indicatorStyle = [
    styles.indicator,
    {
      width: tabWidth - 4,
      transform: [{translateX}],
    },
  ];
  return (
    <View style={styles.container}>
      <Animated.View style={indicatorStyle} />
      {tabs.map((value, index) => (
        <Tab
          key={index}
          tab={value}
          index={index}
          onChanged={onTabChanged}
          tabWidth={tabWidth}
        />
      ))}
    </View>
  );
};

const Tab = <T,>({
  index = 0,
  tab,
  tabWidth,
  onChanged,
}: {
  index: number;
  tab: SegmentedButtonTab<T>;
  tabWidth: number;
  onChanged?: (value: any, index: number) => void;
}) => {
  const tabStyle = [styles.tab, {width: tabWidth}];
  return (
    <TouchableOpacity
      onPress={() => onChanged?.(tab.value, index)}
      style={tabStyle}
      activeOpacity={0.85}>
      <Text numberOfLines={1} style={styles.tabTextStyle}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7F7F8',
    flexDirection: 'row',
    padding: 2,
    borderRadius: 8,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    left: 2,

    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000000',
    shadowRadius: 2,
    elevation: 2,
    shadowOpacity: 0.4,
    shadowOffset: {width: 0, height: 2},
  },
  tabTextStyle: {
    textAlign: 'center',
    fontWeight: '400',
    fontSize: 14,
    padding: 10,
    fontFamily: 'GeneralSans-Regular',
    color: '#131503',
    zIndex: 1,
  },
});

export default SegmentedButton;
