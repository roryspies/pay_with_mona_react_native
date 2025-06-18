import BankOptionsTile from './components/BankOptionsTile';
import { initialize, setMerchantPaymentSettings, validatePII } from './functions';
import useCollections from './hooks/useCollections';
import MonaModal from './modals/MonaModal';
import PayWithMona from './PayWithMona';
import { PayWithMonaCollectionsProvider } from './provider/PayWithMonaCollectionsContext';
import { isAuthenticated, signOut } from './utils/helpers';

export const PayWithMonaSDK = {
  initialize,
  setMerchantPaymentSettings,
  validatePII,
  isAuthenticated,
  signOut,
};

export * from './types';
export * from './utils/enums';
export {
  BankOptionsTile as BankTile, MonaModal, PayWithMona,
  PayWithMonaCollectionsProvider,
  useCollections
};

