import { Consultation } from '@/types';

// Fields to exclude from diff tracking
const EXCLUDED_FIELDS = [
  'id', 
  'createdAt', 
  'created_at', 
  'updated_at', 
  'updatedAt'
];

// Custom field labels for better user experience
const FIELD_LABELS: Record<string, string> = {
  chiefComplaint: 'Chief Complaint',
  subjective: 'Subjective Notes',
  additionalRemarks: 'Additional Remarks',
  encounterType: 'Encounter Type',
  attendingPhysician: 'Attending Physician',
  attendingNurse: 'Attending Nurse',
  referenceConsultationId: 'Reference Consultation',
  hba1c_monitoring: 'HbA1c Monitoring',
  bp_monitoring: 'BP Monitoring',
  is_archived: 'Archived Status',
  isArchived: 'Archived Status'
};

export interface Change {
  field: string;
  oldValue: any;
  newValue: any;
}

/**
 * Generates a diff between old and new consultation objects
 * 
 * @param oldData Previous consultation data
 * @param newData New consultation data
 * @returns Array of changes
 */
export function generateEditDiff(oldData: Partial<Consultation>, newData: Partial<Consultation>): Change[] {
  const changes: Change[] = [];
  
  // Get all unique keys from both objects
  const allKeys = new Set([
    ...Object.keys(oldData || {}),
    ...Object.keys(newData || {})
  ]);
  
  // Compare each field
  allKeys.forEach(key => {
    // Skip excluded fields
    if (EXCLUDED_FIELDS.includes(key)) return;
    
    const oldValue = oldData?.[key as keyof Consultation];
    const newValue = newData?.[key as keyof Consultation];
    
    // Check if values are different
    if (!isEqual(oldValue, newValue)) {
      changes.push({
        field: FIELD_LABELS[key] || key,
        oldValue,
        newValue
      });
    }
  });
  
  return changes;
}

/**
 * Deep equality check for any two values
 */
function isEqual(a: any, b: any): boolean {
  // Handle simple cases
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (a === undefined || b === undefined) return a === b;
  
  // Handle different types
  if (typeof a !== typeof b) return false;
  
  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    
    // Simple array comparison
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) return false;
    }
    
    return true;
  }
  
  // Handle objects
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!isEqual(a[key], b[key])) return false;
    }
    
    return true;
  }
  
  // Default case - values are not equal
  return false;
} 