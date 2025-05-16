import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

interface UsersByRoleOptions {
  role: string;
  enabled?: boolean;
}

export function useUsersByRole({ role, enabled = true }: UsersByRoleOptions) {
  return useQuery({
    queryKey: ['users', 'byRole', role],
    queryFn: async () => {
      try {
        // Try to use the role-filtered API first
        const { data: roleFilteredUsers, error: roleFilteredError } = await supabase
          .rpc('get_users_by_role', { role_filter: role });
        
        if (roleFilteredError) {
          console.warn('Could not fetch users by role, falling back to client-side filtering', roleFilteredError);
          
          // Fallback to getting all users and filtering client-side
          const { data: allUsers, error: allUsersError } = await supabase
            .from('profiles')
            .select('*')
            .order('name', { ascending: true });
            
          if (allUsersError) throw allUsersError;
          
          // Filter by role client-side
          return (allUsers || [])
            .filter(user => user.role === role)
            .map(user => ({
              id: user.id,
              name: user.name,
              role: user.role,
              createdAt: user.created_at,
            })) as User[];
        }
        
        // Format the response from the role-filtered API
        return (roleFilteredUsers || []).map(user => ({
          id: user.id,
          name: user.name,
          role: user.role,
          createdAt: user.created_at,
        })) as User[];
      } catch (error) {
        console.error('Error fetching users by role:', error);
        return [];
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
} 