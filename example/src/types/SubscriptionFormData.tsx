import {SubscriptionFrequency} from 'pay-with-mona-react-native';

export interface SubscriptionFormData {
  amount: string;
  debitLimit: string;
  frequency: SubscriptionFrequency | null;
  startDate: Date | null;
  expirationDate: Date | null;
  reference: string;
}
