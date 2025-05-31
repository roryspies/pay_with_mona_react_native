import { monaService } from './services/MonaService';
import { paymentServices } from './services/PaymentService';
import type { PIIResponse, SavedPaymentOptions } from './types';
import { setMonaSdkState } from './utils/helpers';

export const initialize = async (
  merchantKey: string,
  savedBankOptions: SavedPaymentOptions
) => {
  monaService.initialize(merchantKey);
  paymentServices.initialize(merchantKey);
  monaService.initialize(merchantKey);
  setMonaSdkState({ savedPaymentOptions: savedBankOptions });
  const response = await monaService.initializeSdk();
  console.log(response);
};

export const validatePII = async ({
  phoneNumber,
  bvn,
  dob,
  firstName,
  lastName,
  middleName,
}: {
  phoneNumber?: string | null;
  bvn?: string | null;
  dob?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
}): Promise<PIIResponse | null> => {
  const response = await paymentServices.validatePII({
    phoneNumber,
    bvn,
    dob,
    firstName,
    lastName,
    middleName,
  });
  return response;
};
