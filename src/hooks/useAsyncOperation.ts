import { useState, useCallback } from 'react';

interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useAsyncOperation = <T>(
  operation: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (): Promise<T | null> => {
    setState(prevState => ({
      ...prevState,
      loading: true,
      error: null,
    }));

    try {
      const result = await operation();
      
      setState({
        data: result,
        loading: false,
        error: null,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });

      return null;
    }
  }, [...dependencies, operation]);

  return {
    ...state,
    execute,
  };
};