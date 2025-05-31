import { useState, useCallback, useEffect, useRef } from 'react';
import type { SavedPaymentOptions } from '../types';
import { paymentServices } from '../services/PaymentService';

export const useValidatePII = () => {
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationData, setValidationData] =
    useState<SavedPaymentOptions | null>(null);

  const isMountedRef = useRef(true);

  const validate = useCallback(async () => {
    try {
      if (isMountedRef.current) {
        setLoading(true);
      }
      const validationResponse = await paymentServices.validatePII({});

      if (isMountedRef.current) {
        if (validationResponse?.success) {
          setValidationData(validationResponse.data.savedPaymentOptions);
          setValidationError(null);
        } else {
          setValidationData(null);
          setValidationError('Validation failed');
        }
      }
    } catch (error) {
      if (isMountedRef.current) {
        setValidationError(
          error instanceof Error
            ? error.message
            : 'Validation failed due to an unexpected error'
        );
        setValidationData(null);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    loading,
    validate,
    validationError,
    validationData,
  };
};
