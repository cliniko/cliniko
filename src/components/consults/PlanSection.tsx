
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface PlanItem {
  id: string;
  value: string;
}

interface PlanSectionProps {
  plans: PlanItem[];
  setPlans: React.Dispatch<React.SetStateAction<PlanItem[]>>;
}

const PlanSection = ({ plans, setPlans }: PlanSectionProps) => {
  const [newPlan, setNewPlan] = useState<string>('');

  const handleAddPlan = () => {
    if (newPlan.trim()) {
      setPlans(prev => [
        ...prev, 
        { id: Date.now().toString(), value: newPlan.trim() }
      ]);
      setNewPlan('');
    }
  };
  
  const handleRemovePlan = (id: string) => {
    setPlans(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Plan</label>
      <div className="flex space-x-2">
        <Input 
          className="flex-1" 
          placeholder="Add plan item" 
          value={newPlan}
          onChange={e => setNewPlan(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddPlan();
            }
          }}
        />
        <Button onClick={handleAddPlan} className="bg-medical-primary">Add</Button>
      </div>
      {plans.length > 0 && (
        <div className="mt-2 space-y-2">
          {plans.map(item => (
            <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
              <span>{item.value}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleRemovePlan(item.id)}
                className="h-6 w-6 text-gray-500 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlanSection;
