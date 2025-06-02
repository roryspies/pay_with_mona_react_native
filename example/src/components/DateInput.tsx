import { Colors } from '../constants/Color';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Edit } from 'iconsax-react-native';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { type ViewStyle } from 'react-native';
import DatePicker from 'react-native-date-picker';

const DateInput = ({
  title,
  style,
  value,
  hasTrailingIcon = true,
  onChange,
  placeholder,
}: {
  title: string;
  style?: ViewStyle;
  value?: Date | null;
  hasTrailingIcon?: boolean;
  onChange?: (date: Date) => void;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  const textInputStyle = [
    styles.textInput,
    { paddingEnd: hasTrailingIcon ? 16 : 0 },
  ];
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      <Pressable
        style={styles.textInputContainer}
        onPress={() => {
          if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
              value: value ?? new Date(),
              mode: 'date',
              onChange: (_, selectedDate) => {
                if (!selectedDate) {
                  return;
                }
                DateTimePickerAndroid.open({
                  value: selectedDate,
                  mode: 'time',
                  onChange: (__, selectedTime) => {
                    if (selectedTime) {
                      const finalDateTime = new Date(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth(),
                        selectedDate.getDate(),
                        selectedTime.getHours(),
                        selectedTime.getMinutes()
                      );
                      onChange?.(finalDateTime);
                    }
                  },
                });
              },
            });
          } else {
            setOpen(true);
          }
        }}
      >
        <DatePicker
          modal
          open={open}
          date={value ?? new Date()}
          onConfirm={(date) => {
            setOpen(false);
            onChange?.(date);
          }}
          onCancel={() => {
            setOpen(false);
          }}
        />
        <TextInput
          style={textInputStyle}
          readOnly={true}
          value={value?.toLocaleString('en-US')}
          placeholder={placeholder}
          placeholderTextColor="#000"
          pointerEvents="none"
        />
        {hasTrailingIcon && <Edit color={Colors.primary} size={20} />}
      </Pressable>
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
export default DateInput;
