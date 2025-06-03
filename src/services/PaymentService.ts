import { MMKV } from 'react-native-mmkv';
import CookieManager from '@react-native-cookies/cookies';
import ReactNativeBiometrics from 'react-native-biometrics';
import uuid from 'react-native-uuid';
import CryptoJS from 'crypto-js';
import { PaymentMethod } from '../utils/enums';
import { buildSdkUrl, launchSdkUrl } from '../utils/helpers';
import type {
  MonaPendingPaymentMethods,
  PaymentRequestOptions,
  PIIResponse,
  PIIValidationRequest,
  SignPayloadParams,
  SubmitPaymentRequestParams,
} from '../types';
import { BASE_URL, CLIENT_TYPE } from '../utils/config';
import { ApiService } from './ApiService';
const Buffer = require('buffer').Buffer;

/**
 * PaymentService class for payment processing operations
 * This service integrates with a payment API to handle checkout, authentication,
 * biometric verification, and payment processing.
 */
class PaymentService {
  private readonly baseUrl: string;
  private readonly storage: MMKV;
  private readonly rnBiometrics: ReactNativeBiometrics;
  private readonly api: ApiService;
  private merchantKey: string | null = null;
  /**
   * Initialize the PaymentService with required configuration
   * @param baseUrl - Base URL for the payment API
   * @param paymentBaseUrl - Base URL for payment-specific endpoints
   */
  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? BASE_URL;
    this.storage = new MMKV();
    this.rnBiometrics = new ReactNativeBiometrics();
    this.api = new ApiService(this.baseUrl);
  }

  initialize(merchantKey: string) {
    this.merchantKey = merchantKey;
  }

  private ensureInitialized() {
    if (!this.merchantKey) {
      throw new Error(
        'PaymentService not initialized. Call initialize() first.'
      );
    }
  }

  /**
   * Initiate a payment checkout process
   * @param amount - Payment amount to be processed
   * @returns Promise with checkout response data
   * @throws Error if checkout request fails
   */
  // public async initiatePayment({
  //   amount,
  //   phoneNumber,
  //   firstName,
  //   lastName,
  //   middleName,
  //   dob,
  //   bvn,
  // }: {
  //   amount: number;
  //   phoneNumber?: string;
  //   firstName?: string;
  //   lastName?: string;
  //   middleName?: string;
  //   dob?: string;
  //   bvn?: string;
  // }): Promise<CheckoutResponse> {
  //   this.ensureInitialized();
  //   try {
  //     await CookieManager.clearAll();
  //     const fullName = `${firstName ? firstName : ''}${middleName ? ' ' + middleName : ''}${lastName ? ' ' + lastName : ''}`;
  //     if (dob && (!fullName || fullName === '')) {
  //       throw Error(
  //         'First Name and Last Name must not be null when DOB is provided.'
  //       );
  //     }

  //     if (fullName !== '' && !dob) {
  //       throw Error(
  //         'DOB must not be null when First Name and Last Name is provided.'
  //       );
  //     }
  //     const storage = new MMKV();
  //     const keyID = storage.getString('keyID');

  //     const response = await this.api.post<CheckoutResponse>(
  //       `/demo/checkout`,
  //       {
  //         amount,
  //         successRateType: SDKSuccessRate.WALLET_COMPLETE,
  //         ...(phoneNumber && { phone: phoneNumber }),
  //         ...(bvn && { bvn }),
  //         ...(dob && { dob }),
  //         ...(fullName &&
  //           fullName !== '' && {
  //             name: fullName,
  //           }),
  //       },
  //       {
  //         headers: {
  //           'x-api-key':
  //             //TODO!
  //             '9a8438ef3932de15131c5137c22754366fa7e7678fa6a4a36d3122301c852df4',
  //           ...(keyID && { 'x-mona-key-id': keyID }),
  //           'x-public-key': this.merchantKey!,
  //         },
  //       }
  //     );

  //     return response.data;
  //   } catch (error) {
  //     console.log(error);
  //     throw new Error('Failed to initiate payment. Please try again later.');
  //   }
  // }

  /**
   * Retrieve available payment methods for a transaction
   * @param transactionId - The ID of the transaction to get payment methods for
   * @returns Promise with payment methods data
   * @throws Error if payment methods cannot be retrieved
   */
  public async getPaymentMethod(
    transactionId: string
  ): Promise<MonaPendingPaymentMethods> {
    try {
      // Retrieve the checkout ID from storage
      const monaCheckoutId = this.storage.getString('monaCheckoutID');

      if (!monaCheckoutId) {
        throw new Error(
          'Mona checkout ID not found. Please initiate a payment first.'
        );
      }

      // Set required cookies for authentication
      await CookieManager.set(this.baseUrl, {
        name: 'mona_checkoutId',
        value: monaCheckoutId,
        path: '/',
      });

      // Fetch payment methods from the API
      const response = await this.api.get<MonaPendingPaymentMethods>(`/pay`, {
        credentials: 'include',
        params: {
          transactionId,
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to get payment methods. Please check your connection and try again.'
      );
    }
  }

  /**
   * Validate Personal Identifiable Information (PII) data
   * @param validationData - Object containing optional PII data (phoneNumber, BVN, DOB)
   * @returns Promise with validation response or null if validation fails
   */
  public async validatePII({
    phoneNumber,
    bvn,
    dob,
    firstName,
    lastName,
    middleName,
  }: PIIValidationRequest): Promise<PIIResponse | null> {
    try {
      const storage = new MMKV();
      const keyID = storage.getString('keyID');

      let payload = {};

      if (!keyID) {
        payload = {
          ...(phoneNumber && { phoneNumber }),
          ...(bvn && { bvn }),
          ...(dob && { dob }),
          ...(firstName &&
            lastName && { name: `${firstName} ${lastName} ${middleName}` }),
        };
      } else {
        payload = {
          '': '',
        };
      }

      // Send validation request to the API
      const response = await this.api.post<PIIResponse>(
        `/login/validate`,
        payload,
        {
          headers: {
            ...(keyID && { 'x-client-type': CLIENT_TYPE }),
            ...(keyID && { 'x-mona-key-id': keyID }),
          },
        }
      );
      return response.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Initiate a payment transaction with multiple authentication options
   * @param options - Payment request options
   * @returns Payment transaction result or undefined for browser-based auth
   * @throws Error if payment transaction fails
   */
  public async makePaymentRequest({
    amount,
    bankId,
    transactionId,
    paymentMethod,
    signedRequest = false,
    sessionId,
    extraPayload,
    onTaskUpdate,
  }: PaymentRequestOptions): Promise<void> {
    try {
      // Get stored authentication credentials
      const monaCheckoutID = this.storage.getString('monaCheckoutID') ?? '';
      const keyID = this.storage.getString('keyID') ?? '';

      // If no checkout ID exists, initiate browser-based authentication
      if (monaCheckoutID === '') {
        // Launch in-app browser for authentication
        const url = buildSdkUrl({
          transactionId,
          sessionId,
          paymentMethod,
          bankId,
          merchantKey: this.merchantKey!,
        });
        await launchSdkUrl(url);
        return;
      }
      let payload = {
        ...(paymentMethod !== PaymentMethod.SAVEDCARD && { origin: bankId }),
        ...(paymentMethod === PaymentMethod.SAVEDCARD && { bankId: bankId }),
        hasDeviceKey: monaCheckoutID !== '',
        transactionId: transactionId,
        ...(extraPayload && { ...extraPayload }),
      };

      // Handle signed requests (with biometric authentication)
      if (signedRequest) {
        const timestamp = new Date().getTime().toString();
        const nonce = uuid.v4() as string;

        // Create cryptographic signature for the request
        const signature = await this.signPayload({
          payload,
          nonce,
          timestamp,
          keyId: keyID,
        });

        // Submit the signed payment request
        return await this.submitPaymentRequest({
          keyID,
          nonce,
          timestamp,
          payload,
          signature,
          monaCheckoutID,
          bankId,
          transactionId,
          paymentMethod,
          amount,
          sessionId,
          onTaskUpdate,
        });
      }

      // Submit unsigned payment request
      return await this.submitPaymentRequest({
        keyID,
        payload,
        monaCheckoutID,
        bankId,
        transactionId,
        paymentMethod,
        amount,
        sessionId,
        onTaskUpdate,
      });
    } catch (error) {
      throw new Error('Failed to process payment request. Please try again.');
    }
  }

  /**
   * Submit payment request to the API
   * @param params - Payment request parameters
   * @returns Payment processing result
   * @throws Error if payment submission fails
   */
  public async submitPaymentRequest({
    keyID,
    nonce,
    timestamp,
    payload,
    signature,
    monaCheckoutID,
    bankId,
    transactionId,
    paymentMethod,
    amount,
    sessionId,
    onTaskUpdate,
  }: SubmitPaymentRequestParams): Promise<void> {
    try {
      this.ensureInitialized();
      // Set authentication cookie
      await CookieManager.set(this.baseUrl, {
        name: 'mona_checkoutId',
        value: monaCheckoutID,
        path: '/',
      });
      console.log(monaCheckoutID);

      const headers: Record<string, string> = {
        'x-client-type': CLIENT_TYPE,
        'x-mona-key-id': keyID,
      };

      // Add optional authentication headers if available
      if (signature) headers['x-mona-pay-auth'] = signature;
      if (nonce) headers['x-mona-nonce'] = nonce;
      if (timestamp) headers['x-mona-timestamp'] = timestamp;
      if (paymentMethod === PaymentMethod.SAVEDCARD)
        headers['x-mona-checkout-type'] = 'card';

      // Submit payment request
      const response = await this.api.post<any>(`/pay`, payload, {
        headers,
        credentials: 'include',
      });
      console.log(response.status);

      // Handle successful response
      if (response.status === 200) {
        return response.data;
      }

      // Handle authentication challenge responses
      if (response.status === 202 && response.data.task) {
        console.log('task need!');

        if (response.data.task.taskType === 'sign') {
          return await this.makePaymentRequest({
            amount,
            bankId,
            transactionId,
            paymentMethod,
            signedRequest: true,
            sessionId,
          });
        } else if (
          ['pin', 'entry', 'otp', 'phone'].includes(
            response.data.task.fieldType
          )
        ) {
          onTaskUpdate?.(response.data.task);
        }
      }
      throw new Error(`Payment request failed with status: ${response.status}`);
    } catch (error) {
      throw new Error(
        'Failed to submit payment. Please check your connection and try again.'
      );
    }
  }

  /**
   * Create cryptographic signature for payment request
   * @param params - Payload and authentication parameters
   * @returns Cryptographic signature string
   * @throws Error if signature generation fails
   */
  private async signPayload(
    params: SignPayloadParams
  ): Promise<string | undefined> {
    try {
      const { payload, nonce, timestamp, keyId } = params;

      // Encode payload components
      const encodedPayload = Buffer.from(
        JSON.stringify(payload),
        'utf8'
      ).toString('base64');
      const method = Buffer.from('POST', 'utf8').toString('base64');
      const uri = Buffer.from('/pay', 'utf8').toString('base64');
      const params_encoded = Buffer.from(JSON.stringify({}), 'utf8').toString(
        'base64'
      );
      const encodedNonce = Buffer.from(nonce, 'utf8').toString('base64');
      const encodedTimestamp = Buffer.from(timestamp, 'utf8').toString(
        'base64'
      );
      const encodedKeyId = Buffer.from(keyId, 'utf8').toString('base64');

      // Prepare data for hashing
      const data = {
        method,
        uri,
        body: encodedPayload,
        params: params_encoded,
        nonce: encodedNonce,
        timestamp: encodedTimestamp,
        keyId: encodedKeyId,
      };

      // Create cryptographic hash
      const encodedData = Buffer.from(JSON.stringify(data), 'utf8').toString(
        'base64'
      );
      const hash = CryptoJS.SHA256(encodedData).toString();

      // Sign the hash with biometric authentication
      const { success, signature } = await this.rnBiometrics.createSignature({
        promptMessage: 'Approve Payment',
        payload: hash,
      });

      if (!success) {
        throw new Error('Biometric authentication failed');
      }

      return signature;
    } catch (error) {
      throw new Error('Failed to sign payment request. Please try again.');
    }
  }
}

export const paymentServices = new PaymentService();
