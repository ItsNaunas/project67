import { useRef, useCallback } from 'react';

export function useAutoResizeTextarea({ 
  minHeight = 60, 
  maxHeight = 200 
}: {
  minHeight?: number;
  maxHeight?: number;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to measure scrollHeight
    textarea.style.height = 'auto';
    
    // Calculate new height
    const newHeight = Math.min(
      Math.max(textarea.scrollHeight, minHeight),
      maxHeight
    );
    
    textarea.style.height = `${newHeight}px`;
  }, [minHeight, maxHeight]);

  return { textareaRef, adjustHeight };
}

