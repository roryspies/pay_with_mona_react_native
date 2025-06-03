import { View, Text, StyleSheet, TextInput, Keyboard } from 'react-native';
import { MonaColors } from '../utils/config';
import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  type ForwardedRef,
  useImperativeHandle,
} from 'react';
import MonaButton from '../components/MonaButton';
import { TaskType, type ModalType, type PinEntryTask } from '../types';
import MonaModal from './MonaModal';

const EntryTaskModal = forwardRef(
  (
    {
      pinEntryTask,
      onSubmit,
    }: {
      pinEntryTask: PinEntryTask;
      onSubmit: (pin: string) => void;
    },
    ref: ForwardedRef<ModalType>
  ) => {
    const PIN_LENGTH = pinEntryTask.fieldLength ?? 4;
    const [pin, setPin] = useState('');
    const [focusedIndex, setFocusedIndex] = useState(0);
    const [showModal, setShowModal] = useState<boolean>(false);

    const open = () => {
      setShowModal(true);
    };
    const close = () => {
      setShowModal(false);
    };

    useImperativeHandle(ref, () => ({
      open,
      close,
    }));

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
    const handleKeyPress = (e: any, index: number) => {
      if (
        e.nativeEvent.key === 'Backspace' &&
        pin.length > 0 &&
        index > 0 &&
        !pin[index]
      ) {
        // Remove the last digit
        const newPin = pin.slice(0, pin.length - 1);
        setPin(newPin);

        // Move focus backward
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
          setFocusedIndex(index - 1);
        }
      }
    };

    // Clear pin
    const clearPin = () => {
      setPin('');
      setFocusedIndex(0);
      inputRefs.current[0]?.focus();
    };

    // Focus handling
    const handleFocus = (index: number) => {
      setFocusedIndex(index);

      if (index > pin.length) {
        inputRefs.current[pin.length]?.focus();
      }
    };

    const handleClose = () => {
      clearPin();
    };

    return (
      <MonaModal
        visible={showModal}
        setVisible={setShowModal}
        onClose={handleClose}
      >
        <Text style={styles.sheetTitle}>
          {pinEntryTask.taskType === TaskType.PIN
            ? 'Enter Your Transaction PIN'
            : 'Please pass the transaction OTP'}
        </Text>
        <Text style={styles.sheetContent}>{pinEntryTask.taskDescription}</Text>

        <View style={styles.pinInputContainer}>
          {Array.from({ length: PIN_LENGTH }).map((_, index) => {
            const isFocused = focusedIndex === index;
            const digit = pin[index] || '';

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
          })}
        </View>

        <MonaButton
          text="Submit"
          onPress={() => {
            if (pin.length === PIN_LENGTH) {
              setShowModal(false);
              onSubmit(pin);
            }
          }}
          enabled={pin.length === PIN_LENGTH}
        />
      </MonaModal>
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
    paddingVertical: 30,
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
