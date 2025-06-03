import {
  View,
  Text,
  StyleSheet,
  Animated,
  type ImageSourcePropType,
  useAnimatedValue,
} from 'react-native';
import { useEffect, useState } from 'react';
import MonaModal from '../MonaModal';
import { TransactionStatus } from '../../utils/enums';
import { MonaColors } from '../../utils/config';

const TransactionInitiatedModal = ({
  visible,
  setVisible,
  transactionStatus,
  onDone,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  transactionStatus: TransactionStatus;
  onDone?: () => void;
}) => {
  console.log('initiated status', transactionStatus);

  const progressBar1AnimatedValue = useAnimatedValue(0);
  const progressBar2AnimatedValue = useAnimatedValue(0);
  const progressBar3AnimatedValue = useAnimatedValue(0);
  const shimmerAnim = useAnimatedValue(-1);
  const opacity = useAnimatedValue(0);
  const opacity2 = useAnimatedValue(0);
  const [showProgressBar2, setShowProgressBar2] = useState(false);

  const startShimmerAnimation = () => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      })
    ).start();
  };

  const startInitialProgressAnimation = () => {
    setShowProgressBar2(false);

    Animated.timing(progressBar1AnimatedValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: false,
    }).start(() => {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }).start(() => {
        Animated.loop(
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          })
        ).start();
      });
    });
  };

  const startCompletionAnimation = () => {
    progressBar1AnimatedValue.setValue(1);
    opacity.setValue(1);
    setShowProgressBar2(true);

    Animated.timing(progressBar2AnimatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start(() => {
      Animated.timing(opacity2, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start(() => {
        Animated.timing(progressBar3AnimatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }).start(() => {
          onDone?.();
        });
      });
    });
  };

  useEffect(() => {
    const isProgressStatus = [
      TransactionStatus.PROGRESSUPDATE,
      TransactionStatus.INITIATED,
    ].includes(transactionStatus);

    if (isProgressStatus) {
      if (transactionStatus === TransactionStatus.PROGRESSUPDATE) {
        startShimmerAnimation();
      } else {
        startInitialProgressAnimation();
      }
    } else {
      startCompletionAnimation();
    }
  }, [transactionStatus]);

  // useEffect(() => {
  //   if (
  //     [TransactionStatus.PROGRESSUPDATE, TransactionStatus.INITIATED].includes(
  //       transactionStatus
  //     )
  //   ) {
  //     if (transactionStatus === TransactionStatus.PROGRESSUPDATE) {
  //       Animated.loop(
  //         Animated.timing(shimmerAnim, {
  //           toValue: 1,
  //           duration: 1000,
  //           useNativeDriver: false,
  //         })
  //       ).start();
  //       return;
  //     }
  //     setShowProgressBar2(false);
  //     Animated.timing(progressBar1AnimatedValue, {
  //       toValue: 1,
  //       duration: 100,
  //       useNativeDriver: false,
  //     }).start(() => {
  //       Animated.timing(opacity, {
  //         toValue: 1, // fully transparent
  //         duration: 100,
  //         useNativeDriver: false,
  //       }).start(() => {
  //         Animated.loop(
  //           Animated.timing(shimmerAnim, {
  //             toValue: 1,
  //             duration: 1500,
  //             useNativeDriver: false,
  //           })
  //         ).start();
  //       });
  //     });
  //   } else {
  //     progressBar1AnimatedValue.setValue(1);
  //     opacity.setValue(1);
  //     setShowProgressBar2(true);
  //     Animated.timing(progressBar2AnimatedValue, {
  //       toValue: 1,
  //       duration: 1000,
  //       useNativeDriver: false,
  //     }).start(() => {
  //       Animated.timing(opacity2, {
  //         toValue: 1,
  //         duration: 500,
  //         useNativeDriver: false,
  //       }).start(() => {
  //         Animated.timing(progressBar3AnimatedValue, {
  //           toValue: 1,
  //           duration: 1000,
  //           useNativeDriver: false,
  //         }).start(() => {
  //           onDone?.();
  //         });
  //       });
  //     });
  //   }

  //   // Animated.loop(
  //   //   Animated.timing(shimmerAnim, {
  //   //     toValue: 1,
  //   //     duration: 1100,
  //   //     useNativeDriver: false,
  //   //   })
  //   // ).start();
  //   return () => {
  //     console.log('closing all animations');
  //     progressBar1AnimatedValue.resetAnimation();
  //     progressBar2AnimatedValue.resetAnimation();
  //     progressBar3AnimatedValue.resetAnimation();
  //     opacity.resetAnimation();
  //     opacity2.resetAnimation();
  //     shimmerAnim.resetAnimation();
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [transactionStatus]);

  return (
    <MonaModal visible={visible} setVisible={setVisible} hasCloseButton={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Hang Tight, We're On It!</Text>
        <Text style={styles.subtitle}>
          Your transfer is on the way—we'll confirm as soon as it lands.
        </Text>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar1}>
            <Animated.View
              style={{
                width: progressBar1AnimatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                height: '100%',
                backgroundColor: MonaColors.success,
                borderRadius: 4,
              }}
            />
          </View>
          <AnimatedTransactionIcon value={opacity} />
          <View style={styles.progressBar2}>
            {!showProgressBar2 && (
              <Animated.View
                style={[
                  {
                    //   position: 'absolute',
                    width: '50%',
                    height: '100%',
                    backgroundColor: MonaColors.success,
                    borderRadius: 4,
                  },
                  {
                    transform: [
                      {
                        translateX: shimmerAnim.interpolate({
                          inputRange: [-1, 1],
                          outputRange: ['-100%', '200%'],
                        }),
                      },
                    ],
                  },
                ]}
              />
            )}
            {showProgressBar2 && (
              <Animated.View
                style={{
                  width: progressBar2AnimatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  height: '100%',
                  backgroundColor: MonaColors.success,
                  borderRadius: 4,
                }}
              />
            )}
          </View>
          <AnimatedTransactionIcon
            value={opacity2}
            icon={
              transactionStatus === TransactionStatus.FAILED
                ? require('../../assets/failed.png')
                : require('../../assets/checkmark.png')
            }
            animatedToColor={
              transactionStatus === TransactionStatus.FAILED
                ? MonaColors.error
                : MonaColors.success
            }
          />
          <View style={styles.progressBar3}>
            <Animated.View
              style={{
                width: progressBar3AnimatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                height: '100%',
                backgroundColor:
                  transactionStatus === TransactionStatus.FAILED
                    ? MonaColors.error
                    : MonaColors.success,
                borderRadius: 4,
              }}
            />
          </View>
        </View>
      </View>
    </MonaModal>
  );
};

const AnimatedTransactionIcon = ({
  value,
  animatedToColor = '#0F973D',
  icon = require('../../assets/checkmark.png'),
}: {
  value: Animated.Value;
  animatedToColor?: string;
  icon?: ImageSourcePropType;
}) => {
  return (
    <Animated.View
      style={[
        // eslint-disable-next-line react-native/no-inline-styles
        {
          width: value.interpolate({
            inputRange: [0, 1],
            outputRange: [8, 14],
          }),
          height: value.interpolate({
            inputRange: [0, 1],
            outputRange: [8, 14],
          }),
          borderRadius: value.interpolate({
            inputRange: [0, 1],
            outputRange: [8 / 2, 14 / 2],
          }),
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: value.interpolate({
            inputRange: [0, 1],
            outputRange: ['#E7F5EC', animatedToColor],
          }),
        },
      ]}
    >
      <Animated.Image
        source={icon}
        style={[styles.checkIcon, { opacity: value }]}
      />
      {/* <Text style={{ fontSize: 10, fontWeight: '400' }}>Sent</Text> */}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    letterSpacing: -0.48,
    lineHeight: 24,
    color: '#131503',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 24,
    letterSpacing: -0.4,
    lineHeight: 16,
    color: '#6A6C60',
  },
  checkIcon: {
    width: 8,
    height: 8,
  },
  progressBarContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 4,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar1: {
    width: '20%',
    height: 8,
    backgroundColor: '#E7F5EC',
    borderRadius: 4,
  },
  progressBar2: {
    width: '50%',
    height: 8,
    backgroundColor: '#E7F5EC',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar3: {
    width: '20%',
    height: 8,
    backgroundColor: '#E7F5EC',
    borderRadius: 4,
  },
});

export default TransactionInitiatedModal;
