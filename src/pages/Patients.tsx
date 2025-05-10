import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const Patients = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  
  // Form states
  const [name, setName] = useState('');
  const [dob, setDob] = useState<Date | undefined>();
  const [gender, setGender] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
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
        let query = supabase
          .from('patients')
          .select('*', { count: 'exact' });
          
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
          address: item.address || undefined,
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
  
  const handleSearch = () => {
    setPage(1); // Reset to first page
    refetchPatients();
  };
  
  const resetForm = () => {
    setName('');
    setDob(undefined);
    setGender('');
    setContact('');
    setEmail('');
    setAddress('');
    setMedicalHistory('');
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
      
      const { data, error } = await supabase
        .from('patients')
        .insert([
          {
            name,
            date_of_birth: format(dob, 'yyyy-MM-dd'),
            gender,
            contact: contact || null,
            email: email || null,
            address: address || null,
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Patient Registry</h1>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-xs sm:text-sm h-9">
              <UserPlus className="size-3.5 sm:size-4 mr-1.5 sm:mr-2" />
              Add New Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-xl md:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Add New Patient</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Enter the details for the new patient record
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-3 sm:py-4">
              <div className="space-y-1.5 sm:space-y-2 col-span-1 sm:col-span-2">
                <label htmlFor="name" className="block text-xs sm:text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
                <Input 
                  id="name" 
                  className="w-full h-8 sm:h-9 text-xs sm:text-sm" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <label htmlFor="dob" className="block text-xs sm:text-sm font-medium">Date of Birth <span className="text-red-500">*</span></label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-8 sm:h-9 text-xs sm:text-sm",
                        !dob && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {dob ? format(dob, 'PP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dob}
                      onSelect={setDob}
                      initialFocus
                      className="p-3 pointer-events-auto"
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <label htmlFor="gender" className="block text-xs sm:text-sm font-medium">Gender <span className="text-red-500">*</span></label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <label htmlFor="contact" className="block text-xs sm:text-sm font-medium">Contact Number</label>
                <Input 
                  id="contact" 
                  type="tel" 
                  className="w-full h-8 sm:h-9 text-xs sm:text-sm" 
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                />
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium">Email</label>
                <Input 
                  id="email" 
                  type="email" 
                  className="w-full h-8 sm:h-9 text-xs sm:text-sm"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-1.5 sm:space-y-2 col-span-1 sm:col-span-2">
                <label htmlFor="address" className="block text-xs sm:text-sm font-medium">Address</label>
                <Textarea 
                  id="address" 
                  className="w-full h-8 sm:h-9 text-xs sm:text-sm"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                />
              </div>
              
              <div className="space-y-1.5 sm:space-y-2 col-span-1 sm:col-span-2">
                <label htmlFor="medicalHistory" className="block text-xs sm:text-sm font-medium">Medical History</label>
                <Textarea 
                  id="medicalHistory" 
                  className="w-full h-8 sm:h-9 text-xs sm:text-sm"
                  value={medicalHistory}
                  onChange={e => setMedicalHistory(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mt-3 sm:mt-4 flex justify-end">
              <Button 
                onClick={handleNewPatient}
                className="bg-blue-600 hover:bg-blue-700 h-8 sm:h-9 text-xs sm:text-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 sm:mr-2 size-3.5 sm:size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Patient'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Search bar */}
      <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 bg-muted/50 rounded-md p-2 sm:p-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 size-3.5 sm:size-4 text-muted-foreground" />
          <Input 
            className="pl-8 sm:pl-10 h-8 sm:h-9 text-xs sm:text-sm" 
            placeholder="Search patients by name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSearch();
            }}
          />
        </div>
        <Button 
          variant="secondary"
          onClick={handleSearch}
          className="w-full xs:w-auto h-8 sm:h-9 text-xs sm:text-sm"
        >
          <Search className="size-3.5 sm:size-4 mr-1.5 sm:mr-2" />
          Search
        </Button>
      </div>
      
      {/* Patient Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px] sm:w-[200px] py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">NAME</TableHead>
              <TableHead className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">AGE</TableHead>
              <TableHead className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">GENDER</TableHead>
              <TableHead className="hidden sm:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">CONTACT</TableHead>
              <TableHead className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">EMAIL</TableHead>
              <TableHead className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-16 sm:h-24 text-center text-xs sm:text-sm">
                  <div className="flex items-center justify-center">
                    <Loader2 className="size-4 sm:size-5 animate-spin mr-1.5 sm:mr-2" />
                    Loading patients...
                  </div>
                </TableCell>
              </TableRow>
            ) : patientsData?.patients && patientsData.patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-16 sm:h-24 text-center text-xs sm:text-sm">
                  No patients found
                </TableCell>
              </TableRow>
            ) : (
              patientsData?.patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{patient.name}</TableCell>
                  <TableCell className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{patient.dateOfBirth ? `${calculateAge(patient.dateOfBirth)} yrs` : '—'}</TableCell>
                  <TableCell className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">
                    <Badge variant="outline" className="capitalize text-[10px] sm:text-xs h-5 sm:h-6">
                      {patient.gender}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">
                    {patient.contact || '—'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm truncate max-w-[150px]">
                    {patient.email || '—'}
                  </TableCell>
                  <TableCell className="text-right py-2 sm:py-3 px-2 sm:px-4">
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                      <span className="sr-only">View Patient</span>
                      <ChevronRight className="size-3.5 sm:size-4 text-primary" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {patientsData?.totalPages && patientsData.totalPages > 1 && (
        <Pagination className="mx-auto mt-6">
          <PaginationContent className="flex-wrap">
            <PaginationItem>
              <PaginationPrevious 
                className={`text-xs sm:text-sm h-8 sm:h-9 ${page === 1 ? 'pointer-events-none opacity-50' : ''}`}
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
                    className={`text-xs sm:text-sm h-8 sm:h-9 ${pageNumber === page ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground' : ''}`}
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
                className={`text-xs sm:text-sm h-8 sm:h-9 ${page === patientsData.totalPages ? 'pointer-events-none opacity-50' : ''}`}
                onClick={() => setPage(prev => Math.min(prev + 1, patientsData.totalPages))}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default Patients;
