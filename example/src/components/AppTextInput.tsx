import { Colors } from '../constants/Color';
import { Edit } from 'iconsax-react-native';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { type KeyboardTypeOptions } from 'react-native';
import { type ViewStyle } from 'react-native';

const AppTextInput = ({
  title,
  style,
  keyboardType,
  maxLength,
  value,
  hasTrailingIcon = true,
  onChangeText,
  placeholder,
}: {
  title: string;
  style?: ViewStyle;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  value?: string;
  hasTrailingIcon?: boolean;
  onChangeText?: (text: string) => void;
  placeholder?: string;
}) => {
  const textInputStyle = [
    styles.textInput,
    { paddingEnd: hasTrailingIcon ? 16 : 0 },
  ];
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.textInputContainer}>
        <TextInput
          style={textInputStyle}
          keyboardType={keyboardType}
          maxLength={maxLength}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#000"
        />
        {hasTrailingIcon && <Edit color={Colors.primary} size={20} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 7 },
  title: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'GeneralSans-Light',
    marginBottom: 5,
  },
  textInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#F7F7F8',
    borderRadius: 4,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    fontFamily: 'GeneralSans-Medium',
    fontWeight: '400',
    height: 44,
  },
});
export default AppTextInput;
