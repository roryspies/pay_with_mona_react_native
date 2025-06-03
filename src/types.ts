import type {
  CollectionType,
  DebitType,
  PaymentMethod,
  SubscriptionFrequency,
  TransactionStatus,
} from './utils/enums';

export type BankOptions = {
  bankName: string;
  bankId: string;
  logo: string;
  accountNumber: string;
  webLinkAndroid?: string;
  institutionCod: string;
  isPrimary?: boolean;
  manualPaymentRequired?: boolean;
  hasInstantPay?: boolean;
  primaryInstruments?: string[];
};

export type CardOptions = {
  cardId: string;
  maskedPan: string;
  cardNetwork: string;
  expiryDate: string;
  cardType: string;
  isDefault: boolean;
};

export type SavedPaymentOptions = {
  card: BankOptions[];
  bank: BankOptions[];
  oneTapCardOptions?: BankOptions[];
};

export interface Merchant {
  name: string;
  tag: string;
  image: string;
}

export interface User {
  name: string;
  bvn: string;
  image: string;
}

export type TransferDetails = {
  accountName: string;
  bankName: string;
  accountNumber: string;
  institutionCode: string;
};

export type TransferOption = {
  details: TransferDetails;
};

export type OptionAvailable = {
  available: boolean;
};

export type SelectedPaymentOptions = {
  card: OptionAvailable;
  transfer: TransferOption;
  mona: OptionAvailable;
};

export type MonaPendingPaymentMethods = {
  merchantId: string;
  customerPhone: string;
  amount: number;
  latestStatus: string;
  savedPaymentOptions: SavedPaymentOptions;
  selectedPaymentOptions: SelectedPaymentOptions;
  cart: any;
  lineItems: any[];
  merchant: Merchant;
  completed: boolean;
  user: User;
};

export type CheckoutResponse = {
  success: boolean;
  message: string;
  transactionId: string;
  friendlyID: string;
  url: string;
  savedPaymentOptions: SavedPaymentOptions;
};

export interface PayWithMonaProps {
  amount: number;
  merchantKey: string;
  transactionId: string;
  savedPaymentOptions?: SavedPaymentOptions;
  onTransactionUpdate?: (status: TransactionStatus) => void;
  onError?: (error: Error) => void;
  onAuthUpdate?: () => void;
}

export interface MerchantColor {
  primaryColor: string;
  primaryText: string;
}
export interface MerchantSettings {
  colors: MerchantColor;
  image: string;
  name: string;
  tradingName: string;
}

export interface PIIData {
  exists: boolean;
  savedPaymentOptions: SavedPaymentOptions;
}

export interface PIIResponse {
  success: boolean;
  data: PIIData;
}

export enum TaskType {
  ENTRY = 'entry',
  PIN = 'pin',
  SIGN = 'sign',
  OTP = 'otp',
  PHONE = 'phone',
}

export interface CollectionResponse {
  maxAmount: string;
  expiryDate: string | Date;
  startDate: string | Date;
  monthlyLimit: string;
  schedule: CollectionSchedule;
  reference: string;
  status: string;
  lastCollectedAt?: string;
  nextCollectionAt?: string;
  frequency: SubscriptionFrequency;
  debitType: DebitType;
}

export interface CollectionSchedule {
  type: CollectionType;
  frequency?: string;
  entries?: CollectionEntry[];
  amount?: string;
}

export interface CollectionEntry {
  amount: string;
  data: string;
}

export interface ValidateCollectionResponse {
  success: boolean;
  data: CollectionRequest;
}

export interface FetchCollectionResponse {
  id: string;
  bankId: string;
  requests: CollectionRequest[];
}

export interface CollectionRequest {
  id: string;
  isConsented: boolean;
  collection: CollectionResponse;
  createdAt: string;
  updatedAt: string;
}

export interface PinEntryTask {
  taskDescription: string;
  taskType?: TaskType;
  fieldType: TaskType;
  fieldName?: string;
  encrypted?: boolean;
  fieldLength?: number;
}

export interface DeviceAuthResponse {
  keyId: string;
  mona_checkoutId: string;
  [key: string]: any;
}

export interface PIIValidationRequest {
  phoneNumber?: string | null;
  bvn?: string | null;
  dob?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
}

export interface SignPayloadParams {
  payload: Record<string, any>;
  nonce: string;
  timestamp: string;
  keyId: string;
}

export interface PaymentRequestOptions {
  amount: number;
  bankId: string;
  transactionId: string;
  paymentMethod?: PaymentMethod;
  signedRequest?: boolean;
  sessionId: string;
  extraPayload?: Record<string, any>;
  onTaskUpdate?: (task: PinEntryTask) => void;
}

export interface SubmitPaymentRequestParams {
  keyID: string;
  nonce?: string;
  timestamp?: string;
  payload: any;
  signature?: string;
  monaCheckoutID: string;
  bankId: string;
  transactionId: string;
  paymentMethod?: PaymentMethod;
  amount: number;
  sessionId: string;
  onTaskUpdate?: (task: PinEntryTask) => void;
}

export interface PII {
  phoneNumber: string;
  bvn: string | undefined;
  dob: string | undefined;
}

export interface PayWithMonaCollectionsContextType {
  showModal: (
    requestId: string,
    onSuccess?: () => void,
    onError?: () => void
  ) => void;
  onHandleAuthUpdate: (token: any, sessionId: string) => void;
  hideModal: () => void;
}

export interface ModalType {
  open: () => void;
  close: () => void;
}
