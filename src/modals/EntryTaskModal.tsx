import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ForwardedRef,
} from 'react';
import { Keyboard, StyleSheet, Text, TextInput, View } from 'react-native';
import { OtpInput } from 'react-native-otp-entry';
import MonaButton from '../components/MonaButton';
import { TaskType, type PinEntryTask } from '../types';
import { MonaColors } from '../utils/theme';

export type EntryTaskModalRef = {
  clearPin: () => void;
};

const EntryTaskModal = forwardRef(
  (
    {
      pinEntryTask,
      onSubmit,
      close = () => { },
    }: {
      pinEntryTask: PinEntryTask;
      onSubmit: (data: string) => void;
      close?: () => void;
    },
    ref: ForwardedRef<EntryTaskModalRef>
  ) => {
    const PIN_LENGTH = pinEntryTask.fieldLength ?? 4;
    const [pin, setPin] = useState('');
    const [_, setFocusedIndex] = useState(0);

    // Create refs for each input
    const inputRefs = useRef<Array<TextInput | null>>([]);

    // Initialize refs array
    useEffect(() => {
      inputRefs.current = Array(PIN_LENGTH).fill(null);
    }, [PIN_LENGTH]);

    // Auto-advance to next input when typing
    useEffect(() => {
      // Focus the appropriate input based on PIN length
      if (pin.length < PIN_LENGTH) {
        inputRefs.current[pin.length]?.focus();
      } else {
        // When all digits are entered, dismiss keyboard
        Keyboard.dismiss();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pin]);

    // Handle pin input changes
    const handlePinChange = (text: string) => {
      // Only accept numbers and limit to PIN_LENGTH
      const newPin = text.replace(/[^0-9]/g, '').slice(0, PIN_LENGTH);
      setPin(newPin);

      // Move focus forward if adding digits
      if (newPin.length < PIN_LENGTH) {
        setFocusedIndex(newPin.length);
      }
    };

    // Handle backspace for removing digits
    // const handleKeyPress = (e: any, index: number) => {
    //   if (
    //     e.nativeEvent.key === 'Backspace' &&
    //     pin.length > 0 &&
    //     index > 0 &&
    //     !pin[index]
    //   ) {
    //     // Remove the last digit
    //     const newPin = pin.slice(0, pin.length - 1);
    //     setPin(newPin);

    //     // Move focus backward
    //     if (index > 0) {
    //       inputRefs.current[index - 1]?.focus();
    //       setFocusedIndex(index - 1);
    //     }
    //   }
    // };

    // Clear pin
    const clearPin = () => {
      setPin('');
      setFocusedIndex(0);
      inputRefs.current[0]?.focus();
    };

    // Focus handling
    // const handleFocus = (index: number) => {
    //   setFocusedIndex(index);

    //   if (index > pin.length) {
    //     inputRefs.current[pin.length]?.focus();
    //   }
    // };

    useImperativeHandle(ref, () => ({
      clearPin,
    }));

    return (
      <>
        <Text style={styles.sheetTitle}>
          {pinEntryTask.taskType === TaskType.PIN
            ? 'Enter Your Transaction PIN'
            : 'Please pass the transaction OTP'}
        </Text>
        <Text style={styles.sheetContent}>{pinEntryTask.taskDescription}</Text>

        <View style={styles.pinInputContainer}>
          <OtpInput
            numberOfDigits={PIN_LENGTH}
            focusColor={MonaColors.secondary}
            autoFocus={true}
            hideStick={true}
            blurOnFilled={true}
            type="numeric"
            secureTextEntry={true}
            focusStickBlinkingDuration={500}
            onFocus={() => console.log('Focused')}
            onBlur={() => console.log('Blurred')}
            onTextChange={handlePinChange}
            onFilled={(text) => console.log(`OTP is ${text}`)}
            theme={{
              containerStyle: styles.pinInputContainer,
              pinCodeContainerStyle: styles.pinInput,
              pinCodeTextStyle: styles.pinText,
              focusStickStyle: styles.pinInputFocused,
              //   focusedPinCodeContainerStyle: styles.activePinCodeContainer,
              //   placeholderTextStyle: styles.placeholderText,
              //   filledPinCodeContainerStyle: styles.filledPinCodeContainer,
              //   disabledPinCodeContainerStyle:
              //     styles.disabledPinCodeContainer,
            }}
          />
          {/* {Array.from({ length: PIN_LENGTH }).map((_, index) => {
            const isFocused = focusedIndex === index;
            const digit = pin[index] || '0';

            return (
              
              <TextInput
                key={index}
                ref={(ref) => {
                  if (ref) {
                    inputRefs.current[index] = ref;
                  }
                }}
                style={[
                  styles.pinInput,
                  isFocused && styles.pinInputFocused,
                  digit ? styles.pinInputFilled : null,
                ]}
                secureTextEntry
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => {
                  // Update the pin at this specific position
                  const newPin =
                    pin.slice(0, index) + text + pin.slice(index + 1);
                  handlePinChange(newPin);
                }}
                onKeyPress={(e) => handleKeyPress(e, index)}
                onFocus={() => handleFocus(index)}
                caretHidden={true}
              />
            );
          })} */}
        </View>

        <MonaButton
          text="Submit"
          onPress={() => {
            if (pin.length === PIN_LENGTH) {
              close();
              onSubmit(pin);
            }
          }}
          enabled={pin.length === PIN_LENGTH}
        />
      </>
    );
  }
);

const styles = StyleSheet.create({
  sheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: -0.48,
    lineHeight: 24,
  },
  sheetContent: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 20,
    letterSpacing: -0.48,
    lineHeight: 20,
  },
  pinInputContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 20,
    backgroundColor: MonaColors.white,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  pinText: {
    fontSize: 18,
    fontWeight: 500,
    lineHeight: 24,
    letterSpacing: -0.03,
  },
  pinInput: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    width: 44,
    height: 44,
    borderColor: 'transparent',
    borderWidth: 1,
    borderRadius: 8,
    color: MonaColors.secondary,
    backgroundColor: '#F7F7F8',
  },
  pinInputFocused: {
    borderColor: MonaColors.secondary,
    borderWidth: 1,
  },
  pinInputFilled: {
    backgroundColor: '#F7F7F8',
  },
});

export default EntryTaskModal;
