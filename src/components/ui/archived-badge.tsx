import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Archive } from 'lucide-react';

interface ArchivedBadgeProps {
  className?: string;
  size?: 'sm' | 'md'; // Allow different sizes
}

export function ArchivedBadge({ className, size = 'md' }: ArchivedBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`bg-amber-50 text-amber-700 border-amber-200 ${
        size === 'sm' ? 'text-xs py-0 px-1.5' : 'py-0.5 px-2'
      } ${className}`}
    >
      <Archive className={size === 'sm' ? 'h-3 w-3 mr-1' : 'h-3.5 w-3.5 mr-1.5'} />
      Archived
    </Badge>
  );
} 