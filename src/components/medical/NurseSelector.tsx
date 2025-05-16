import { useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { useUsersByRole } from '@/hooks/use-users-by-role';
import { Skeleton } from '@/components/ui/skeleton';

interface NurseSelectorProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function NurseSelector({
  value,
  onChange,
  required = false,
  label = "Attending Nurse",
  placeholder = "Select a nurse...",
  className = "",
  disabled = false
}: NurseSelectorProps) {
  const { data: nurses, isLoading, error } = useUsersByRole({ role: 'nurse' });
  
  // Handle selection change
  const handleValueChange = (newValue: string) => {
    onChange(newValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}
      
      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : error ? (
        <div className="text-destructive text-sm">Error loading nurses</div>
      ) : (
        <Select
          value={value}
          onValueChange={handleValueChange}
          disabled={disabled || nurses?.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Available Nurses</SelectLabel>
              {nurses?.length === 0 ? (
                <SelectItem value="none" disabled>
                  No nurses available
                </SelectItem>
              ) : (
                nurses?.map((nurse) => (
                  <SelectItem key={nurse.id} value={nurse.id}>
                    {nurse.name}
                  </SelectItem>
                ))
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
    </div>
  );
} 