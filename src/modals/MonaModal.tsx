import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import Modal from 'react-native-modal';
import { lighten, MonaColors } from '../utils/theme';

const MonaModal = ({
  children,
  visible,
  backgroundColor,
  usePoweredByMona = false,
  hasCloseButton = true,
  onClose,
}: {
  children: ReactNode;
  visible: boolean;
  backgroundColor?: string;
  usePoweredByMona?: boolean;
  hasCloseButton?: boolean;
  onClose?: () => void;
}) => {
  const [contentHeight, setContentHeight] = useState(0);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const measureRef = useRef<View>(null);
  const hasInitiallyMeasured = useRef(false);
  const previousChildren = useRef<ReactNode>(children);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Measure the content
  const measureContent = () => {
    if (measureRef.current && visible) {
      measureRef.current.measure((_, __, ___, height) => {
        if (height && height > 0) {
          setContentHeight(height);
          hasInitiallyMeasured.current = true;
        }
      });
    }
  };

  // Reset and measure when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Only reset height if this is the first appearance
      if (!hasInitiallyMeasured.current) {
        animatedHeight.setValue(0);
      }

      // Use a small delay to ensure modal is fully mounted
      const timer = setTimeout(measureContent, 50);
      return () => clearTimeout(timer);
    } else {
      // When closing, immediately reset the animation
      animatedHeight.setValue(0);

      return () => { }
    }
  }, [visible, animatedHeight]);

  // Re-measure when children change
  useEffect(() => {
    // Skip initial render and only run when modal is visible
    if (previousChildren.current !== children && visible) {
      previousChildren.current = children;

      // Debounce measurements to avoid rapid changes
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(measureContent, 50);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [children, visible]);

  // Animate to the measured height
  useEffect(() => {
    if (contentHeight > 0 && visible) {
      Animated.spring(animatedHeight, {
        toValue: contentHeight,
        useNativeDriver: false,
        speed: 10,
        bounciness: 1,
      }).start();
    }
  }, [contentHeight, animatedHeight, visible]);

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      avoidKeyboard={true}
      useNativeDriverForBackdrop={true}
      useNativeDriver={true}
      style={{ justifyContent: 'flex-end', margin: 0 }}
      deviceWidth={Dimensions.get('window').width}
      animationInTiming={300}
      animationOutTiming={300}
      hideModalContentWhileAnimating={true}
      propagateSwipe
    >
      <View
        style={[
          styles.bottomSheet,
          { backgroundColor: backgroundColor || '#F7F7F8' },
        ]}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            {/* This hidden view is used only for measurement */}
            <View
              ref={measureRef}
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
            >
              <View style={styles.topBar}>
                <Image source={require('../assets/city_bg.png')} style={styles.logo} />
                {hasCloseButton && (
                  <View style={styles.closeIconContainer}>
                    <Image source={require('../assets/dialog_close_icon.png')} style={styles.closeIcon} />
                  </View>
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

            {/* This is the visible, animated content */}
            <Animated.View style={{ height: animatedHeight, overflow: 'hidden' }}>
              <View style={[styles.topBar, { backgroundColor: MonaColors.primary }]}>
                <Image
                  source={require('../assets/city_bg.png')}
                  style={styles.logo}
                />
                {hasCloseButton && (
                  <TouchableWithoutFeedback onPress={onClose}>
                    <View style={[styles.closeIconContainer, { backgroundColor: lighten(MonaColors.primary, 35) }]}>
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
            </Animated.View>
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
