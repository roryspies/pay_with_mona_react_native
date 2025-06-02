import { type ScheduledEntries } from './ScheduledEntries';

export interface ScheduledFormData {
  debitLimit: string;
  expirationDate: Date | null;
  reference: string;
  scheduledEntries: ScheduledEntries[];
}
