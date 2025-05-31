export enum PaymentMethod {
  SAVEDBANK = 'savedBank',
  SAVEDCARD = 'savedCard',
  TRANSFER = 'transfer',
  CARD = 'card',
}

export enum TransactionStatus {
  PROGRESSUPDATE = 'progress_update',
  INITIATED = 'transaction_initiated',
  FAILED = 'transaction_failed',
  COMPLETED = 'transaction_completed',
}

export enum SDKSuccessRate {
  MONA_SUCCESS = 'mona_success',
  DEBIT_SUCCESS = 'debit_success',
  WALLET_RECEIVED = 'wallet_received',
  WALLET_COMPLETE = 'wallet_completed',
}

export enum CollectionType {
  NONE = 'NONE',
  SCHEDULED = 'SCHEDULED',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export enum DebitType {
  NONE = 'NONE',
  MONA = 'MONA',
  MERCHANT = 'MERCHANT',
}

export enum SubscriptionFrequency {
  NONE = 'NONE',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMIANNUAL = 'SEMI_ANNUAL',
  ANNUAL = 'ANNUAL',
}
export enum TimeFactor {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
}
