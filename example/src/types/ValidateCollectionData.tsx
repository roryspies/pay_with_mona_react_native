export interface SubscriptionCollectionData {
  maximumAmount: string;
  expiryDate: string;
  startDate: string;
  reference: string;
  type: string;
  frequency: string;
  amount?: string;
  debitType: string;
}

export interface ScheduledCollectionData {
  maximumAmount: string;
  expiryDate: string;
  startDate: string;
  monthlyLimit: string;
  reference: string;
  type: string;
  amount?: string;
  debitType: string;
  scheduleEntries: Record<string, any>[];
}
