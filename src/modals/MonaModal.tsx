import {
  View,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
  Dimensions,
} from 'react-native';
import Modal from 'react-native-modal';
import { MonaColors } from '../utils/theme';

const MonaModal = ({
  children,
  visible,
  setVisible,
  backgroundColor,
  usePoweredByMona = false,
  hasCloseButton = true,
  onClose,
}: {
  children: React.ReactNode;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  backgroundColor?: string;
  usePoweredByMona?: boolean;
  hasCloseButton?: boolean;
  onClose?: () => void;
}) => {
  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <Modal
      isVisible={visible}
      // onBackdropPress={() => setVisible(false)}
      onBackdropPress={() => {}}
      avoidKeyboard={true}
      useNativeDriverForBackdrop={true}
      useNativeDriver={true}
      style={{ justifyContent: 'flex-end', margin: 0 }}
      deviceWidth={Dimensions.get('window').width}
      propagateSwipe
      // visible={visible}
      // transparent
      // animationType="slide"
      // onRequestClose={handleClose}
    >
      {/* Backdrop */}
      {/* <Pressable style={styles.backdrop} onPress={() => {}} /> */}

      {/* Bottom Sheet */}
      <View
        style={[
          styles.bottomSheet,
          { backgroundColor: backgroundColor || '#F7F7F8' },
        ]}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            <View
              style={[styles.topBar, { backgroundColor: MonaColors.primary }]}
            >
              <Image
                source={require('../assets/city_bg.png')}
                style={styles.logo}
              />
              {hasCloseButton && (
                <TouchableWithoutFeedback onPress={handleClose}>
                  <View style={styles.closeIconContainer}>
                    <Image
                      source={require('../assets/dialog_close_icon.png')}
                      style={styles.closeIcon}
                    />
                  </View>
                </TouchableWithoutFeedback>
              )}
            </View>
            <View style={styles.bottomSheetContent}>
              {children}
              <Image
                source={
                  usePoweredByMona
                    ? require('../assets/poweredbymona.png')
                    : require('../assets/securebymona.png')
                }
                style={styles.footerImage}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomSheet: {
    // position: 'absolute',
    // bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  bottomSheetContent: {
    margin: 20,
  },
  topBar: {
    height: 36,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 10,
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  closeIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'center',
  },
  closeIconContainer: {
    height: 20,
    width: 20,
    backgroundColor: '#8E94F1',
    borderRadius: 24 / 2,
    position: 'absolute',
    right: 10,
    top: (36 / 2) * 0.5,
  },
  footerImage: {
    width: '100%',
    height: 16,
    marginVertical: 20,
  },
});

export default MonaModal;
