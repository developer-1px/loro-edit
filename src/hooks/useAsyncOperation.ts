import { useState, useCallback, useRef, useEffect } from 'react';

interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

interface UseAsyncOperationOptions {
  resetOnDependencyChange?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export const useAsyncOperation = <T>(
  operation: () => Promise<T>,
  dependencies: any[] = [],
  options: UseAsyncOperationOptions = {}
) => {
  const {
    resetOnDependencyChange = true,
    retryAttempts = 0,
    retryDelay = 1000,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  const execute = useCallback(async (): Promise<T | null> => {
    // Cancel previous operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setState(prevState => ({
      ...prevState,
      loading: true,
      error: null,
      success: false,
    }));

    try {
      const result = await operation();
      
      // Check if operation was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return null;
      }

      setState({
        data: result,
        loading: false,
        error: null,
        success: true,
      });

      retryCountRef.current = 0;
      onSuccess?.(result);
      return result;

    } catch (error) {
      // Check if operation was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return null;
      }

      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      // Handle retries
      if (retryCountRef.current < retryAttempts) {
        retryCountRef.current++;
        
        // Wait for retry delay
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        
        // Retry the operation
        return execute();
      }

      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });

      retryCountRef.current = 0;
      onError?.(errorMessage);
      return null;
    }
  }, [...dependencies, operation, retryAttempts, retryDelay]);

  const reset = useCallback(() => {
    // Cancel any ongoing operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });

    retryCountRef.current = 0;
  }, []);

  const retry = useCallback(() => {
    retryCountRef.current = 0;
    return execute();
  }, [execute]);

  // Reset on dependency change if enabled
  useEffect(() => {
    if (resetOnDependencyChange && dependencies.length > 0) {
      reset();
    }
  }, dependencies);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    retry,
    isLoading: state.loading,
    hasError: !!state.error,
    hasData: !!state.data,
    canRetry: !!state.error && retryAttempts > 0,
  };
};

// Specialized hook for data fetching
export const useAsyncFetch = <T>(
  url: string | null,
  options: RequestInit = {},
  hookOptions: UseAsyncOperationOptions = {}
) => {
  const operation = useCallback(async (): Promise<T> => {
    if (!url) throw new Error('URL is required');
    
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }, [url, JSON.stringify(options)]);

  return useAsyncOperation(operation, [url, JSON.stringify(options)], hookOptions);
};

// Specialized hook for form submissions
export const useAsyncSubmit = <TData, TResult>(
  submitFn: (data: TData) => Promise<TResult>,
  options: UseAsyncOperationOptions = {}
) => {
  const [submissionData, setSubmissionData] = useState<TData | null>(null);

  const operation = useCallback(async (): Promise<TResult> => {
    if (!submissionData) throw new Error('No data to submit');
    return submitFn(submissionData);
  }, [submitFn, submissionData]);

  const asyncOp = useAsyncOperation(operation, [submissionData], options);

  const submit = useCallback((data: TData) => {
    setSubmissionData(data);
    return asyncOp.execute();
  }, [asyncOp.execute]);

  return {
    ...asyncOp,
    submit,
    isSubmitting: asyncOp.loading,
  };
};