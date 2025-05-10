import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserCog, UserRound, Plus, Loader2, MoreHorizontal, Edit, UserMinus, RefreshCw, Shield, UserCheck, Menu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserRole, User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface UserWithProfile extends User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

const Users = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null);
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
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
        title: "User created successfully",
        description: `${name} has been added as a ${role}`,
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

  const handleUpdateRole = async () => {
    try {
      if (!selectedUser) return;
      
      // In a real app, you would update the user role in the database
      // For demo purposes, we're just updating the local state
      const updatedUsers = users.map(user => 
        user.id === selectedUser.id ? { ...user, role } : user
      );
      
      setUsers(updatedUsers);
      
      toast({
        title: "Role updated",
        description: `${selectedUser.name}'s role has been updated to ${role}`,
      });
      
      setIsEditRoleModalOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update role',
        variant: 'destructive'
      });
    }
  };
  
  const openEditRoleModal = (user: UserWithProfile) => {
    setSelectedUser(user);
    setRole(user.role);
    setIsEditRoleModalOpen(true);
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };
  
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-medical-admin-medium text-medical-admin-foreground hover:bg-medical-admin-dark/70';
      case 'doctor':
        return 'bg-medical-doctor-medium text-medical-doctor-foreground hover:bg-medical-doctor-dark/70';
      case 'nurse':
        return 'bg-medical-nurse-medium text-medical-nurse-foreground hover:bg-medical-nurse-dark/70';
      case 'staff':
        return 'bg-medical-staff-medium text-medical-staff-foreground hover:bg-medical-staff-dark/70';
      default:
        return 'bg-medical-staff-medium text-medical-staff-foreground hover:bg-medical-staff-dark/70';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 mr-2" />;
      case 'doctor':
        return <UserCog className="h-4 w-4 mr-2" />;
      case 'nurse':
        return <UserCheck className="h-4 w-4 mr-2" />;
      case 'staff':
        return <UserRound className="h-4 w-4 mr-2" />;
      default:
        return <UserRound className="h-4 w-4 mr-2" />;
    }
  };
  
  const filteredUsers = activeTab === 'all' 
    ? users 
    : users.filter(user => user.role === activeTab);

  // Mobile-friendly table renderer
  const renderUserRow = (user: UserWithProfile) => (
    <TableRow key={user.id}>
      <TableCell className="p-2 md:p-4">
        <div className="flex items-center space-x-2 md:space-x-3">
          <Avatar className="hidden sm:inline-flex h-8 w-8 md:h-10 md:w-10">
            <AvatarFallback className="bg-medical-primary/10 text-medical-primary text-xs md:text-sm">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm md:text-base">{user.name}</p>
            <p className="text-xs text-medical-gray hidden xs:block">{user.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="p-2 md:p-4">
        <Badge className={`${getRoleBadgeColor(user.role)} text-xs whitespace-nowrap`}>
          <div className="flex items-center">
            <span className="hidden sm:inline-block">{getRoleIcon(user.role)}</span>
            <span className="capitalize">{user.role}</span>
          </div>
        </Badge>
      </TableCell>
      <TableCell className="p-2 md:p-4 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => openEditRoleModal(user)}
              disabled={user.id === currentUser?.id}
              className="cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit Role</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              disabled={user.id === currentUser?.id}
              className="text-medical-danger cursor-pointer"
            >
              <UserMinus className="mr-2 h-4 w-4" />
              <span>Deactivate</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
  
  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-medical-primary">User Management</h1>
          <p className="text-medical-gray text-xs sm:text-sm">Manage system users and their permissions</p>
        </div>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-medical-primary hover:bg-medical-primary/90 w-full sm:w-auto">
              <Plus size={16} className="mr-1" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
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
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleNewUser}
                className="bg-medical-primary hover:bg-medical-primary/90"
              >
                Save User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Role Modal */}
        <Dialog open={isEditRoleModalOpen} onOpenChange={setIsEditRoleModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit User Role</DialogTitle>
              <DialogDescription>
                Update the role for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <Select
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">
                    <div className="flex items-center">
                      {getRoleIcon('doctor')}
                      Doctor
                    </div>
                  </SelectItem>
                  <SelectItem value="nurse">
                    <div className="flex items-center">
                      {getRoleIcon('nurse')}
                      Nurse
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center">
                      {getRoleIcon('admin')}
                      Administrator
                    </div>
                  </SelectItem>
                  <SelectItem value="staff">
                    <div className="flex items-center">
                      {getRoleIcon('staff')}
                      Staff
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditRoleModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateRole}
                className="bg-medical-primary hover:bg-medical-primary/90"
              >
                Update Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Desktop tab navigation */}
        <div className="hidden sm:flex justify-between items-center mb-4">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="admin">Administrators</TabsTrigger>
            <TabsTrigger value="doctor">Doctors</TabsTrigger>
            <TabsTrigger value="nurse">Nurses</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
          </TabsList>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchUsers}
            className="flex items-center ml-2"
          >
            <RefreshCw size={14} className="mr-1" />
            Refresh
          </Button>
        </div>

        {/* Mobile tab navigation with sheet */}
        <div className="flex sm:hidden justify-between items-center mb-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center">
                <Menu className="h-4 w-4 mr-2" />
                {activeTab === 'all' ? 'All Users' : 
                  activeTab === 'admin' ? 'Administrators' : 
                  activeTab === 'doctor' ? 'Doctors' : 
                  activeTab === 'nurse' ? 'Nurses' : 'Staff'}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="py-6">
                <h3 className="text-lg font-medium mb-5">Filter Users</h3>
                <div className="grid gap-4">
                  <Button 
                    variant={activeTab === 'all' ? 'default' : 'outline'} 
                    onClick={() => setActiveTab('all')}
                    className="justify-start"
                  >
                    <UserRound className="mr-2 h-4 w-4" />
                    All Users
                  </Button>
                  <Button 
                    variant={activeTab === 'admin' ? 'default' : 'outline'} 
                    onClick={() => setActiveTab('admin')}
                    className="justify-start"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Administrators
                  </Button>
                  <Button 
                    variant={activeTab === 'doctor' ? 'default' : 'outline'} 
                    onClick={() => setActiveTab('doctor')}
                    className="justify-start"
                  >
                    <UserCog className="mr-2 h-4 w-4" />
                    Doctors
                  </Button>
                  <Button 
                    variant={activeTab === 'nurse' ? 'default' : 'outline'} 
                    onClick={() => setActiveTab('nurse')}
                    className="justify-start"
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Nurses
                  </Button>
                  <Button 
                    variant={activeTab === 'staff' ? 'default' : 'outline'} 
                    onClick={() => setActiveTab('staff')}
                    className="justify-start"
                  >
                    <UserRound className="mr-2 h-4 w-4" />
                    Staff
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchUsers}
            className="flex items-center"
            aria-label="Refresh users"
          >
            <RefreshCw size={14} />
          </Button>
        </div>
        
        <TabsContent value="all" className="m-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg sm:text-xl">System Users</CardTitle>
              <CardDescription>
                Total users: {users.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-2 md:p-6 overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="animate-spin h-8 w-8 text-medical-primary" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="bg-gray-50 p-4 rounded-md flex items-center justify-center h-40">
                  <div className="text-center">
                    <UserCog size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No users found in this category.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50%] md:w-auto">User</TableHead>
                        <TableHead className="w-[30%] md:w-auto">Role</TableHead>
                        <TableHead className="w-[20%] md:w-[100px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map(renderUserRow)}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* The tabs for specific roles use the same content */}
        {['admin', 'doctor', 'nurse', 'staff'].map((roleTab) => (
          <TabsContent key={roleTab} value={roleTab} className="m-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg sm:text-xl capitalize">{roleTab}s</CardTitle>
                <CardDescription>
                  Total {roleTab}s: {users.filter(u => u.role === roleTab).length}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-2 md:p-6 overflow-x-auto">
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="animate-spin h-8 w-8 text-medical-primary" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="bg-gray-50 p-4 rounded-md flex items-center justify-center h-40">
                    <div className="text-center">
                      <UserCog size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">No {roleTab}s found.</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50%] md:w-auto">User</TableHead>
                          <TableHead className="w-[30%] md:w-auto">Role</TableHead>
                          <TableHead className="w-[20%] md:w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map(renderUserRow)}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      
      <Card className="border-l-4 border-l-medical-primary">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg sm:text-xl">User Access Roles</CardTitle>
          <CardDescription>
            Overview of system roles and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div className="bg-medical-doctor-light p-3 sm:p-4 rounded-md">
              <div className="flex items-center mb-2">
                {getRoleIcon('doctor')}
                <h3 className="text-base sm:text-lg font-medium text-medical-doctor-dark">Doctor</h3>
              </div>
              <p className="text-xs sm:text-sm text-medical-gray">
                Full access to all patient records, consultations, and medical data. 
                Can create and edit records, prescribe medications, and manage patient care.
              </p>
            </div>
            
            <div className="bg-medical-nurse-light p-3 sm:p-4 rounded-md">
              <div className="flex items-center mb-2">
                {getRoleIcon('nurse')}
                <h3 className="text-base sm:text-lg font-medium text-medical-nurse-dark">Nurse</h3>
              </div>
              <p className="text-xs sm:text-sm text-medical-gray">
                Can view all patient records, create and update vital signs, add notes, 
                and assist with patient management. Cannot prescribe medications.
              </p>
            </div>
            
            <div className="bg-medical-admin-light p-3 sm:p-4 rounded-md">
              <div className="flex items-center mb-2">
                {getRoleIcon('admin')}
                <h3 className="text-base sm:text-lg font-medium text-medical-admin-dark">Administrator</h3>
              </div>
              <p className="text-xs sm:text-sm text-medical-gray">
                Manages system settings, user accounts, and access permissions. 
                Can view reports and statistics but has limited access to medical data.
              </p>
            </div>
            
            <div className="bg-medical-staff-light p-3 sm:p-4 rounded-md">
              <div className="flex items-center mb-2">
                {getRoleIcon('staff')}
                <h3 className="text-base sm:text-lg font-medium text-medical-staff-dark">Staff</h3>
              </div>
              <p className="text-xs sm:text-sm text-medical-gray">
                Limited access for reception and administrative staff. 
                Can view basic patient information, schedule appointments, 
                and manage non-medical tasks.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
