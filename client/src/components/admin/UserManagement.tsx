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
      <div className="flex items-center justify-center h-64 bg-gray-900 text-white rounded-lg shadow-md border border-gray-700 p-6">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 p-4 bg-gray-900 text-white rounded-lg shadow-md border border-gray-700">
        <p>Error loading users</p>
        <Button 
          variant="outline"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] })}
          className="mt-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
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
    <Card className="bg-gray-900 text-white shadow-md border-gray-700">
      <CardHeader className="border-b border-gray-700 pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-cyan-500" />
            <CardTitle className="text-xl text-cyan-400">User Management</CardTitle>
          </div>
          <Button
            variant="outline"
            className={`text-sm ${editMode ? 
              'border-green-500 text-green-400 hover:bg-gray-800' : 
              'border-cyan-600 text-cyan-400 hover:bg-gray-800'}`}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Save Changes' : 'Edit Users'}
          </Button>
        </div>
        <CardDescription className="text-gray-400">
          View and manage all user accounts and permissions on the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="text-gray-300">
            <TableHeader className="bg-gray-800">
              <TableRow className="border-gray-700 hover:bg-gray-800">
                <TableHead className="text-cyan-400">User</TableHead>
                <TableHead className="text-cyan-400">Email</TableHead>
                <TableHead className="text-cyan-400">Joined</TableHead>
                <TableHead className="text-center text-cyan-400">Premium Status</TableHead>
                <TableHead className="text-center text-cyan-400">Admin Access</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id} className="border-gray-700 hover:bg-gray-800">
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <Avatar className={`h-8 w-8 ${user.isPremium ? 'bg-purple-900 text-purple-300' : 'bg-gray-800 text-cyan-300'}`}>
                        <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium flex items-center">
                          {user.username}
                          {user.isPremium && (
                            <Badge variant="outline" className="ml-2 bg-purple-900 text-purple-300 border-purple-700">
                              <Star className="h-3 w-3 mr-1 fill-purple-400 text-purple-400" /> 
                              Premium
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">ID: {user.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{user.email}</TableCell>
                  <TableCell className="text-sm">
                    {user.createdAt && new Date(user.createdAt).toLocaleDateString('en-US', {
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
                                checked={user.isPremium || false}
                                onCheckedChange={(checked) => handlePermissionChange(user, "isPremium", checked)}
                                className="data-[state=checked]:bg-purple-500"
                              />
                            ) : (
                              <div className={`p-1 rounded-full ${user.isPremium ? 'bg-purple-900 text-purple-400' : 'bg-gray-800 text-gray-500'}`}>
                                <Star className={`h-4 w-4 ${user.isPremium ? 'fill-purple-500' : ''}`} />
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-900 text-gray-300 border-gray-700">
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
                                checked={user.isAdmin || false}
                                onCheckedChange={(checked) => handlePermissionChange(user, "isAdmin", checked)}
                                className="data-[state=checked]:bg-cyan-600"
                              />
                            ) : (
                              <div className={`p-1 rounded-full ${user.isAdmin ? 'bg-cyan-900 text-cyan-400' : 'bg-gray-800 text-gray-500'}`}>
                                {user.isAdmin ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-900 text-gray-300 border-gray-700">
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