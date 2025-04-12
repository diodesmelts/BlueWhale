import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldAlert, ShieldCheck, Star, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User as UserType } from "@shared/schema";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function UserManagement() {
  const [editMode, setEditMode] = useState(false);
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery<UserType[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<UserType> }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${id}`, data);
      if (!res.ok) throw new Error("Failed to update user");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User updated",
        description: "User permissions have been updated successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating user",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handlePermissionChange = (user: UserType, field: "isAdmin" | "isPremium", value: boolean) => {
    updateUserMutation.mutate({
      id: user.id,
      data: { [field]: value }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>Error loading users</p>
        <Button 
          variant="outline"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] })}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="bg-white shadow-md border-blue-100">
      <CardHeader className="border-b pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-xl">User Management</CardTitle>
          </div>
          <Button
            variant="outline"
            className={`text-sm ${editMode ? 'border-green-600 text-green-600' : 'border-blue-600 text-blue-600'}`}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Save Changes' : 'Edit Users'}
          </Button>
        </div>
        <CardDescription>
          View and manage all user accounts and permissions on the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-center">Premium Status</TableHead>
                <TableHead className="text-center">Admin Access</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <Avatar className={`h-8 w-8 ${user.isPremium ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium flex items-center">
                          {user.username}
                          {user.isPremium && (
                            <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
                              <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" /> 
                              Premium
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">ID: {user.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{user.email}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex justify-center">
                            {editMode ? (
                              <Switch
                                checked={user.isPremium}
                                onCheckedChange={(checked) => handlePermissionChange(user, "isPremium", checked)}
                                className="data-[state=checked]:bg-amber-500"
                              />
                            ) : (
                              <div className={`p-1 rounded-full ${user.isPremium ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                                <Star className={`h-4 w-4 ${user.isPremium ? 'fill-amber-500' : ''}`} />
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{user.isPremium ? 'Premium User' : 'Standard User'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex justify-center">
                            {editMode ? (
                              <Switch
                                checked={user.isAdmin}
                                onCheckedChange={(checked) => handlePermissionChange(user, "isAdmin", checked)}
                                className="data-[state=checked]:bg-blue-600"
                              />
                            ) : (
                              <div className={`p-1 rounded-full ${user.isAdmin ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                {user.isAdmin ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{user.isAdmin ? 'Admin User' : 'No Admin Access'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}