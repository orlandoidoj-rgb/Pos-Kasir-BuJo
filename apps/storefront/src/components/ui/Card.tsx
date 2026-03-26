import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean;
}

export function Card({ children, className, onClick, noPadding, ...props }: CardProps) {
  return (
    <div 
      className={twMerge(
        "card overflow-hidden transition-all duration-200",
        !noPadding && "p-4",
        onClick && "cursor-pointer active:scale-95 active:shadow-card-hover",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
