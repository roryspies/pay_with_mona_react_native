import { PayWithMonaCollectionsProvider } from './PayWithMonaCollectionsProvider';
import useCollections from './hooks/useCollections';
import PayWithMona from './PayWithMona';
import { initialize, validatePII } from './functions';
import { isAuthenticated, signOut } from './utils/helpers';
import MonaModal from './modals/MonaModal';
import BankTile from './components/BankTile';

export const PayWithMonaSDK = {
  initialize,
  validatePII,
};

export {
  PayWithMona,
  isAuthenticated,
  signOut,
  PayWithMonaCollectionsProvider,
  useCollections,
  MonaModal,
  BankTile,
};
export * from './types';
export * from './utils/enums';
