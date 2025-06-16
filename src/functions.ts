import { monaService } from './services/MonaService';
import { paymentServices } from './services/PaymentService';
import type { PIIResponse, SavedPaymentOptions } from './types';
import { getMerchantColors, setMonaSdkState } from './utils/helpers';
import { setMonaColors } from './utils/theme';

export const initialize = async (
  merchantKey: string,
  savedBankOptions?: SavedPaymentOptions
) => {
  monaService.initialize(merchantKey);
  paymentServices.initialize(merchantKey);
  monaService.initialize(merchantKey);
  setMonaSdkState({ savedPaymentOptions: savedBankOptions });
  const response = await monaService.initializeSdk();
  setMonaSdkState({ merchantSdk: response });
  const monaColors = getMerchantColors(response);
  setMonaColors(monaColors);
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
  return await paymentServices.validatePII({
    phoneNumber,
    bvn,
    dob,
    firstName,
    lastName,
    middleName,
  });
};
