import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  isTextArea?: boolean;
}

export function Input({ label, error, isTextArea, className, ...props }: InputProps) {
  const Component = isTextArea ? 'textarea' : 'input';
  
  return (
    <div className="w-full">
      {label && (
        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
          {label}
        </label>
      )}
      <Component
        className={twMerge(
          "input text-sm focus:ring-2 focus:ring-primary/20 transition-all",
          isTextArea && "resize-none h-20 py-3",
          error && "border-red-500 focus:ring-red-500/20",
          className
        )}
        {...(props as any)}
      />
      {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}
