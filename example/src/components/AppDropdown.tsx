import { StyleSheet, Text } from 'react-native';
import { useState } from 'react';
import { Dropdown } from 'react-native-element-dropdown';
import { Colors } from '../constants/Color';
import { ArrowCircleDown } from 'iconsax-react-native';
import Column from './Column';
import AnimatedIcon from './AnimatedIcon';

export type AppDropdownType<T> = {
  label: string;
  value: T;
};

type AppDropdownProp<T> = {
  title: string;
  value: T;
  placeholder?: string;
  data: AppDropdownType<T>[];
  onChanged?: (value: T) => void;
};

const AppDropdown = <T,>({
  title,
  value,
  data,
  placeholder = 'Please select',
  onChanged,
}: AppDropdownProp<T>) => {
  const [isFocus, setIsFocus] = useState(false);
  return (
    <Column>
      <Text style={styles.title}>{title}</Text>
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        iconStyle={styles.iconStyle}
        data={data}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          onChanged?.((item as AppDropdownType<T>).value);
          setIsFocus(false);
        }}
        renderRightIcon={() => (
          <AnimatedIcon animatedToValue={isFocus ? 1 : 0}>
            <ArrowCircleDown size={20} color={Colors.primary} />
          </AnimatedIcon>
        )}
      />
    </Column>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'GeneralSans-Light',
    marginBottom: 5,
  },
  dropdown: {
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F7F7F8',
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
    fontFamily: 'GeneralSans-Medium',
  },
  placeholderStyle: {
    fontSize: 14,
    fontFamily: 'GeneralSans-Medium',
    lineHeight: 20,
    letterSpacing: -0.48,
  },
  selectedTextStyle: {
    fontWeight: '400',
    fontSize: 14,
    fontFamily: 'GeneralSans-Medium',
    lineHeight: 20,
    letterSpacing: -0.48,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
});

export default AppDropdown;
