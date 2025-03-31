
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ObjectiveItem {
  id: string;
  value: string;
}

interface ObjectiveSectionProps {
  objectives: ObjectiveItem[];
  setObjectives: React.Dispatch<React.SetStateAction<ObjectiveItem[]>>;
}

const ObjectiveSection = ({ objectives, setObjectives }: ObjectiveSectionProps) => {
  const [newObjective, setNewObjective] = useState<string>('');

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setObjectives(prev => [
        ...prev, 
        { id: Date.now().toString(), value: newObjective.trim() }
      ]);
      setNewObjective('');
    }
  };
  
  const handleRemoveObjective = (id: string) => {
    setObjectives(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Objective</label>
      <div className="flex space-x-2">
        <Input 
          className="flex-1" 
          placeholder="Add objective item" 
          value={newObjective}
          onChange={e => setNewObjective(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddObjective();
            }
          }}
        />
        <Button onClick={handleAddObjective} className="bg-medical-primary">Add</Button>
      </div>
      {objectives.length > 0 && (
        <div className="mt-2 space-y-2">
          {objectives.map(item => (
            <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
              <span>{item.value}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleRemoveObjective(item.id)}
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

export default ObjectiveSection;
