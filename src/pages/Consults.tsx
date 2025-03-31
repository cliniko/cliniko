
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Plus, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const Consults = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();
  
  const handleNewConsult = () => {
    toast({
      title: "Consultation added",
      description: "New consultation has been successfully created",
    });
    setIsAddModalOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-medical-primary">Consults</h1>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-medical-primary hover:bg-medical-primary/90">
              <Plus size={16} className="mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Consultation</DialogTitle>
              <DialogDescription>
                Enter the details for the new consultation record
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="date" className="block text-sm font-medium">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="time" className="block text-sm font-medium">Time</label>
                <Input id="time" type="time" className="w-full" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="patientType" className="block text-sm font-medium">Patient Type</label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="new">New Patient</SelectItem>
                    <SelectItem value="followup">Follow-up</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="patient" className="block text-sm font-medium">Patient</label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient1">John Doe</SelectItem>
                    <SelectItem value="patient2">Jane Smith</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label htmlFor="chiefComplaint" className="block text-sm font-medium">Chief Complaint</label>
                <Textarea id="chiefComplaint" className="w-full" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="sbp" className="block text-sm font-medium">SBP</label>
                <Input id="sbp" type="number" className="w-full" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="dbp" className="block text-sm font-medium">DBP</label>
                <Input id="dbp" type="number" className="w-full" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="temp" className="block text-sm font-medium">Temp (°C)</label>
                <Input id="temp" type="number" step="0.1" className="w-full" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="pr" className="block text-sm font-medium">PR</label>
                <Input id="pr" type="number" className="w-full" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="height" className="block text-sm font-medium">Height (cm)</label>
                <Input id="height" type="number" className="w-full" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="weight" className="block text-sm font-medium">Weight (kg)</label>
                <Input id="weight" type="number" step="0.1" className="w-full" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="rr" className="block text-sm font-medium">RR</label>
                <Input id="rr" type="number" className="w-full" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="spo2" className="block text-sm font-medium">SpO2</label>
                <Input id="spo2" type="number" className="w-full" />
              </div>
              
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label htmlFor="subjective" className="block text-sm font-medium">Subjective</label>
                <Textarea id="subjective" className="w-full h-20" />
              </div>
              
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label htmlFor="objective" className="block text-sm font-medium">Objective</label>
                <Input id="objective" className="w-full" placeholder="Add objective item" />
              </div>
              
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label htmlFor="assessment" className="block text-sm font-medium">Assessment (ICD-10 Codes)</label>
                <Input id="assessment" className="w-full" placeholder="Search ICD-10 codes or descriptions" />
              </div>
              
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label htmlFor="plan" className="block text-sm font-medium">Plan</label>
                <Input id="plan" className="w-full" placeholder="Add plan item" />
              </div>
              
              <div className="space-y-2 col-span-1 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium">PRESCRIPTION</label>
                  <Button type="button" size="sm" variant="outline" className="h-8">
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label htmlFor="attendingNurse" className="block text-sm font-medium">Attending Nurse</label>
                <Input id="attendingNurse" className="w-full" />
              </div>
              
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label htmlFor="attendingPhysician" className="block text-sm font-medium">Attending Physician</label>
                <Input id="attendingPhysician" className="w-full" />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">BP Monitoring</label>
                <div className="flex space-x-2">
                  <Button variant="outline" className="w-full">Yes</Button>
                  <Button variant="outline" className="w-full bg-sidebar-accent">No</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">HBATC Monitoring</label>
                <div className="flex space-x-2">
                  <Button variant="outline" className="w-full">Yes</Button>
                  <Button variant="outline" className="w-full bg-sidebar-accent">No</Button>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={handleNewConsult}
                className="bg-medical-primary hover:bg-medical-primary/90"
              >
                Save Consultation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
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
    </div>
  );
};

export default Consults;
