import { useState, useCallback, useMemo } from 'react';
import { FormState, FormChangeHandler, FormFieldConfig } from '@/types/forms';

interface UseOptimizedFormOptions<T> {
  initialData: T;
  validationSchema?: Record<keyof T, (value: unknown) => boolean | string>;
  onSubmit?: (data: T) => Promise<void> | void;
}

export function useOptimizedForm<T extends Record<string, unknown>>({
  initialData,
  validationSchema,
  onSubmit
}: UseOptimizedFormOptions<T>) {
  const [formState, setFormState] = useState<FormState<T>>({
    data: initialData,
    errors: {},
    touched: {},
    isValid: true,
    isSubmitting: false,
    isDirty: false
  });

  const validateField = useCallback((field: keyof T, value: unknown): string => {
    if (!validationSchema?.[field]) return '';
    
    const result = validationSchema[field](value);
    return typeof result === 'string' ? result : '';
  }, [validationSchema]);

  const handleChange: FormChangeHandler<T> = useCallback((field, value) => {
    const error = validateField(field, value);
    
    setFormState(prev => {
      const newData = { ...prev.data, [field]: value };
      const newErrors = { ...prev.errors };
      const newTouched = { ...prev.touched, [field]: true };
      
      if (error) {
        newErrors[field as string] = error;
      } else {
        delete newErrors[field as string];
      }
      
      const isValid = Object.keys(newErrors).length === 0;
      const isDirty = JSON.stringify(newData) !== JSON.stringify(initialData);
      
      return {
        ...prev,
        data: newData,
        errors: newErrors,
        touched: newTouched,
        isValid,
        isDirty
      };
    });
  }, [validateField, initialData]);

  const validateAll = useCallback((): boolean => {
    if (!validationSchema) return true;
    
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    Object.keys(validationSchema).forEach(field => {
      const error = validateField(field as keyof T, formState.data[field as keyof T]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });
    
    setFormState(prev => ({
      ...prev,
      errors: newErrors,
      isValid,
      touched: Object.keys(formState.data).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    }));
    
    return isValid;
  }, [validationSchema, validateField, formState.data]);

  const handleSubmit = useCallback(async () => {
    if (!validateAll() || !onSubmit) return;
    
    setFormState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      await onSubmit(formState.data);
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [validateAll, onSubmit, formState.data]);

  const reset = useCallback(() => {
    setFormState({
      data: initialData,
      errors: {},
      touched: {},
      isValid: true,
      isSubmitting: false,
      isDirty: false
    });
  }, [initialData]);

  const setFieldValue = useCallback((field: keyof T, value: unknown) => {
    handleChange(field, value);
  }, [handleChange]);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error }
    }));
  }, []);

  return useMemo(() => ({
    ...formState,
    handleChange,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
    validateField: (field: keyof T) => validateField(field, formState.data[field]),
    getFieldProps: (field: keyof T) => ({
      value: formState.data[field],
      onChange: (value: unknown) => handleChange(field, value),
      error: formState.errors[field as string],
      touched: formState.touched[field as string]
    })
  }), [formState, handleChange, handleSubmit, reset, setFieldValue, setFieldError, validateField]);
}