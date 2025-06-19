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

const { height: screenHeight } = Dimensions.get('window');
const INITIAL_HEIGHT = screenHeight * 0.5;

interface MonaModalProps {
  children: ReactNode;
  visible: boolean;
  backgroundColor?: string;
  usePoweredByMona?: boolean;
  hasCloseButton?: boolean;
  onClose?: () => void;
}

const MonaModal = ({
  children,
  visible,
  backgroundColor,
  usePoweredByMona = false,
  hasCloseButton = true,
  onClose,
}: MonaModalProps) => {
  const [internalVisible, setInternalVisible] = useState(false);
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [contentKey, setContentKey] = useState(0); // Force re-render when content changes
  const [hasAnimatedToMeasured, setHasAnimatedToMeasured] = useState(false);

  const animatedHeight = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const measureRef = useRef<View>(null);
  const measureTimer = useRef<NodeJS.Timeout | null>(null);
  const previousChildren = useRef<ReactNode>(children);
  const lastMeasuredHeight = useRef<number | null>(null);

  const measureContent = () => {
    if (measureRef.current && internalVisible) {
      // Use requestAnimationFrame to ensure layout is complete
      requestAnimationFrame(() => {
        measureRef.current?.measure((_, __, ___, height) => {
          if (height && height > 0) {
            // Only update if height changed significantly (avoid micro-changes)
            const heightDifference = lastMeasuredHeight.current ? Math.abs(height - lastMeasuredHeight.current) : Infinity;

            if (heightDifference > 5) { // 5px threshold to avoid tiny changes
              console.log('Measured height:', height, 'Previous:', lastMeasuredHeight.current);
              lastMeasuredHeight.current = height;
              setMeasuredHeight(height);
            }
          }
        });
      });
    }
  };

  const openModal = () => {
    setInternalVisible(true);
    setIsAnimating(true);
    setMeasuredHeight(null);
    setHasAnimatedToMeasured(false);
    lastMeasuredHeight.current = null;

    // Animate backdrop and content together
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(animatedHeight, {
        toValue: INITIAL_HEIGHT,
        useNativeDriver: false,
        speed: 12,
        bounciness: 2,
      })
    ]).start(() => {
      setIsAnimating(false);
      // Measure after initial animation completes
      measureTimer.current = setTimeout(measureContent, 50);
    });
  };

  const closeModal = () => {
    if (isAnimating) return;

    setIsAnimating(true);

    if (measureTimer.current) {
      clearTimeout(measureTimer.current);
    }

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(animatedHeight, {
        toValue: 0,
        useNativeDriver: false,
        speed: 15,
        bounciness: 0,
      })
    ]).start(() => {
      setInternalVisible(false);
      setIsAnimating(false);
      setMeasuredHeight(null);
      setHasAnimatedToMeasured(false);
      lastMeasuredHeight.current = null;
      onClose?.();
    });
  };

  // Handle external visibility changes
  useEffect(() => {
    if (visible && !internalVisible && !isAnimating) {
      openModal();
    } else if (!visible && internalVisible && !isAnimating) {
      closeModal();
    }

    return () => {
      if (measureTimer.current) {
        clearTimeout(measureTimer.current);
      }
    };
  }, [visible, internalVisible, isAnimating]);

  // Re-measure when children change
  useEffect(() => {
    if (previousChildren.current !== children && internalVisible) {
      previousChildren.current = children;
      setContentKey(prev => prev + 1); // Force re-render
      setMeasuredHeight(null);
      setHasAnimatedToMeasured(false);
      lastMeasuredHeight.current = null;

      // Debounce measurements
      if (measureTimer.current) {
        clearTimeout(measureTimer.current);
      }
      measureTimer.current = setTimeout(measureContent, 100);
    }
  }, [children, internalVisible]);

  // Adjust to measured height (only once per measurement)
  useEffect(() => {
    if (measuredHeight && internalVisible && !isAnimating && !hasAnimatedToMeasured) {
      const heightDifference = Math.abs(measuredHeight - INITIAL_HEIGHT);

      console.log('Animating to height:', measuredHeight, 'Current initial:', INITIAL_HEIGHT);
      setHasAnimatedToMeasured(true);

      if (heightDifference > 30) {
        Animated.spring(animatedHeight, {
          toValue: measuredHeight,
          useNativeDriver: false,
          speed: 15,
          bounciness: 3,
        }).start();
      } else {
        animatedHeight.setValue(measuredHeight);
      }
    }
  }, [measuredHeight, internalVisible, isAnimating, hasAnimatedToMeasured]);

  // Don't render anything if not visible
  if (!internalVisible) {
    return null;
  }

  return (
    <Modal
      isVisible={true}
      onBackdropPress={closeModal}
      avoidKeyboard={true}
      useNativeDriverForBackdrop={false}
      useNativeDriver={false}
      style={{ justifyContent: 'flex-end', margin: 0 }}
      deviceWidth={Dimensions.get('window').width}
      animationInTiming={0}
      animationOutTiming={0}
      backdropOpacity={0}
      hideModalContentWhileAnimating={false}
      propagateSwipe
    >
      {/* Custom animated backdrop */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: 'rgba(0,0,0,0.5)',
            opacity: backdropOpacity,
          }
        ]}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* Modal content */}
      <View
        style={[
          styles.bottomSheet,
          { backgroundColor: backgroundColor || '#F7F7F8' },
        ]}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            {/* Hidden measurement view - ESSENTIAL for accurate height calculation */}
            <View
              key={`measure-${contentKey}`} // Force re-render when content changes
              ref={measureRef}
              style={{
                position: 'absolute',
                opacity: 0,
                pointerEvents: 'none',
                width: '100%' // Ensure same width as visible content
              }}
              onLayout={measureContent} // Alternative measurement trigger
            >
              <ModalContent
                hasCloseButton={hasCloseButton}
                onClose={closeModal}
                usePoweredByMona={usePoweredByMona}
              >
                {children}
              </ModalContent>
            </View>

            {/* Visible animated content */}
            <Animated.View
              style={{
                height: animatedHeight,
                overflow: 'hidden',
              }}
            >
              <ModalContent
                hasCloseButton={hasCloseButton}
                onClose={closeModal}
                usePoweredByMona={usePoweredByMona}
              >
                {children}
              </ModalContent>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

const ModalContent = ({
  children,
  hasCloseButton,
  onClose,
  usePoweredByMona,
}: Partial<MonaModalProps>) => {
  return (
    <>
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
    </>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    borderRadius: 12,
    position: 'absolute',
    right: 10,
    top: 8,
  },
  footerImage: {
    width: '100%',
    height: 16,
    marginVertical: 20,
  },
});

export default MonaModal;