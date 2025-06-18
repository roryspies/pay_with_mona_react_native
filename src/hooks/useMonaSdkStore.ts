import { create } from 'zustand';
import type { MerchantSettings, SavedPaymentOptions } from '../types';

interface MonaSdkState {
    savedPaymentOptions?: SavedPaymentOptions | null;
    merchantSdk?: MerchantSettings | null;
    setMonaSdkState: (data: {
        savedPaymentOptions?: SavedPaymentOptions | null;
        merchantSdk?: MerchantSettings | null;
    }) => void;
    clearMonaSdkState: () => void;
}

export const useMonaSdkStore = create<MonaSdkState>((set) => ({
    savedPaymentOptions: undefined,
    merchantSdk: undefined,
    setMonaSdkState: (data) =>
        set((state) => ({
            ...state,
            ...data,
        })),
    clearMonaSdkState: () =>
        set({
            savedPaymentOptions: undefined,
            merchantSdk: undefined,
        }),
}));