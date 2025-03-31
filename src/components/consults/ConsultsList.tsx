
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { FileText, Eye, Edit, Trash } from 'lucide-react';

interface Consultation {
  id: string;
  date: string;
  time: string;
  patient_id: string;
  patient_type: string;
  chief_complaint: string;
  // Add other fields as needed
}

interface ConsultsListProps {
  consultations: Consultation[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ConsultsList = ({
  consultations,
  onView,
  onEdit,
  onDelete
}: ConsultsListProps) => {
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

  return (
    <div className="bg-white rounded-md shadow overflow-hidden">
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
              <TableCell>{consult.patient_id}</TableCell>
              <TableCell>{consult.patient_type}</TableCell>
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
};

export default ConsultsList;
