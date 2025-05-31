import ReactNativeBiometrics from 'react-native-biometrics';
import { MMKV } from 'react-native-mmkv';
import { ApiService } from './ApiService';
import { BASE_URL, CLIENT_TYPE } from '../utils/config';
import type { DeviceAuthResponse } from '../types';
import uuid from 'react-native-uuid';
const Buffer = require('buffer').Buffer;

class MonaService {
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
      throw new Error('MonaService not initialized. Call initialize() first.');
    }
  }

  async initializeSdk() {
    this.ensureInitialized();
    try {
      const response = await this.api.get('/merchant/sdk', {
        headers: {
          'x-client-type': CLIENT_TYPE,
          'x-public-key': this.merchantKey!,
        },
      });
      console.log(response);
    } catch (e) {
      console.log('unable to initialize sdk');
    }
  }

  /**
   * Authenticate with strong authentication token
   * @param strongAuthToken - The strong authentication token
   * @param phoneNumber - Optional phone number
   * @returns Authentication response data
   * @throws Error if authentication fails
   */
  public async loginWithStrongAuth(
    strongAuthToken: string,
    phoneNumber: string | null
  ): Promise<any> {
    try {
      const response = await this.api.post(
        '/login',
        {
          phone: phoneNumber,
        },
        {
          headers: {
            'x-strong-auth-token': strongAuthToken,
            'x-mona-key-exchange': 'true',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to login with strong authentication. Please try again.'
      );
    }
  }

  /**
   * Create and sign device keys with biometric authentication
   * @param deviceAuth - Device authentication options
   * @returns Device authentication response
   * @throws Error if biometric authentication fails
   */
  public async signAndCommitKeys({
    deviceAuth,
    message,
  }: {
    deviceAuth: Record<string, string>;
    message?: string;
  }): Promise<DeviceAuthResponse> {
    try {
      // Check if biometric authentication is available
      const { available } = await this.rnBiometrics.isSensorAvailable();
      if (!available) {
        throw new Error(
          'Biometric authentication is not available on this device'
        );
      }

      // Generate a unique ID for this authentication
      const id = uuid.v4();

      // Create cryptographic keys for biometric authentication
      const { publicKey } = await this.rnBiometrics.createKeys();

      // Prepare and sign the payload with biometric authentication
      const signaturePayload = Buffer.from(
        JSON.stringify(deviceAuth.registrationOptions),
        'utf8'
      ).toString('base64');
      console.log(signaturePayload);

      const { success, signature, error } =
        await this.rnBiometrics.createSignature({
          promptMessage: message ?? 'Authorize payment',
          payload: signaturePayload,
        });

      if (!success) {
        console.log('Error', error);
        throw new Error('Biometric authentication failed');
      }

      // Commit the keys to the server
      const payload = {
        registrationToken: deviceAuth.registrationToken,
        attestationResponse: {
          id: id,
          rawId: id,
          publicKey: publicKey,
          signature: signature,
        },
      };

      const data = await this.commitKeys(payload);

      // Store authentication data in secure storage
      this.storage.set('hasPasskey', true);
      this.storage.set('keyID', data.keyId);
      this.storage.set('monaCheckoutID', data.mona_checkoutId);

      return data;
    } catch (error) {
      console.log(error);

      throw new Error('Biometric authentication failed. Please try again.');
    }
  }

  /**
   * Commit cryptographic keys to the server
   * @param payload - Key registration payload
   * @returns Server response data
   * @throws Error if key registration fails
   */
  private async commitKeys(payload: any): Promise<DeviceAuthResponse> {
    try {
      const response = await this.api.post<DeviceAuthResponse>(
        `/keys/commit`,
        payload
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to register security keys. Please try again.');
    }
  }
}

export const monaService = new MonaService();
