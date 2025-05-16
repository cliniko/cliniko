import { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Change {
  field: string;
  oldValue: any;
  newValue: any;
}

interface EditRecord {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  changes: Change[];
  reason?: string;
}

interface EditHistoryProps {
  consultationId: string;
}

function formatFieldName(field: string): string {
  // Convert camelCase or snake_case to Title Case with spaces
  return field
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^\w/, c => c.toUpperCase());
}

function formatFieldValue(value: any): string {
  if (value === null || value === undefined) return 'None';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

export function EditHistory({ consultationId }: EditHistoryProps) {
  const [editHistory, setEditHistory] = useState<EditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchEditHistory() {
      setLoading(true);
      setError(null);

      try {
        // Get edit history from database
        const { data, error } = await supabase
          .from('consultation_edits')
          .select(`
            id,
            consultation_id,
            user_id,
            edited_at,
            changes,
            reason,
            profiles:user_id(name)
          `)
          .eq('consultation_id', consultationId)
          .order('edited_at', { ascending: false });

        if (error) throw error;

        // Format the data
        const formattedHistory = (data || []).map(record => ({
          id: record.id,
          userId: record.user_id,
          userName: record.profiles?.name || 'Unknown User',
          timestamp: record.edited_at,
          changes: Array.isArray(record.changes) ? record.changes : [],
          reason: record.reason
        })) as EditRecord[];

        setEditHistory(formattedHistory);
      } catch (err: any) {
        console.error('Error fetching edit history:', err);
        setError(err.message || 'Failed to load edit history');
        toast({
          title: 'Error',
          description: 'Failed to load edit history',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    if (consultationId) {
      fetchEditHistory();
    }
  }, [consultationId, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading edit history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-destructive/20 rounded-md bg-destructive/10 text-destructive">
        {error}
      </div>
    );
  }

  if (editHistory.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No edit history available for this consultation.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Edit History</h3>
      
      <Accordion type="single" collapsible className="w-full">
        {editHistory.map((record) => (
          <AccordionItem key={record.id} value={record.id}>
            <AccordionTrigger className="hover:no-underline hover:bg-muted/50 px-4 rounded-md">
              <div className="flex flex-col sm:flex-row sm:justify-between w-full text-left">
                <div className="font-medium">
                  {format(new Date(record.timestamp), 'PPP p')}
                </div>
                <div className="text-sm text-muted-foreground">
                  {record.userName} • {record.changes.length} changes
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              {record.reason && (
                <div className="mb-4 p-3 bg-muted/30 rounded-md">
                  <span className="font-medium">Reason: </span> 
                  {record.reason}
                </div>
              )}
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field</TableHead>
                    <TableHead>Previous Value</TableHead>
                    <TableHead>New Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {record.changes.map((change, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {formatFieldName(change.field)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatFieldValue(change.oldValue)}
                      </TableCell>
                      <TableCell>
                        {formatFieldValue(change.newValue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
} 