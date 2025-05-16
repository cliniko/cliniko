import React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionIcon?: LucideIcon;
  onSecondaryAction?: () => void;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
  iconClassName?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  secondaryActionLabel,
  secondaryActionIcon: SecondaryActionIcon,
  onSecondaryAction,
  className,
  size = 'default',
  iconClassName,
}: EmptyStateProps) => {
  // Size variations
  const sizes = {
    sm: {
      padding: 'p-4 sm:p-6',
      icon: 'h-8 w-8 sm:h-10 sm:w-10',
      title: 'text-sm sm:text-base font-medium',
      description: 'text-xs sm:text-sm',
      button: 'text-xs h-8',
    },
    default: {
      padding: 'p-6 sm:p-8',
      icon: 'h-12 w-12 sm:h-16 sm:w-16',
      title: 'text-base sm:text-lg font-medium',
      description: 'text-sm',
      button: 'text-sm',
    },
    lg: {
      padding: 'p-8 sm:p-12',
      icon: 'h-16 w-16 sm:h-20 sm:w-20',
      title: 'text-lg sm:text-xl font-medium',
      description: 'text-base',
      button: '',
    },
  };

  const currentSize = sizes[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        currentSize.padding,
        className
      )}
    >
      {Icon && (
        <div className="mb-4">
          <Icon 
            className={cn(
              currentSize.icon, 
              'text-gray-300', 
              iconClassName
            )} 
            aria-hidden="true" 
          />
        </div>
      )}
      <h3 className={cn('text-gray-700', currentSize.title)}>{title}</h3>
      {description && (
        <p className={cn('mt-1.5 text-gray-500 max-w-md', currentSize.description)}>
          {description}
        </p>
      )}
      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          {actionLabel && (
            <Button
              onClick={onAction}
              className={cn(currentSize.button)}
            >
              {ActionIcon && <ActionIcon className="h-4 w-4 mr-2" aria-hidden="true" />}
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button
              variant="outline"
              onClick={onSecondaryAction}
              className={cn(currentSize.button)}
            >
              {SecondaryActionIcon && <SecondaryActionIcon className="h-4 w-4 mr-2" aria-hidden="true" />}
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}; 