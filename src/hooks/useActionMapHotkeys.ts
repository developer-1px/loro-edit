import { useHotkeys } from 'react-hotkeys-hook';

type HotkeyOptions = Parameters<typeof useHotkeys>[2];
import { useCallback } from 'react';

interface ActionConfig {
  keys: string | string[];
  action: (e: KeyboardEvent) => void;
  conditions?: () => boolean;
  options?: HotkeyOptions;
  description?: string;
}

interface ActionMap {
  [actionName: string]: ActionConfig;
}

interface UseActionMapHotkeysOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  enableOnFormTags?: boolean;
}

export const useActionMapHotkeys = (
  actionMap: ActionMap,
  dependencies: any[] = [],
  options: UseActionMapHotkeysOptions = {}
) => {
  const {
    enabled = true,
    preventDefault = true,
    enableOnFormTags = false,
  } = options;

  // Default hotkey options
  const defaultOptions: HotkeyOptions = {
    enabled,
    preventDefault,
    enableOnFormTags,
  };

  // Register each action in the action map
  Object.entries(actionMap).forEach(([, config]) => {
    const {
      keys,
      action,
      conditions,
      options: configOptions = {},
    } = config;

    // Merge default options with config-specific options
    const mergedOptions = {
      ...defaultOptions,
      ...configOptions,
      enabled: enabled && (conditions ? conditions() : true),
    };

    // Handle multiple key combinations
    const keyArray = Array.isArray(keys) ? keys : [keys];
    
    keyArray.forEach(keyCombo => {
      useHotkeys(
        keyCombo,
        (e) => {
          // Additional condition check at runtime
          if (conditions && !conditions()) {
            return;
          }
          action(e);
        },
        mergedOptions,
        dependencies
      );
    });
  });

  // Utility function to check if an action is enabled
  const isActionEnabled = useCallback((actionName: string): boolean => {
    const config = actionMap[actionName];
    if (!config) return false;
    return enabled && (config.conditions ? config.conditions() : true);
  }, [actionMap, enabled]);

  // Utility function to get all registered keys
  const getRegisteredKeys = useCallback((): string[] => {
    return Object.values(actionMap).flatMap(config => 
      Array.isArray(config.keys) ? config.keys : [config.keys]
    );
  }, [actionMap]);

  // Utility function to get action descriptions for help
  const getActionDescriptions = useCallback(() => {
    return Object.entries(actionMap).reduce((acc, [name, config]) => {
      if (config.description) {
        acc[name] = {
          keys: config.keys,
          description: config.description,
          enabled: isActionEnabled(name),
        };
      }
      return acc;
    }, {} as Record<string, { keys: string | string[]; description: string; enabled: boolean }>);
  }, [actionMap, isActionEnabled]);

  return {
    isActionEnabled,
    getRegisteredKeys,
    getActionDescriptions,
  };
};