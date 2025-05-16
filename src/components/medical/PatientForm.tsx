import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';

interface PatientFormProps {
  initialData?: {
    name?: string;
    dateOfBirth?: Date;
    gender?: string;
    contact?: string;
    email?: string;
    address?: string;
    position?: string;
    designation?: string;
    medicalHistory?: string;
  };
  onSave: (data: any) => Promise<void> | void;
  onCancel: () => void;
}

export const PatientForm = ({ initialData, onSave, onCancel }: PatientFormProps) => {
  const [name, setName] = useState(initialData?.name || '');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(initialData?.dateOfBirth);
  const [gender, setGender] = useState(initialData?.gender || '');
  const [contact, setContact] = useState(initialData?.contact || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [position, setPosition] = useState(initialData?.position || '');
  const [designation, setDesignation] = useState(initialData?.designation || '');
  const [medicalHistory, setMedicalHistory] = useState(initialData?.medicalHistory || '');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name || !dateOfBirth || !gender) {
      // Show validation error
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave({
        name,
        dateOfBirth: format(dateOfBirth, 'yyyy-MM-dd'),
        gender,
        contact,
        email,
        address,
        position,
        designation,
        medicalHistory
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
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
            <Label htmlFor="dob">Date of Birth <span className="text-destructive">*</span></Label>
            <div className="flex">
              <div className="relative flex-1">
                <Input
                  id="dob"
                  className="pr-10"
                  placeholder="YYYY-MM-DD"
                  value={dateOfBirth ? format(dateOfBirth, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setDateOfBirth(undefined);
                    } else {
                      try {
                        // Only set if it's a valid date
                        const date = new Date(val);
                        if (!isNaN(date.getTime())) {
                          setDateOfBirth(date);
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
                    selected={dateOfBirth}
                    onSelect={(date) => {
                      if (date) {
                        setDateOfBirth(date);
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
        
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input 
            id="address" 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address"
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
      
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || !name || !dateOfBirth || !gender}
          className="bg-medical-doctor hover:bg-medical-doctor-dark"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Saving..." : "Save Patient"}
        </Button>
      </DialogFooter>
    </div>
  );
}; 