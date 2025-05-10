import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ActivitySquare, CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Vitals = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();
  
  const handleNewVitalSign = () => {
    toast({
      title: "Vital signs added",
      description: "New vital signs record has been successfully created",
    });
    setIsAddModalOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-medical-nurse">Vital Signs Monitoring</h1>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-medical-nurse hover:bg-medical-nurse-dark">
              <Plus size={16} className="mr-1" />
              Add Vital Signs
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Vital Signs</DialogTitle>
              <DialogDescription>
                Record new vital signs for a patient
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2 col-span-1 md:col-span-2">
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
              
              <div className="space-y-2">
                <label htmlFor="date" className="block text-sm font-medium">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
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
                <label htmlFor="systolicBP" className="block text-sm font-medium">Systolic BP (mmHg)</label>
                <Input id="systolicBP" type="number" className="w-full" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="diastolicBP" className="block text-sm font-medium">Diastolic BP (mmHg)</label>
                <Input id="diastolicBP" type="number" className="w-full" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="heartRate" className="block text-sm font-medium">Heart Rate (bpm)</label>
                <Input id="heartRate" type="number" className="w-full" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="respiratoryRate" className="block text-sm font-medium">Respiratory Rate (bpm)</label>
                <Input id="respiratoryRate" type="number" className="w-full" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="temperature" className="block text-sm font-medium">Temperature (°C)</label>
                <Input id="temperature" type="number" step="0.1" className="w-full" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="oxygenSaturation" className="block text-sm font-medium">Oxygen Saturation (%)</label>
                <Input id="oxygenSaturation" type="number" className="w-full" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="height" className="block text-sm font-medium">Height (cm)</label>
                <Input id="height" type="number" className="w-full" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="weight" className="block text-sm font-medium">Weight (kg)</label>
                <Input id="weight" type="number" step="0.1" className="w-full" />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={handleNewVitalSign}
                className="bg-medical-nurse hover:bg-medical-nurse-dark"
              >
                Save Vital Signs
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Blood Pressure Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <div className="text-center">
              <ActivitySquare size={48} className="mx-auto text-medical-gray/30 mb-4" />
              <p className="text-medical-gray">No BP data available</p>
              <p className="text-sm text-medical-gray/70">Add vital signs to see charts</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>HbA1c Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <div className="text-center">
              <ActivitySquare size={48} className="mx-auto text-medical-gray/30 mb-4" />
              <p className="text-medical-gray">No HbA1c data available</p>
              <p className="text-sm text-medical-gray/70">Add vital signs to see charts</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Vital Signs Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-medical-nurse-light/50 rounded-md p-8 text-center">
            <ActivitySquare size={48} className="mx-auto text-medical-gray/30 mb-4" />
            <p className="text-medical-gray">No vital signs records found</p>
            <p className="text-sm text-medical-gray/70 mb-6">Add your first record using the button above</p>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              variant="outline"
              className="mx-auto hover:bg-medical-nurse hover:text-white"
            >
              <Plus size={16} className="mr-1" />
              Add First Record
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Vitals;
