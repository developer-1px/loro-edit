// src/components/ui/KeyboardInspector.tsx

import React, { useState, useEffect } from 'react';
import { Keyboard } from 'lucide-react';

interface Shortcut {
  keys: string;
  description: string;
  category: string;
}

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
const modKey = isMac ? 'Cmd' : 'Ctrl';

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: 'Esc', description: 'Clear selection', category: 'Navigation' },
  
  // Edit Operations
  { keys: `${modKey}+Z`, description: 'Undo', category: 'Edit' },
  { keys: `${modKey}+Y / ${modKey}+Shift+Z`, description: 'Redo', category: 'Edit' },
  { keys: 'Delete / Backspace', description: 'Delete selected element', category: 'Edit' },
  
  // Clipboard
  { keys: `${modKey}+C`, description: 'Copy selected element', category: 'Clipboard' },
  { keys: `${modKey}+X`, description: 'Cut selected element', category: 'Clipboard' },
  { keys: `${modKey}+V`, description: 'Paste element', category: 'Clipboard' },
  
  // UI
  { keys: `${modKey}+\\`, description: 'Toggle UI panels', category: 'UI' },
];

export const KeyboardInspector: React.FC = () => {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [lastShortcut, setLastShortcut] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = new Set(pressedKeys);
      
      // Add modifier keys
      if (e.metaKey) keys.add('Cmd');
      if (e.ctrlKey) keys.add('Ctrl');
      if (e.shiftKey) keys.add('Shift');
      if (e.altKey) keys.add('Alt');
      
      // Add the actual key
      if (e.key === ' ') {
        keys.add('Space');
      } else if (e.key === 'Escape') {
        keys.add('Esc');
      } else if (e.key === 'Backspace') {
        keys.add('Backspace');
      } else if (e.key === 'Delete') {
        keys.add('Delete');
      } else if (e.key === 'Enter') {
        keys.add('Enter');
      } else if (e.key === 'Tab') {
        keys.add('Tab');
      } else if (e.key === 'ArrowUp') {
        keys.add('↑');
      } else if (e.key === 'ArrowDown') {
        keys.add('↓');
      } else if (e.key === 'ArrowLeft') {
        keys.add('←');
      } else if (e.key === 'ArrowRight') {
        keys.add('→');
      } else if (e.key === '\\') {
        keys.add('\\');
      } else if (e.key.length === 1) {
        keys.add(e.key.toUpperCase());
      }
      
      setPressedKeys(keys);
      
      // Check if this matches any shortcut
      const keyCombo = Array.from(keys).sort((a, b) => {
        // Sort modifiers first
        const modifiers = ['Cmd', 'Ctrl', 'Shift', 'Alt'];
        const aIsMod = modifiers.includes(a);
        const bIsMod = modifiers.includes(b);
        if (aIsMod && !bIsMod) return -1;
        if (!aIsMod && bIsMod) return 1;
        return a.localeCompare(b);
      }).join('+');
      
      const matchedShortcut = shortcuts.find(s => {
        return s.keys.split(' / ').some(variant => {
          const normalizedVariant = variant.trim();
          const normalizedCombo = keyCombo;
          // Direct comparison
          return normalizedVariant === normalizedCombo;
        });
      });
      
      if (matchedShortcut) {
        setLastShortcut(matchedShortcut.description);
        setTimeout(() => setLastShortcut(''), 2000);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keys = new Set(pressedKeys);
      
      // Remove modifier keys
      if (!e.metaKey) keys.delete('Cmd');
      if (!e.ctrlKey) keys.delete('Ctrl');
      if (!e.shiftKey) keys.delete('Shift');
      if (!e.altKey) keys.delete('Alt');
      
      // Remove the actual key
      if (e.key === ' ') {
        keys.delete('Space');
      } else if (e.key === 'Escape') {
        keys.delete('Esc');
      } else if (e.key === 'Backspace') {
        keys.delete('Backspace');
      } else if (e.key === 'Delete') {
        keys.delete('Delete');
      } else if (e.key === 'Enter') {
        keys.delete('Enter');
      } else if (e.key === 'Tab') {
        keys.delete('Tab');
      } else if (e.key === 'ArrowUp') {
        keys.delete('↑');
      } else if (e.key === 'ArrowDown') {
        keys.delete('↓');
      } else if (e.key === 'ArrowLeft') {
        keys.delete('←');
      } else if (e.key === 'ArrowRight') {
        keys.delete('→');
      } else if (e.key === '\\') {
        keys.delete('\\');
      } else if (e.key.length === 1) {
        keys.delete(e.key.toUpperCase());
      }
      
      setPressedKeys(keys);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [pressedKeys]);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Current Key Display */}
      <div className="p-4 border-b bg-gray-50">
        <div className="text-xs text-gray-500 mb-1">Current Keys</div>
        <div className="flex items-center gap-2 min-h-[32px]">
          {pressedKeys.size > 0 ? (
            Array.from(pressedKeys).map((key) => (
              <span
                key={key}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-mono"
              >
                {key}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm">Press any key...</span>
          )}
        </div>
        {lastShortcut && (
          <div className="mt-2 text-sm text-green-600 font-medium animate-pulse">
            → {lastShortcut}
          </div>
        )}
      </div>

      {/* Shortcuts List */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Keyboard className="w-4 h-4" />
          Keyboard Shortcuts
        </h3>
        
        {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
          <div key={category} className="mb-4">
            <h4 className="text-xs font-medium text-gray-600 mb-2">{category}</h4>
            <div className="space-y-1">
              {categoryShortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-50"
                >
                  <span className="text-xs text-gray-700">{shortcut.description}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.split(' / ').map((key, keyIndex) => (
                      <React.Fragment key={keyIndex}>
                        {keyIndex > 0 && <span className="text-gray-400 text-xs">/</span>}
                        <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 border border-gray-200 rounded font-mono">
                          {key}
                        </kbd>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};