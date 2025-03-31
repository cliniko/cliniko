
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCog, UserRound, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserRole, User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';

interface UserWithProfile extends User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

const Users = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      const formattedUsers: UserWithProfile[] = data.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email || '',
        role: user.role,
        createdAt: user.created_at
      }));
      
      setUsers(formattedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleNewUser = async () => {
    try {
      if (!email || !password || !name) {
        toast({
          title: 'Missing fields',
          description: 'All fields are required',
          variant: 'destructive'
        });
        return;
      }
      
      // In a real production app, you would use an admin function to create users
      // For demo purposes, we're showing the UI flow without the actual creation
      toast({
        title: "User creation request sent",
        description: "Admin will need to approve this request",
      });
      
      setIsAddModalOpen(false);
      setEmail('');
      setPassword('');
      setName('');
      setRole('staff');
      
      // Refresh the user list
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive'
      });
    }
  };
  
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'doctor':
        return 'bg-blue-100 text-blue-800';
      case 'nurse':
        return 'bg-green-100 text-green-800';
      case 'staff':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-medical-primary">User Management</h1>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-medical-primary hover:bg-medical-primary/90">
              <UserRound size={16} className="mr-1" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Enter the details for the new system user
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium">Full Name</label>
                <Input 
                  id="name" 
                  className="w-full" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">Email</label>
                <Input 
                  id="email" 
                  type="email" 
                  className="w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium">Password</label>
                <Input 
                  id="password" 
                  type="password" 
                  className="w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="role" className="block text-sm font-medium">Role</label>
                <Select
                  value={role}
                  onValueChange={(value) => setRole(value as UserRole)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="nurse">Nurse</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={handleNewUser}
                className="bg-medical-primary hover:bg-medical-primary/90"
              >
                Save User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="border-l-4 border-l-medical-primary">
          <CardHeader className="pb-2">
            <CardTitle>User Access Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-medical-primary text-center mb-2">Doctor</h3>
                <p className="text-sm text-gray-600">
                  Full access to all patient records, consultations, and medical data. 
                  Can create and edit records, prescribe medications, and manage patient care.
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-medical-success text-center mb-2">Nurse</h3>
                <p className="text-sm text-gray-600">
                  Can view all patient records, create and update vital signs, add notes, 
                  and assist with patient management. Cannot prescribe medications.
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-purple-500 text-center mb-2">Administrator</h3>
                <p className="text-sm text-gray-600">
                  Manages system settings, user accounts, and access permissions. 
                  Can view reports and statistics but has limited access to medical data.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-medical-gray text-center mb-2">Staff</h3>
                <p className="text-sm text-gray-600">
                  Limited access for reception and administrative staff. 
                  Can view basic patient information, schedule appointments, 
                  and manage non-medical tasks.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>System Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="animate-spin h-8 w-8 text-medical-primary" />
                </div>
              ) : users.length === 0 ? (
                <div className="bg-gray-50 p-4 rounded-md flex items-center justify-center h-40">
                  <div className="text-center">
                    <UserCog size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No users found. Add your first user to get started.</p>
                  </div>
                </div>
              ) : (
                <table className="min-w-full mt-4">
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                        Name
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                        Role
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-t">
                        <td className="py-2">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </td>
                        <td className="py-2">
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-2">
                          <Button variant="ghost" size="sm" disabled={user.id === currentUser?.id}>
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Users;
