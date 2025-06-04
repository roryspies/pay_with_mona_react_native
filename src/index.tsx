import { PayWithMonaCollectionsProvider } from './PayWithMonaCollectionsProvider';
import useCollections from './hooks/useCollections';
import PayWithMona from './PayWithMona';
import { initialize, validatePII } from './functions';
import { isAuthenticated, signOut } from './utils/helpers';
import MonaModal from './modals/MonaModal';
import BankOptionsTile from './components/BankOptionsTile';

export const PayWithMonaSDK = {
  initialize,
  validatePII,
  isAuthenticated,
  signOut,
};

export {
  PayWithMona,
  PayWithMonaCollectionsProvider,
  useCollections,
  MonaModal,
  BankOptionsTile as BankTile,
};
export * from './types';
export * from './utils/enums';
