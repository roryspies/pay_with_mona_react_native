# pay-with-mona-react-native

## Description

The `pay-with-mona-react-native` is a React Native SDK for integrating Mona payment into mobile applications. This SDK provides functionalities to interact with Mona's features and services within your React Native projects.

## Installation

Install the package in your React Native project:

```sh
npm install pay-with-mona-react-native
```

Additionally, ensure that the peer dependencies are installed by running:
```sh
npm install @react-native-cookies/cookies react-native-biometrics react-native-custom-tabs @react-native-async-storage/async-storage react-native-svg
```

## Usage

To utilize the SDK within your application, follow these steps:

### Checkout

```jsx
import { PayWithMona, type TransactionStatus } from 'pay-with-mona-react-native';

<PayWithMona
    merchantKey={MERCHANT_PUBLIC_KEY}
    amount={AMOUNT_IN_KOBO}
    transactionId={TRANSACTION_ID}
    savedBankOptions={}
    onTransactionUpdate={(status: TransactionStatus) => {}}
/>
```

### Collection
1. Wrap your application with the PayWithMonaCollectionsProvider component, providing the necessary configuration parameters:

```jsx
import { PayWithMonaCollectionsProvider } from 'pay-with-mona-react-native';

<PayWithMonaCollectionsProvider merchantKey={MERCHANT_PUBLIC_KEY}>
    <App />
</PayWithMonaCollectionsProvider>
```
2. Access SDK functionalities within your components:

```jsx
import { useCollections } from 'pay-with-mona-react-native';


export default function App(){
   const {
    initiate,
  } = useCollection({
      onSuccess: () => {},
      onError: (error) => {},
    });
   return (
    <Button
        title="Start Collection Process"
        onPress={() => {
            initiate(accessRequestId);
        }}
        />
    )
}
```

## Running example app

To run the example application on Android or iOS devices, execute the respective commands:

```sh
cd example/
```

```
npm run android
npm run ios
```

## Documentation

For more detailed usage instructions and API documentation, please visit .
[Mona SDK Documentation](https://www.mona.ng)

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request on the [GitHub repository](https://github.com/roryspies/pay_with_mona_react_native)

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---