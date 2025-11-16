'use client';

import { useState, ChangeEvent } from 'react';
import { cn } from '@/lib/utils';
import { useAutoResizeTextarea } from '@/hooks/use-auto-resize-textarea';
import { ArrowRight } from 'lucide-react';

interface VercelV0ChatProps {
  onSubmit: (idea: string) => void;
}

export function VercelV0Chat({ onSubmit }: VercelV0ChatProps) {
  const [value, setValue] = useState('');
  
  // Auto-resize hook
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center space-y-8">
      {/* Heading */}
      <h2 className="text-3xl md:text-4xl font-clash font-semibold text-white tracking-tight">
        Tell us your business idea
      </h2>
      
      <div className="w-full">
        {/* Main chat box */}
        <div className="relative rounded-2xl border border-mint-600/20 bg-charcoal-900/40 backdrop-blur-xl transition-all duration-300 hover:border-mint-500/40">
          
          {/* Textarea */}
          <div className="overflow-y-auto">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                setValue(e.target.value);
                adjustHeight(); // Auto-resize
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g., A mobile app that connects dog owners with local dog walkers..."
              className={cn(
                'w-full px-4 py-3',
                'resize-none',
                'bg-transparent',
                'border-none',
                'text-sm text-white placeholder:text-gray-500',
                'focus:outline-none focus-visible:ring-0',
                'min-h-[60px]',
                'font-light tracking-tight'
              )}
              style={{ overflow: 'hidden' }}
            />
          </div>

          {/* Footer with button */}
          <div className="flex items-center justify-between px-4 pb-4">
            <p className="text-xs text-gray-600">Press Enter to start</p>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!value.trim()}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium transition-all duration-300',
                value.trim()
                  ? 'bg-gradient-to-r from-mint-500 to-mint-600 text-white shadow-lg shadow-mint-500/25 hover:from-mint-600 hover:to-mint-700 hover:shadow-mint-500/40 hover:scale-105'
                  : 'bg-charcoal-900/60 text-gray-600 cursor-not-allowed'
              )}
            >
              <span>Start</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Subtext */}
        <p className="mt-4 text-center text-sm font-light text-gray-600">
          No credit card required • Results in minutes • No subscriptions, no hidden fees
        </p>
      </div>
    </div>
  );
}

