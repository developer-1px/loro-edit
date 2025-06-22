import { useState, useCallback } from 'react';
import { useAsyncSubmit } from './useAsyncOperation';

interface ValidationRule<T> {
  field: keyof T;
  required?: boolean;
  validator?: (value: any) => string | null;
  message?: string;
}

interface UseModalFormOptions<T> {
  validationRules?: ValidationRule<T>[];
  resetOnSuccess?: boolean;
  closeOnSuccess?: boolean;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
}

export const useModalForm = <TData extends Record<string, any>, TResult = any>(
  initialValues: TData,
  submitFn: (data: TData) => Promise<TResult>,
  options: UseModalFormOptions<TData> = {}
) => {
  const {
    validationRules = [],
    resetOnSuccess = true,
    closeOnSuccess = true,
    onSuccess,
    onError,
  } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<TData>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof TData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof TData, boolean>>>({});

  const validateField = useCallback((field: keyof TData, value: any): string | null => {
    const rule = validationRules.find(r => r.field === field);
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return rule.message || `${String(field)} is required`;
    }

    // Custom validator
    if (rule.validator && value) {
      return rule.validator(value);
    }

    return null;
  }, [validationRules]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof TData, string>> = {};
    let isValid = true;

    validationRules.forEach(rule => {
      const error = validateField(rule.field, values[rule.field]);
      if (error) {
        newErrors[rule.field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField, validationRules]);

  const {
    submit: submitForm,
    isSubmitting,
    error: submitError,
    success,
    reset: resetSubmission,
  } = useAsyncSubmit(submitFn, {
    onSuccess: (result) => {
      if (resetOnSuccess) {
        setValues(initialValues);
        setErrors({});
        setTouched({});
      }
      if (closeOnSuccess) {
        setIsOpen(false);
      }
      onSuccess?.(result);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  const setValue = useCallback((field: keyof TData, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const setFieldTouched = useCallback((field: keyof TData, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
    
    // Validate field when it's touched
    if (isTouched) {
      const error = validateField(field, values[field]);
      setErrors(prev => ({ ...prev, [field]: error || undefined }));
    }
  }, [validateField, values]);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(initialValues).reduce((acc, key) => {
      acc[key as keyof TData] = true;
      return acc;
    }, {} as Partial<Record<keyof TData, boolean>>);
    setTouched(allTouched);

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Submit form
    submitForm(values);
  }, [validateForm, submitForm, values, initialValues]);

  const open = useCallback(() => {
    setIsOpen(true);
    resetSubmission();
  }, [resetSubmission]);

  const close = useCallback(() => {
    setIsOpen(false);
    setErrors({});
    setTouched({});
    resetSubmission();
  }, [resetSubmission]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    resetSubmission();
  }, [initialValues, resetSubmission]);

  const getFieldProps = useCallback((field: keyof TData) => ({
    value: values[field] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValue(field, e.target.value);
    },
    onBlur: () => {
      setFieldTouched(field, true);
    },
    error: touched[field] && errors[field],
    hasError: touched[field] && !!errors[field],
  }), [values, touched, errors, setValue, setFieldTouched]);

  const isValid = Object.keys(errors).length === 0;
  const hasChanges = JSON.stringify(values) !== JSON.stringify(initialValues);

  return {
    // Modal state
    isOpen,
    open,
    close,
    
    // Form state
    values,
    errors,
    touched,
    isValid,
    hasChanges,
    
    // Form actions
    setValue,
    setFieldTouched,
    getFieldProps,
    handleSubmit,
    reset,
    
    // Submission state
    isSubmitting,
    submitError,
    success,
    
    // Utilities
    validateForm,
    validateField,
  };
};