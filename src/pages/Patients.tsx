import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Calendar as CalendarIcon2
} from 'lucide-react';
import { format } from 'date-fns';
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const Patients = () => {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
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
    queryKey: ['patients', page, searchTerm],
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
          createdAt: item.created_at
        }));
        
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
            created_by: currentUser.id
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

  return (
    <div className="container mx-auto max-w-6xl p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-blue-700">Patient Records</h1>
        <p className="text-gray-600 mt-2">Search through the patient registry.</p>
      </div>
      
      <Card className="border shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="flex">
                  <Input 
                    type="text"
                    placeholder="Search patients..."
                    className="flex-1 pr-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button 
                    className="ml-2 bg-blue-700 hover:bg-blue-800"
                    onClick={handleSearch}
                  >
                    Search
                  </Button>
                  <Button 
                    className="ml-2" 
                    variant="outline" 
                    onClick={() => refetchPatients()}
                  >
                    View All Records
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="rounded-md overflow-x-auto border">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="py-3 px-4 text-sm font-medium">Name</TableHead>
                    <TableHead className="py-3 px-4 text-sm font-medium">Gender</TableHead>
                    <TableHead className="py-3 px-4 text-sm font-medium">Age</TableHead>
                    <TableHead className="py-3 px-4 text-sm font-medium">Position & Designation</TableHead>
                    <TableHead className="py-3 px-4 text-sm font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Loading patients...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : patientsData?.patients && patientsData.patients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No patients found
                      </TableCell>
                    </TableRow>
                  ) : (
                    patientsData?.patients.map((patient) => (
                      <TableRow key={patient.id} className="hover:bg-gray-50">
                        <TableCell className="py-3 px-4 font-medium">{patient.name}</TableCell>
                        <TableCell className="py-3 px-4 capitalize">{patient.gender}</TableCell>
                        <TableCell className="py-3 px-4">{patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : "—"}</TableCell>
                        <TableCell className="py-3 px-4">
                          {patient.position && patient.designation 
                            ? `${patient.position}, ${patient.designation}`
                            : patient.position || patient.designation || "—"}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1.5"
                              onClick={() => handleAddConsult(patient.id)}
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>New Consult</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1.5"
                              onClick={() => handleSetAppointment(patient.id)}
                            >
                              <CalendarIcon2 className="h-3.5 w-3.5" />
                              <span>Schedule</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleViewDetails(patient.id)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
              
              <Button 
                size="sm"
                className="bg-blue-700 hover:bg-blue-800"
                onClick={() => setIsAddModalOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-1.5" />
                Register New Patient
              </Button>
            </div>
            
            {/* Pagination */}
            {patientsData?.totalPages && patientsData.totalPages > 1 && (
              <Pagination className="mx-auto mt-4">
                <PaginationContent className="flex-wrap">
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
                          <PaginationItem key="ellipsis-end">
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                    } else if (page >= totalPages - 2) {
                      // If on last 3 pages, show last 5 pages
                      if (i === 0) {
                        return (
                          <PaginationItem key="ellipsis-start">
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
                          <PaginationItem key="ellipsis-start">
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      } else if (i === 4) {
                        return (
                          <PaginationItem key="ellipsis-end">
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      } else {
                        pageNumber = page - 1 + (i - 1);
                      }
                    }
                    
                    if (pageNumber === 0) return null;
                    
                    return (
                      <PaginationItem key={pageNumber}>
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
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Register New Patient</DialogTitle>
              <DialogDescription>
              Enter patient details to create a new record
              </DialogDescription>
            </DialogHeader>
            
          <div className="grid grid-cols-1 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                <Input 
                  id="name" 
                  value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter patient's full name"
                />
              </div>
              
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth (YYYY-MM-DD) <span className="text-destructive">*</span></Label>
                <div className="flex">
                  <div className="relative flex-1">
                    <Input
                      id="dob"
                      className="pr-10"
                      placeholder="YYYY-MM-DD"
                      value={dob ? format(dob, "yyyy-MM-dd") : ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setDob(undefined);
                        } else {
                          try {
                            // Only set if it's a valid date
                            const date = new Date(val);
                            if (!isNaN(date.getTime())) {
                              setDob(date);
                            }
                          } catch (e) {
                            // Invalid date - do nothing
                          }
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      type="button"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-muted-foreground"
                      onClick={() => setIsCalendarOpen(true)}
                    >
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <span className="sr-only">Open calendar</span>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dob}
                        onSelect={(date) => {
                          if (date) {
                            setDob(date);
                            // Close the calendar after selection
                            setIsCalendarOpen(false);
                          }
                        }}
                      initialFocus
                      disabled={(date) => date > new Date()}
                        fromDate={new Date("1900-01-01")}
                    />
                  </PopoverContent>
                </Popover>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Gender <span className="text-destructive">*</span></Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              </div>
              
              <div className="space-y-2">
              <Label htmlFor="contact">Contact Number</Label>
                <Input 
                  id="contact" 
                  value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Enter contact number"
                />
              </div>
              
              <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                />
              </div>
              
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Enter position"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="Enter designation"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="medical-history">Medical History</Label>
              <Textarea
                id="medical-history"
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                placeholder="Enter any relevant medical history"
                className="min-h-[80px]"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleNewPatient}
                disabled={isSubmitting}
              className="bg-blue-700 hover:bg-blue-800"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Registering..." : "Register Patient"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
    </div>
  );
};

export default Patients;
