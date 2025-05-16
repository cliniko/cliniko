import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import {
  CalendarIcon,
  Search,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CalendarPlus,
  ClipboardCheck,
  ArrowLeft,
  Eye,
  FileText,
  Calendar as CalendarIcon2,
  MoreVertical,
  Plus
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Patient, PatientMapping } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PatientForm } from '@/components/medical/PatientForm';
import { ArchiveFilter } from '@/components/ui/archive-filter';
import { ArchivedBadge } from '@/components/ui/archived-badge';

const Patients = () => {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [archivedCount, setArchivedCount] = useState(0);
  
  // Form states
  const [name, setName] = useState('');
  const [dob, setDob] = useState<Date | undefined>();
  const [gender, setGender] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [designation, setDesignation] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const patientsPerPage = 10;

  // Get patients with React Query for better performance
  const { 
    data: patientsData,
    isLoading,
    refetch: refetchPatients
  } = useQuery({
    queryKey: ['patients', page, searchTerm, showArchived],
    queryFn: async () => {
      try {
        // Always show all patients in the main list, regardless of search
        let query = supabase
          .from('patients')
          .select('*', { count: 'exact' });
          
        // Filter by search term if provided
        if (searchTerm) {
          query = query.ilike('name', `%${searchTerm}%`);
        }
        
        // Filter by archived status
        if (showArchived) {
          query = query.eq('is_archived', true);
        } else {
          query = query.eq('is_archived', false);
        }
        
        // Add pagination
        const startRange = (page - 1) * patientsPerPage;
        const endRange = startRange + patientsPerPage - 1;
        
        const { data, count, error } = await query
          .order('name', { ascending: true })
          .range(startRange, endRange);
        
        if (error) throw error;
        
        // Map the data to our Patient type
        const patients: Patient[] = (data || []).map((item: PatientMapping) => ({
          id: item.id,
          name: item.name,
          dateOfBirth: item.date_of_birth,
          gender: item.gender,
          contact: item.contact || undefined,
          email: item.email || undefined,
          position: item.position || undefined,
          designation: item.designation || undefined,
          medicalHistory: item.medical_history || undefined,
          createdAt: item.created_at,
          isArchived: item.is_archived
        }));
        
        // Count archived patients for the badge
        if (currentUser?.role === 'admin') {
          const { count: archivedCount, error: countError } = await supabase
            .from('patients')
            .select('*', { count: 'exact' })
            .eq('is_archived', true);
          
          if (!countError && count !== null) {
            setArchivedCount(archivedCount);
          }
        }
        
        return {
          patients,
          totalCount: count || 0,
          totalPages: count ? Math.ceil(count / patientsPerPage) : 1
        };
      } catch (error) {
        console.error("Error fetching patients:", error);
        throw error;
      }
    }
  });
  
  const handleSearch = async () => {
    setPage(1); // Reset to first page
    refetchPatients();
  };
  
  const resetForm = () => {
    setName('');
    setDob(undefined);
    setGender('');
    setContact('');
    setEmail('');
    setPosition('');
    setDesignation('');
    setMedicalHistory('');
  };
  
  const handleAddConsult = (patientId: string) => {
    // Navigate to the consultation form with patient ID
    // This will open the full consultation form for doctors
    navigate(`/consults/new?patientId=${patientId}`);
  };
  
  const handleSetAppointment = (patientId: string) => {
    // Navigate to the appointment scheduling form with patient ID
    // This will open a simplified version of the consult form for nurses
    // Only includes subjective/objective findings, nurse name, and scheduled date/time
    navigate(`/appointments/new?patientId=${patientId}`);
  };
  
  const handleViewDetails = (patientId: string) => {
    // Navigate to patient details page showing:
    // 1. Patient's personal and demographic information
    // 2. List of associated consultation records
    navigate(`/patients/${patientId}`);
  };
  
  const handleNewPatient = async () => {
    try {
      if (!name || !dob || !gender) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields (name, date of birth, gender)",
          variant: "destructive"
        });
        return;
      }
      
      if (!currentUser?.id) {
        toast({
          title: "Authentication error",
          description: "You must be logged in to add a patient",
          variant: "destructive"
        });
        return;
      }
      
      setIsSubmitting(true);
      
      // Ensure the date format follows FHIR standard (YYYY-MM-DD)
      const formattedDob = format(dob, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('patients')
        .insert([
          {
            name,
            date_of_birth: formattedDob, // ISO 8601 format for FHIR compliance
            gender,
            contact: contact || null,
            email: email || null,
            position: position || null,
            designation: designation || null,
            medical_history: medicalHistory || null,
            created_by: currentUser.id,
            is_archived: false
          }
        ])
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Patient added",
        description: "New patient has been successfully registered",
      });
      
      // Reset form fields
      resetForm();
      
      setIsAddModalOpen(false);
      refetchPatients(); // Refresh the patient list
    } catch (error: any) {
      console.error("Error adding patient:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add patient",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  };

  // Mobile card view component
  const MobilePatientsList = () => (
    <div className="space-y-4 md:hidden">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-md shadow">
          <Loader2 className="h-8 w-8 animate-spin text-medical-doctor mb-4" />
          <p className="text-sm text-gray-500">Loading patients...</p>
        </div>
      ) : patientsData?.patients && patientsData.patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-md shadow text-center">
          <UserPlus className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-base font-medium text-gray-700">No patients found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-xs">
            {searchTerm 
              ? `No results found for "${searchTerm}". Try a different search term.` 
              : "Start by registering your first patient using the button below."}
          </p>
          {!searchTerm && (
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 bg-medical-doctor hover:bg-medical-doctor-dark"
              size="sm"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Register New Patient
            </Button>
          )}
        </div>
      ) : (
        patientsData?.patients.map((patient) => (
          <Card key={patient.id} className="overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base font-medium">{patient.name}</CardTitle>
                  <CardDescription className="text-sm flex items-center gap-2 mt-1">
                    {patient.gender && (
                      <Badge variant="outline" className="capitalize">
                        {patient.gender}
                      </Badge>
                    )}
                    {patient.dateOfBirth && (
                      <Badge variant="outline" className="capitalize">
                        {calculateAge(patient.dateOfBirth)} yrs
                      </Badge>
                    )}
                  </CardDescription>
                </div>
                {(patient.position || patient.designation) && (
                  <Badge variant="outline" className="capitalize">
                    {patient.position || patient.designation}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              {patient.contact && (
                <p className="text-sm text-gray-700 truncate mb-1 flex items-center">
                  <span className="font-medium w-16">Contact:</span> 
                  <span className="truncate">{patient.contact}</span>
                </p>
              )}
              {patient.email && (
                <p className="text-sm text-gray-700 truncate flex items-center">
                  <span className="font-medium w-16">Email:</span> 
                  <span className="truncate">{patient.email}</span>
                </p>
              )}
            </CardContent>
            <CardFooter className="p-2 flex justify-end gap-1 bg-muted/10 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-normal"
                onClick={() => handleViewDetails(patient.id)}
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                Details
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-normal"
                onClick={() => handleAddConsult(patient.id)}
              >
                <FileText className="h-3.5 w-3.5 mr-1" />
                Consult
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-normal"
                onClick={() => handleSetAppointment(patient.id)}
              >
                <CalendarIcon2 className="h-3.5 w-3.5 mr-1" />
                Schedule
              </Button>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );

  // Desktop table view component
  const DesktopPatientsList = () => (
    <div className="hidden md:block rounded-md shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Position & Designation</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-medical-doctor" />
                  <span className="text-gray-500">Loading patients...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : patientsData?.patients && patientsData.patients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center">
                  <UserPlus className="h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-gray-500">No patients found</p>
                  {searchTerm && (
                    <p className="text-sm text-gray-400 mt-1">
                      No results found for "{searchTerm}"
                    </p>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            patientsData?.patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell className="capitalize">{patient.gender}</TableCell>
                <TableCell>{patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : "—"}</TableCell>
                <TableCell>
                  {patient.position && patient.designation 
                    ? `${patient.position}, ${patient.designation}`
                    : patient.position || patient.designation || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(patient.id)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleAddConsult(patient.id)}
                      title="New Consult"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleSetAppointment(patient.id)}
                      title="Schedule"
                    >
                      <CalendarIcon2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-medical-doctor">Patient Records</h1>
        <p className="text-gray-600 mt-1">Search through the patient registry.</p>
      </div>
      
      <Card className="border shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="relative flex-grow">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input 
                    type="text"
                    placeholder="Search patients..."
                    className="flex-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <div className="flex gap-2">
                    <Button 
                      className="bg-medical-doctor hover:bg-medical-doctor-dark sm:flex-none"
                      onClick={handleSearch}
                    >
                      <Search className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Search</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('');
                        refetchPatients();
                      }}
                      className="sm:flex-none"
                    >
                      <span className="hidden sm:inline">View All Records</span>
                      <span className="sm:hidden">All</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile and Desktop Views */}
            <MobilePatientsList />
            <DesktopPatientsList />
            
            <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full sm:w-auto flex items-center justify-center gap-1"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
              
              <Button 
                size="sm"
                className="w-full sm:w-auto bg-medical-doctor hover:bg-medical-doctor-dark"
                onClick={() => setIsAddModalOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-1.5" />
                <span>Register New Patient</span>
              </Button>
            </div>
            
            {/* Pagination */}
            {patientsData?.totalPages && patientsData.totalPages > 1 && (
              <Pagination className="mx-auto mt-4">
                <PaginationContent className="flex flex-wrap gap-1">
                  <PaginationItem>
                    <PaginationPrevious 
                      className={`${page === 1 ? 'pointer-events-none opacity-50' : ''}`}
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(patientsData.totalPages, 5) }, (_, i) => {
                    // Logic to show page numbers
                    let pageNumber = 0;
                    const totalPages = patientsData.totalPages;
                    
                    if (totalPages <= 5) {
                      // If 5 or fewer pages, show all
                      pageNumber = i + 1;
                    } else if (page <= 3) {
                      // If on pages 1-3, show pages 1-5
                      if (i < 4) {
                        pageNumber = i + 1;
                      } else {
                        return (
                          <PaginationItem key="ellipsis-end" className="hidden sm:flex">
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                    } else if (page >= totalPages - 2) {
                      // If on last 3 pages, show last 5 pages
                      if (i === 0) {
                        return (
                          <PaginationItem key="ellipsis-start" className="hidden sm:flex">
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      } else {
                        pageNumber = totalPages - 4 + i;
                      }
                    } else {
                      // Otherwise show 2 before current page, current page, and 2 after
                      if (i === 0) {
                        return (
                          <PaginationItem key="ellipsis-start" className="hidden sm:flex">
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      } else if (i === 4) {
                        return (
                          <PaginationItem key="ellipsis-end" className="hidden sm:flex">
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      } else {
                        pageNumber = page - 1 + (i - 1);
                      }
                    }
                    
                    if (pageNumber === 0) return null;
                    
                    // On mobile, only show current, previous and next page numbers
                    const isMobileVisible = pageNumber === page || pageNumber === page - 1 || pageNumber === page + 1;
                    
                    return (
                      <PaginationItem key={pageNumber} className={!isMobileVisible ? 'hidden sm:flex' : ''}>
                        <PaginationLink
                          onClick={() => setPage(pageNumber)}
                          isActive={pageNumber === page}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      className={`${page === patientsData.totalPages ? 'pointer-events-none opacity-50' : ''}`}
                      onClick={() => setPage(prev => Math.min(prev + 1, patientsData.totalPages))}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </CardContent>
      </Card>
        
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>
              Enter the patient's details below to create a new record
            </DialogDescription>
          </DialogHeader>
          
          <PatientForm
            onSave={handleNewPatient}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Patients;
