import React from 'react';
import { cn } from '@/lib/utils';

interface SkipToContentProps {
  targetId?: string;
  className?: string;
}

export const SkipToContent = ({
  targetId = 'main-content',
  className,
}: SkipToContentProps) => {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        // Base styles
        "absolute left-4 top-4 z-50 transform -translate-y-20 focus:translate-y-0",
        "px-4 py-2 bg-primary text-primary-foreground",
        "rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-primary",
        "transition-transform focus:transition-transform",
        className
      )}
    >
      Skip to content
    </a>
  );
}; 