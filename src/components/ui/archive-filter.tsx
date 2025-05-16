import { useAuth } from '@/context/AuthContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Archive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ArchiveFilterProps {
  showArchived: boolean;
  onToggleShowArchived: (show: boolean) => void;
  archivedCount?: number; // Optional count of archived items to show
}

export function ArchiveFilter({
  showArchived,
  onToggleShowArchived,
  archivedCount,
}: ArchiveFilterProps) {
  const { currentUser } = useAuth();
  
  // Only admin users can see archived items
  if (currentUser?.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex items-center gap-2 bg-amber-50/50 p-2 px-3 rounded-md border border-amber-200">
      <Archive className="h-4 w-4 text-amber-600" />
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
        <Label 
          htmlFor="show-archived" 
          className="text-sm font-medium cursor-pointer"
        >
          Show archived records
          {archivedCount !== undefined && archivedCount > 0 && (
            <Badge 
              variant="outline" 
              className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200"
            >
              {archivedCount}
            </Badge>
          )}
        </Label>
        <Switch
          id="show-archived"
          checked={showArchived}
          onCheckedChange={onToggleShowArchived}
        />
      </div>
    </div>
  );
} 