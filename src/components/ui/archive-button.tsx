import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Archive, ArchiveRestore } from 'lucide-react';

interface ArchiveButtonProps {
  isArchived: boolean;
  onArchive: () => Promise<void>;
  onUnarchive: () => Promise<void>;
  recordType: string; // "patient", "consultation", or "appointment"
  showAsMenuItem?: boolean; // If true, render without icon and with simpler styling for dropdown menu
}

export const ArchiveButton = ({
  isArchived,
  onArchive,
  onUnarchive,
  recordType,
  showAsMenuItem = false,
}: ArchiveButtonProps) => {
  const [showDialog, setShowDialog] = useState(false);

  const handleAction = async () => {
    try {
      if (isArchived) {
        await onUnarchive();
      } else {
        await onArchive();
      }
    } catch (error) {
      console.error(`Error ${isArchived ? 'unarchiving' : 'archiving'} ${recordType}:`, error);
    } finally {
      setShowDialog(false);
    }
  };

  const getTitle = () => {
    if (isArchived) {
      return `Restore ${recordType}`;
    } else {
      return `Archive ${recordType}`;
    }
  };

  const getDescription = () => {
    if (isArchived) {
      return `This ${recordType} will be restored and visible in the regular view. Are you sure?`;
    } else {
      return `This ${recordType} will be archived and hidden from regular views. Only administrators can access archived records. Are you sure?`;
    }
  };

  if (showAsMenuItem) {
    return (
      <>
        <button 
          onClick={() => setShowDialog(true)}
          className={`flex w-full items-center px-2 py-1.5 text-sm ${!isArchived ? 'text-amber-600 hover:text-amber-700' : 'text-blue-600 hover:text-blue-700'}`}
        >
          {isArchived ? (
            <>
              <ArchiveRestore className="mr-2 h-4 w-4" />
              <span>Restore {recordType}</span>
            </>
          ) : (
            <>
              <Archive className="mr-2 h-4 w-4" />
              <span>Archive {recordType}</span>
            </>
          )}
        </button>

        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
              <AlertDialogDescription>{getDescription()}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleAction}>
                {isArchived ? 'Restore' : 'Archive'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
      <Button 
        variant={isArchived ? "outline" : "outline"}
        size="sm"
        onClick={() => setShowDialog(true)}
        className={isArchived 
          ? "text-blue-600 border-blue-600 hover:bg-blue-50" 
          : "text-amber-600 border-amber-600 hover:bg-amber-50"
        }
      >
        {isArchived ? (
          <>
            <ArchiveRestore className="mr-2 h-4 w-4" />
            <span>Restore</span>
          </>
        ) : (
          <>
            <Archive className="mr-2 h-4 w-4" />
            <span>Archive</span>
          </>
        )}
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
            <AlertDialogDescription>{getDescription()}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction}>
              {isArchived ? 'Restore' : 'Archive'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}; 