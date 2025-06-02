import React from 'react';
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
  return (
    <PayWithMonaCollectionsProvider merchantKey={'mona_pub_5361ecf7'}>
      <NavigationContainer>
        <RootStack />
      </NavigationContainer>
    </PayWithMonaCollectionsProvider>
  );
}
export default App;
