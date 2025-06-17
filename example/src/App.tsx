import React, { useEffect, useState } from 'react';
import HomeScreen from './features/home/HomeScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CheckoutScreen from './features/checkout/CheckoutScreen';
import CollectionScreen from './features/collections/CollectionScreen';
import {
  PayWithMonaCollectionsProvider,
  type SavedPaymentOptions,
} from 'pay-with-mona-react-native';
import CollectionScheduledScreen from './features/collections/CollectionScheduledScreen';
import { subscribeMonaColors } from '../../src/utils/theme';
import { setColors } from './constants/Color';

export type StackParamList = {
  Home: undefined;
  Checkout: {
    amount: string;
    transactionId: string;
    savedPaymentOptions: SavedPaymentOptions;
    onAuthUpdate?: () => void;
  };
  Collections: {
    phoneNumber: string;
    dob: string;
    bvn: string;
  };
  CollectionScheduled: {
    phoneNumber: string;
    dob: string;
    bvn: string;
  };
};

const Stack = createNativeStackNavigator<StackParamList>();

const RootStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Collections" component={CollectionScreen} />
      <Stack.Screen
        name="CollectionScheduled"
        component={CollectionScheduledScreen}
      />
    </Stack.Navigator>
  );
};

function App(): React.JSX.Element {
  const [key, setKey] = useState(0);

  useEffect(() => {
    return subscribeMonaColors((colors) => {
      setColors(colors);
      setKey((prevKey) => prevKey + 1); // Force re-render to apply new colors, don't do this in a production app, use a context instead
    });
  }, []);

  return (
    <PayWithMonaCollectionsProvider key={key} merchantKey={'mona_pub_5361ecf7'}>
      <NavigationContainer>
        <RootStack />
      </NavigationContainer>
    </PayWithMonaCollectionsProvider>
  );
}
export default App;
