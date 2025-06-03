import { MMKV } from 'react-native-mmkv';
import { BASE_URL, CLIENT_TYPE } from '../utils/config';
import { ApiError, ApiService } from './ApiService';
import ReactNativeBiometrics from 'react-native-biometrics';
import uuid from 'react-native-uuid';
import CryptoJS from 'crypto-js';
import type { SignPayloadParams } from '../types';
import { buildSdkUrl, launchSdkUrl } from '../utils/helpers';
const Buffer = require('buffer').Buffer;

class CollectionService {
  private readonly baseUrl: string;
  private readonly storage: MMKV;
  private readonly rnBiometrics: ReactNativeBiometrics;
  private readonly api: ApiService;
  private merchantKey: string | null = null;
  /**
   * Initialize the CollectionServices with required configuration
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

  async initCollection({ sessionId }: { sessionId: string }): Promise<boolean> {
    const monaCheckoutID = this.storage.getString('monaCheckoutID') ?? '';

    if (monaCheckoutID === '') {
      const url = buildSdkUrl({
        sessionId: sessionId,
        isCollection: true,
        merchantKey: this.merchantKey!,
      });
      await launchSdkUrl(url);
      return false;
    }
    return true;
  }
  // async validateCollections({
  //   maximumAmount,
  //   expiryDate,
  //   startDate,
  //   monthlyLimit,
  //   reference,
  //   type,
  //   frequency,
  //   amount,
  //   debitType,
  //   scheduleEntries,
  // }: {
  //   maximumAmount: string;
  //   expiryDate: string;
  //   startDate: string;
  //   monthlyLimit: string;
  //   reference: string;
  //   type: string;
  //   frequency: string;
  //   amount?: string;
  //   debitType: string;
  //   scheduleEntries: Record<string, any>[];
  // }): Promise<ValidateCollectionResponse> {
  //   console.log(monthlyLimit);

  //   try {
  //     const payload = {
  //       maximumAmount: (Number(maximumAmount) * 100).toString(),
  //       expiryDate,
  //       startDate,
  //       reference,
  //       debitType,
  //       schedule: {
  //         type,
  //         frequency,
  //         ...(amount && { amount: (Number(amount) * 100).toString() }),
  //         entries: type === CollectionType.SCHEDULED ? scheduleEntries : [],
  //       },
  //     };

  //     const response = await this.api.post<ValidateCollectionResponse>(
  //       '/collections',
  //       payload,
  //       {
  //         headers: {
  //           'x-api-key': this.secretKey,
  //         },
  //       }
  //     );
  //     return response.data;
  //   } catch (error) {
  //     if (error instanceof ApiError) {
  //       throw error;
  //     }
  //     throw new Error('Unable to validate collecitons');
  //   }
  // }

  async createCollections({
    payload,
    monaKeyId,
    signature,
    nonce,
    timestamp,
  }: {
    payload: Record<string, any>;
    monaKeyId?: string;
    signature?: string;
    nonce?: string;
    timestamp?: string;
  }) {
    this.ensureInitialized();
    try {
      const headers: Record<string, any> = {
        'x-public-key': this.merchantKey,
        'x-client-type': CLIENT_TYPE,
      };

      if (monaKeyId) headers['x-mona-key-id'] = monaKeyId;
      if (signature) headers['x-mona-pay-auth'] = signature;
      if (nonce) headers['x-mona-nonce'] = nonce;
      if (timestamp) headers['x-mona-timestamp'] = timestamp;

      const response = this.api.post('/collections/consent', payload, {
        headers: headers,
      });
      console.log(response);
      return response;
    } catch (error) {
      console.log(error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('Unable to create collecitons');
    }
  }

  async createCollectionConsentRequest({
    bankId,
    accessRequestId,
  }: {
    bankId: string;
    accessRequestId: string;
  }) {
    try {
      const keyId = this.storage.getString('keyID') ?? '';
      const payload = {
        bankId,
        accessRequestId,
      };
      const nonce = uuid.v4();
      const timestamp = new Date().getTime().toString();
      const signature = await this.signPayload({
        payload,
        nonce,
        timestamp,
        keyId,
      });
      if (!signature) {
        throw new Error('Unable to sign request');
      }
      const response = await this.createCollections({
        payload,
        monaKeyId: keyId,
        signature,
        nonce,
        timestamp,
      });
      console.log(response);
      console.log('Collection created');
    } catch (error) {
      console.log(error);

      if (error instanceof ApiError) {
        throw error;
      }
    }
  }

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
      const uri = Buffer.from('/collections/consent', 'utf8').toString(
        'base64'
      );
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
      const { error, success, signature } =
        await this.rnBiometrics.createSignature({
          promptMessage: 'Sign Transaction',
          payload: hash,
        });

      if (!success) {
        console.log(error);

        throw new Error('Biometric authentication failed');
      }

      return signature;
    } catch (error) {
      console.log(error);

      throw new Error('Failed to sign collection request. Please try again.');
    }
  }
}

export const collectionService = new CollectionService();
