"use client";

import { 
  Key, 
  BookOpen, 
  Users, 
  Settings, 
  BarChart3,
  FileText,
  Target,
  Calendar
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useGetAllPermissions } from "@/features/roles-permissions/api/use-get-all-permissions";

import { Permissions } from "@/db/types";

export const PermissionsOverview = () => {
  const { data: permissions, isLoading } = useGetAllPermissions();

  const getPermissionIcon = (name: string) => {
    if (name.includes('quiz')) return <Target className="w-4 h-4" />;
    if (name.includes('deck') || name.includes('flashcard')) return <BookOpen className="w-4 h-4" />;
    if (name.includes('document')) return <FileText className="w-4 h-4" />;
    if (name.includes('member')) return <Users className="w-4 h-4" />;
    if (name.includes('settings')) return <Settings className="w-4 h-4" />;
    if (name.includes('statistics') || name.includes('activity')) return <BarChart3 className="w-4 h-4" />;
    if (name.includes('streak')) return <Calendar className="w-4 h-4" />;
    return <Key className="w-4 h-4" />;
  };

  const getPermissionColor = (name: string) => {
    if (name.includes('quiz')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (name.includes('deck') || name.includes('flashcard')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (name.includes('document')) return 'bg-green-100 text-green-800 border-green-200';
    if (name.includes('member')) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (name.includes('settings')) return 'bg-red-100 text-red-800 border-red-200';
    if (name.includes('statistics') || name.includes('activity')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatPermissionName = (name: string) => {
    return name
      .split(':')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const groupPermissionsByCategory = (permissions: Permissions[]) => {
    const groups = permissions.reduce((acc, permission) => {
      const category = permission.name.split(':')[0];
      if (!acc[category]) acc[category] = [];
      acc[category].push(permission);
      return acc;
    }, {} as Record<string, Permissions[]>);

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            All Permissions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="space-y-1">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="h-6 w-full bg-muted animate-pulse rounded" />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const groupedPermissions = groupPermissionsByCategory(permissions || []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          All Permissions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {groupedPermissions.map(([category, perms]) => (
          <div key={category} className="space-y-2">
            <h4 className="font-medium text-sm capitalize text-muted-foreground">
              {category} Permissions
            </h4>
            <div className="space-y-1">
              {perms.map((permission) => (
                <div
                  key={permission.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border ${getPermissionColor(permission.name)}`}
                >
                  {getPermissionIcon(permission.name)}
                  <span className="text-xs font-medium">
                    {formatPermissionName(permission.name)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {permissions?.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Key className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No permissions available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};