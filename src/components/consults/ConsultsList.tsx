import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { FileText, Eye, Edit, Trash, Loader2, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Consultation {
  id: string;
  date: string;
  time: string;
  patient_id: string;
  patient_name?: string; // From join with patients table
  patient_type: string;
  chief_complaint: string;
  // Add other fields as needed
}

interface ConsultsListProps {
  consultations: Consultation[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const ConsultsList = ({
  consultations,
  onView,
  onEdit,
  onDelete,
  isLoading = false
}: ConsultsListProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-md shadow p-6 min-h-[400px] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-medical-primary mb-4" />
        <p>Loading consultations...</p>
      </div>
    );
  }

  if (consultations.length === 0) {
    return (
      <div className="bg-white rounded-md shadow p-6 min-h-[400px] flex flex-col items-center justify-center text-center">
        <FileText size={64} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-medium mb-2">No consults found</h2>
        <p className="text-gray-500 max-w-md mb-6">
          Start by adding your first consultation record using the Add button above
        </p>
        <div className="text-center bg-medical-light p-4 rounded-lg max-w-xl mx-auto mt-6">
          <h3 className="font-medium text-medical-primary mb-2">About FHIR Implementation</h3>
          <p className="text-sm text-gray-600">
            This application now includes FHIR compliance for better interoperability with other healthcare systems.
          </p>
        </div>
      </div>
    );
  }

  // Card view for mobile screens
  const MobileView = () => (
    <div className="space-y-4 md:hidden">
      {consultations.map((consult) => (
        <Card key={consult.id} className="overflow-hidden">
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base font-medium">{consult.patient_name || 'Unknown Patient'}</CardTitle>
                <CardDescription className="text-sm">
                  {format(new Date(consult.date), 'MM/dd/yyyy')} at {consult.time}
                </CardDescription>
              </div>
              <Badge variant="outline" className="capitalize">
                {consult.patient_type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <p className="text-sm text-gray-700 truncate">{consult.chief_complaint}</p>
          </CardContent>
          <CardFooter className="p-2 flex justify-end bg-muted/10 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(consult.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(consult.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(consult.id)}
                  className="text-red-500 focus:text-red-500"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  // Table view for desktop screens
  const DesktopView = () => (
    <div className="hidden md:block rounded-md shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Chief Complaint</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {consultations.map((consult) => (
            <TableRow key={consult.id}>
              <TableCell>{format(new Date(consult.date), 'MM/dd/yyyy')}</TableCell>
              <TableCell>{consult.time}</TableCell>
              <TableCell>{consult.patient_name || 'Unknown Patient'}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {consult.patient_type}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate">{consult.chief_complaint}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onView(consult.id)}
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onEdit(consult.id)}
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDelete(consult.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
      <MobileView />
      <DesktopView />
    </>
  );
};

export default ConsultsList;
