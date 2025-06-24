// src/hooks/useTextEditing.ts

import { useRef, useCallback, useEffect } from 'react';

interface UseTextEditingProps {
  elementId: string;
  initialText: string;
  isEditing: boolean;
  onTextChange: (elementId: string, newText: string) => void;
  onEditingComplete: () => void;
}

/**
 * Custom hook for managing text editing state and behavior
 */
export const useTextEditing = ({
  elementId,
  initialText,
  isEditing,
  onTextChange,
  onEditingComplete
}: UseTextEditingProps) => {
  const textRef = useRef<HTMLDivElement>(null);
  const isCommittingRef = useRef(false);
  const originalTextRef = useRef(initialText);

  // Focus and select text when entering edit mode
  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus();
      
      // Select all text
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(textRef.current);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  // Track original text when entering edit mode
  useEffect(() => {
    if (isEditing) {
      originalTextRef.current = textRef.current?.textContent || initialText;
    }
  }, [isEditing, initialText]);

  const commitText = useCallback(() => {
    if (isCommittingRef.current || !textRef.current) return;
    
    isCommittingRef.current = true;
    const newText = textRef.current.textContent || '';
    
    if (newText !== originalTextRef.current) {
      onTextChange(elementId, newText);
    }
    
    onEditingComplete();
    isCommittingRef.current = false;
  }, [elementId, onTextChange, onEditingComplete]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commitText();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      // Restore original text
      if (textRef.current) {
        textRef.current.textContent = originalTextRef.current;
      }
      onEditingComplete();
    }
  }, [commitText, onEditingComplete]);

  const handleBlur = useCallback(() => {
    commitText();
  }, [commitText]);

  const handleInput = useCallback(() => {
    // Optionally handle real-time updates here
  }, []);

  return {
    textRef,
    handleKeyDown,
    handleBlur,
    handleInput,
    commitText
  };
};