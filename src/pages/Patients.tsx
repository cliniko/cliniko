
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Search, UserRound, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Patient } from '@/types';

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [dob, setDob] = useState<Date | undefined>();
  const [gender, setGender] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const patientsPerPage = 10;
  
  // Fetch patients from Supabase
  const fetchPatients = async (page = 1, searchQuery = '') => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('patients')
        .select('*', { count: 'exact' });
        
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      
      // Add pagination
      const startRange = (page - 1) * patientsPerPage;
      const endRange = startRange + patientsPerPage - 1;
      
      const { data, count, error } = await query
        .order('name', { ascending: true })
        .range(startRange, endRange);
      
      if (error) throw error;
      
      setPatients(data || []);
      if (count !== null) {
        setTotalPages(Math.ceil(count / patientsPerPage));
      }
    } catch (error: any) {
      console.error("Error fetching patients:", error);
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPatients(page, searchTerm);
  }, [page]);
  
  const handleSearch = () => {
    setPage(1); // Reset to first page
    fetchPatients(1, searchTerm);
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
      
      const { data, error } = await supabase
        .from('patients')
        .insert([
          {
            name,
            date_of_birth: format(dob, 'yyyy-MM-dd'),
            gender,
            contact,
            email,
            address,
            medical_history: medicalHistory,
            created_by: currentUser?.id
          }
        ])
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Patient added",
        description: "New patient has been successfully registered",
      });
      
      // Reset form fields
      setName('');
      setDob(undefined);
      setGender('');
      setContact('');
      setEmail('');
      setAddress('');
      setMedicalHistory('');
      
      setIsAddModalOpen(false);
      fetchPatients(page, searchTerm); // Refresh the patient list
    } catch (error: any) {
      console.error("Error adding patient:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add patient",
        variant: "destructive"
      });
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-medical-primary">FHIR Patient Registry</h1>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-medical-primary hover:bg-medical-primary/90">
              <UserRound size={16} className="mr-1" />
              Add New Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>
                Enter the details for the new patient record
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
                <Input 
                  id="name" 
                  className="w-full" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="dob" className="block text-sm font-medium">Date of Birth <span className="text-red-500">*</span></label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dob && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
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
              
              <div className="space-y-2">
                <label htmlFor="gender" className="block text-sm font-medium">Gender <span className="text-red-500">*</span></label>
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
              
              <div className="space-y-2">
                <label htmlFor="contact" className="block text-sm font-medium">Contact Number</label>
                <Input 
                  id="contact" 
                  type="tel" 
                  className="w-full" 
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">Email</label>
                <Input 
                  id="email" 
                  type="email" 
                  className="w-full"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium">Address</label>
                <Textarea 
                  id="address" 
                  className="w-full"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                />
              </div>
              
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label htmlFor="medicalHistory" className="block text-sm font-medium">Medical History</label>
                <Textarea 
                  id="medicalHistory" 
                  className="w-full"
                  value={medicalHistory}
                  onChange={e => setMedicalHistory(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={handleNewPatient}
                className="bg-medical-primary hover:bg-medical-primary/90"
              >
                Save Patient
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            className="pl-10" 
            placeholder="Search patients by name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSearch();
            }}
          />
        </div>
        <Button 
          className="bg-medical-gray"
          onClick={handleSearch}
        >
          <Search size={16} className="mr-1" />
          Search
        </Button>
      </div>
      
      <div className="bg-white rounded-md shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading patients...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No patients found
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {patient.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.dateOfBirth ? `${calculateAge(patient.dateOfBirth)} yrs` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.contact || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.email || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Button size="sm" variant="ghost" className="text-medical-primary">View</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => page > 1 && setPage(page - 1)}
              disabled={page <= 1 || isLoading}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => page < totalPages && setPage(page + 1)}
              disabled={page >= totalPages || isLoading}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-l-md"
                  onClick={() => page > 1 && setPage(page - 1)}
                  disabled={page <= 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {/* Page number buttons */}
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <Button 
                      key={pageNumber}
                      variant="outline" 
                      size="sm"
                      className={page === pageNumber ? 'bg-medical-primary text-white' : ''}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-r-md"
                  onClick={() => page < totalPages && setPage(page + 1)}
                  disabled={page >= totalPages || isLoading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Patients;
