import React, { useState } from 'react';
import { Shield, Plus, Pencil, Trash2, Check, X, Users as UsersIcon, UserPlus, Eye, EyeOff, Search, Key, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import {
  useGetRolesQuery,
  useGetPermissionsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useUpdateRoleStatusMutation,
  useDeleteRoleMutation,
  useGetAssignableUsersQuery,
  useCreateRoleUserMutation,
  useAssignUserRoleMutation,
} from '@/store/api/rolesApi';
import { useNotifications } from '@/hooks/useNotifications';
import { useHasPermission, useCurrentAdmin } from '@/hooks/redux';
import { useDebounce } from '@/hooks';
import { Permission, Role } from '@/types';

interface ModuleAccess {
  module: string;
  label: string;
  actions: string[];
}

// Groups a flat permission list ("users.create", "users.view", ...) into
// per-module access summaries ("User Management: create, view") so the UI
// shows what a role can actually do, not just raw permission keys.
function groupPermissionsByModule(
  permissions: Permission[],
  groups: { module: string; label: string }[],
): ModuleAccess[] {
  const byModule = new Map<string, string[]>();
  permissions.forEach((permission) => {
    const [module, action] = permission.split('.');
    if (!module || !action) return;
    if (!byModule.has(module)) byModule.set(module, []);
    byModule.get(module)!.push(action);
  });

  return Array.from(byModule.entries()).map(([module, actions]) => ({
    module,
    label: groups.find((g) => g.module === module)?.label ?? module,
    actions,
  }));
}

interface RoleFormState {
  name: string;
  description: string;
  permissions: Permission[];
}

interface UserFormState {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  roleId: string;
}

type UserFormErrors = Partial<Record<keyof UserFormState, string>>;
type RoleFormErrors = Partial<Record<keyof RoleFormState, string>>;

const emptyForm: RoleFormState = { name: '', description: '', permissions: [] };
const emptyUserForm: UserFormState = { firstname: '', lastname: '', email: '', password: '', roleId: '' };

export function RolesPage() {
  const [rolePageIndex, setRolePageIndex] = useState(0);
  const [rolePageSize, setRolePageSize] = useState(10);
  const [roleSearch, setRoleSearch] = useState('');
  const debouncedRoleSearch = useDebounce(roleSearch, 300);

  const { data: rolesResponse, isLoading: rolesLoading } = useGetRolesQuery({
    skip: rolePageIndex * rolePageSize,
    take: rolePageSize,
    search: debouncedRoleSearch || undefined,
  });
  const [permissionSearch, setPermissionSearch] = useState('');
  const debouncedPermissionSearch = useDebounce(permissionSearch, 300);
  const { data: permissionsResponse } = useGetPermissionsQuery({
    search: debouncedPermissionSearch || undefined,
  });
  const [usersPage, setUsersPage] = useState(0);
  const [usersPageSize, setUsersPageSize] = useState(10);
  const { data: usersResponse } = useGetAssignableUsersQuery({
    skip: usersPage * usersPageSize,
    take: usersPageSize,
  });

  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [updateRoleStatus] = useUpdateRoleStatusMutation();
  const [deleteRole] = useDeleteRoleMutation();
  const [createRoleUser, { isLoading: isCreatingUser }] = useCreateRoleUserMutation();
  const [assignUserRole] = useAssignUserRoleMutation();

  const { success, error: notifyError } = useNotifications();

  const canCreateRole = useHasPermission('roles.create');
  const canEditRole = useHasPermission('roles.edit');
  const canDeleteRole = useHasPermission('roles.delete');
  const canAssignRole = useHasPermission('roles.assign');
  const canViewSubAdmins = useHasPermission('sub-admins.view');
  const canCreateSubAdmin = useHasPermission('sub-admins.create');
  const currentAdmin = useCurrentAdmin();

  const [activeTab, setActiveTab] = useState<'roles' | 'users'>('roles');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [form, setForm] = useState<RoleFormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<RoleFormErrors>({});

  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [userForm, setUserForm] = useState<UserFormState>(emptyUserForm);
  const [userFormErrors, setUserFormErrors] = useState<UserFormErrors>({});
  const [showUserPassword, setShowUserPassword] = useState(false);

  const rolesData = rolesResponse?.data;
  const roles = rolesData?.data ?? [];
  const totalCount = rolesData?.count ?? roles.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rolePageSize));
  const groups = permissionsResponse?.data.groups ?? [];
  const users = usersResponse?.data ?? [];
  const totalUsers = usersResponse?.count ?? 0;
  const usersPageCount = Math.max(1, Math.ceil(totalUsers / usersPageSize));

  const openCreateForm = () => {
    setEditingRoleId(null);
    setForm(emptyForm);
    setFormErrors({});
    setPermissionSearch('');
    setIsFormOpen(true);
  };

  const openEditForm = (role: Role) => {
    setEditingRoleId(role.id);
    setForm({ name: role.name, description: role.description ?? '', permissions: [...role.permissions] });
    setFormErrors({});
    setPermissionSearch('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setPermissionSearch('');
    setEditingRoleId(null);
    setForm(emptyForm);
    setFormErrors({});
  };

  const closeUserForm = () => {
    setIsUserFormOpen(false);
    setUserForm(emptyUserForm);
    setUserFormErrors({});
    setShowUserPassword(false);
  };

  const handleTabChange = (value: string) => {
    closeForm();
    closeUserForm();
    setActiveTab(value as 'roles' | 'users');
  };

  const togglePermission = (permission: Permission) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
    setFormErrors((prev) => ({ ...prev, permissions: undefined }));
  };

  const toggleGroup = (groupPermissions: Permission[], allSelected: boolean) => {
    setForm((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((p) => !groupPermissions.includes(p))
        : Array.from(new Set([...prev.permissions, ...groupPermissions])),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: RoleFormErrors = {};
    if (!form.name.trim()) errors.name = 'Role name is required';
    if (form.permissions.length === 0) errors.permissions = 'Select at least one permission';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      if (editingRoleId) {
        await updateRole({ id: editingRoleId, ...form }).unwrap();
        success('Role updated successfully');
      } else {
        await createRole(form).unwrap();
        success('Role created successfully');
      }
      closeForm();
    } catch (err: any) {
      notifyError(err?.data?.message || err?.message || 'Something went wrong');
    }
  };

  const handleDelete = async (role: Role) => {
    if (role.isSystem) return;
    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;

    try {
      await deleteRole(role.id).unwrap();
      success('Role deleted');
    } catch (err: any) {
      notifyError(err?.data?.message || err?.message || 'Failed to delete role');
    }
  };

  const handleToggleStatus = async (role: Role) => {
    const newStatus = role.status === 'Active' ? 'InActive' : 'Active';
    try {
      await updateRoleStatus({ id: role.id, status: newStatus }).unwrap();
      success(`Role ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully`);
    } catch (err: any) {
      notifyError(err?.data?.message || err?.message || 'Failed to update role status');
    }
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateUserForm = (): UserFormErrors => {
    const errors: UserFormErrors = {};
    if (!userForm.firstname.trim()) errors.firstname = 'First name is required';
    if (!userForm.lastname.trim()) errors.lastname = 'Last name is required';
    if (!userForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailPattern.test(userForm.email.trim())) {
      errors.email = 'Enter a valid email address';
    }
    if (!userForm.password) errors.password = 'Password is required';
    if (!userForm.roleId) errors.roleId = 'Role is required';
    return errors;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateUserForm();
    setUserFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await createRoleUser(userForm).unwrap();
      success('User created successfully');
      closeUserForm();
      setUsersPage(0);
    } catch (err: any) {
      notifyError(err?.data?.message || err?.message || 'Failed to create user');
    }
  };

  const handleAssign = async (userId: string, roleId: string) => {
    try {
      const result = await assignUserRole({ userId, roleId }).unwrap();
      success(result.message);
    } catch (err: any) {
      notifyError(err?.data?.message || err?.message || 'Failed to assign role');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Roles & Privileges</h2>
          <p className="text-muted-foreground">
            Define custom roles like Sub Admin, control exactly what each one can access, and
            manage which users hold them.
          </p>
        </div>
        {activeTab === 'roles' ? (
          canCreateRole && (
            <Button onClick={openCreateForm}>
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          )
        ) : (
          canCreateSubAdmin && (
            <Button onClick={() => setIsUserFormOpen((prev) => !prev)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          )
        )}
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="bg-muted p-1 rounded-lg">
          <TabsTrigger value="roles">
            <Shield className="mr-2 h-4 w-4" />
            Roles ({totalCount})
          </TabsTrigger>
          {canViewSubAdmins && (
            <TabsTrigger value="users">
              <UsersIcon className="mr-2 h-4 w-4" />
              Users ({users.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="roles" className="space-y-6 mt-6">
          {/* Roles Search Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                className="pl-9"
                value={roleSearch}
                onChange={(e) => {
                  setRoleSearch(e.target.value);
                  setRolePageIndex(0);
                }}
              />
            </div>
            {totalCount > 0 && (
              <p className="text-xs text-muted-foreground self-end sm:self-center">
                Showing {Math.min(rolePageIndex * rolePageSize + 1, totalCount)} to{' '}
                {Math.min((rolePageIndex + 1) * rolePageSize, totalCount)} of {totalCount} roles
              </p>
            )}
          </div>

          {/* Create / Edit Form */}
          {isFormOpen && (
            <Card>
              <CardHeader>
                <CardTitle>{editingRoleId ? 'Edit Role' : 'Create New Role'}</CardTitle>
                <CardDescription>
                  Pick the exact permissions this role should have. Users assigned this role can
                  only access what&apos;s selected here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="role-name" required>Role Name</Label>
                      <Input
                        id="role-name"
                        placeholder="e.g. Sub Admin"
                        aria-invalid={!!formErrors.name}
                        className={formErrors.name ? 'border-destructive focus-visible:ring-destructive' : undefined}
                        value={form.name}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, name: e.target.value }));
                          setFormErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                      />
                      {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role-description">Description</Label>
                      <Input
                        id="role-description"
                        placeholder="What can this role do?"
                        value={form.description}
                        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label required>Permissions</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Select at least one permission for this role.
                      </p>
                      {formErrors.permissions && (
                        <p className="text-xs text-destructive mt-1">{formErrors.permissions}</p>
                      )}
                    </div>
                    <div className="relative max-w-sm">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search permissions..."
                        className="pl-9"
                        value={permissionSearch}
                        onChange={(e) => setPermissionSearch(e.target.value)}
                      />
                    </div>
                    {groups.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No permissions match your search.</p>
                    ) : (
                    <div
                      className={`grid gap-4 md:grid-cols-2 ${
                        formErrors.permissions ? 'p-3 border border-destructive rounded-lg' : ''
                      }`}
                    >
                      {groups.map((group) => {
                        const allSelected = group.permissions.every((p) => form.permissions.includes(p));
                        return (
                          <div key={group.module} className="rounded-lg border p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{group.label}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleGroup(group.permissions, allSelected)}
                              >
                                {allSelected ? 'Clear all' : 'Select all'}
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {group.permissions.map((permission) => (
                                <div key={permission} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={permission}
                                    checked={form.permissions.includes(permission)}
                                    onCheckedChange={() => togglePermission(permission)}
                                  />
                                  <Label htmlFor={permission} className="text-sm font-normal cursor-pointer">
                                    {permission}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={closeForm}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating || isUpdating}>
                      <Check className="mr-2 h-4 w-4" />
                      {editingRoleId ? 'Save Changes' : 'Create Role'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Roles List */}
          {rolesLoading ? (
            <p className="text-sm text-muted-foreground">Loading roles...</p>
          ) : roles.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/30">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-sm font-bold">No roles created yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                Create your first role to start controlling what Sub Admins can access.
              </p>
              <Button className="mt-4" size="sm" onClick={openCreateForm}>
                <Plus className="mr-2 h-4 w-4" />
                Create Role
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                {roles.map((role) => {
                  const moduleAccess = groupPermissionsByModule(role.permissions, groups);

                  return (
                    <Card key={role.id} className="flex flex-col h-full overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <Shield className="h-4 w-4 text-primary" />
                            </div>
                            <CardTitle className="text-base">{role.name.trim()}</CardTitle>
                          </div>
                          <div className="flex shrink-0 gap-1.5">
                            <Badge variant={role.isSystem ? 'secondary' : 'default'}>
                              {role.isSystem ? 'System' : 'Custom'}
                            </Badge>
                            <span
                              className={
                                role.status === 'Active'
                                  ? 'h-2.5 w-2.5 shrink-0 self-center rounded-full bg-emerald-500'
                                  : 'h-2.5 w-2.5 shrink-0 self-center rounded-full bg-red-500'
                              }
                              title={role.status === 'Active' ? 'Active' : 'Inactive'}
                            />
                          </div>
                        </div>
                        <CardDescription>
                          {role.description || 'No description provided.'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col space-y-3 pt-0">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <Key className="h-3.5 w-3.5" />
                          {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''} granted
                        </div>
                        {moduleAccess.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">No permissions assigned.</p>
                        ) : (
                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 -mr-1">
                            {moduleAccess.map((access) => (
                              <div key={access.module} className="rounded-md bg-muted/40 px-3 py-2">
                                <p className="text-xs font-semibold">{access.label}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {access.actions.join(', ')}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      {(canEditRole || canDeleteRole) && (
                        <CardFooter className="mt-auto justify-between space-x-2 border-t pt-4">
                          {canEditRole ? (
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={role.status === 'Active'}
                                onCheckedChange={() => handleToggleStatus(role)}
                                disabled={role.isSystem}
                                title={
                                  role.isSystem
                                    ? 'System role status cannot be changed'
                                    : role.status === 'Active'
                                    ? 'Deactivate role'
                                    : 'Activate role'
                                }
                                aria-label="Toggle role status"
                              />
                              <span className="text-xs text-muted-foreground">
                                {role.status === 'Active' ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          ) : (
                            <span />
                          )}
                          <div className="flex space-x-2">
                          {canEditRole && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditForm(role)}
                              disabled={role.isSystem}
                              title={role.isSystem ? 'System roles cannot be edited' : undefined}
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          )}
                          {canDeleteRole && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(role)}
                              disabled={role.isSystem}
                              title={role.isSystem ? 'System roles cannot be deleted' : undefined}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          )}
                          </div>
                        </CardFooter>
                      )}
                    </Card>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalCount > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>Rows per page</span>
                    <Select
                      value={`${rolePageSize}`}
                      onValueChange={(val) => {
                        setRolePageSize(Number(val));
                        setRolePageIndex(0);
                      }}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={rolePageSize} />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {[5, 10, 20, 50].map((size) => (
                          <SelectItem key={size} value={`${size}`}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span>
                      Showing {Math.min(rolePageIndex * rolePageSize + 1, totalCount)} to{' '}
                      {Math.min((rolePageIndex + 1) * rolePageSize, totalCount)} of {totalCount} entries
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setRolePageIndex(0)}
                      disabled={rolePageIndex === 0}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setRolePageIndex((p) => Math.max(0, p - 1))}
                      disabled={rolePageIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground px-2 font-medium">
                      Page {rolePageIndex + 1} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setRolePageIndex((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={rolePageIndex >= totalPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setRolePageIndex(totalPages - 1)}
                      disabled={rolePageIndex >= totalPages - 1}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-6 mt-6">
          {/* User Role Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UsersIcon className="mr-2 h-5 w-5" />
                Users & Role Assignment
              </CardTitle>
              <CardDescription>
                Create a user here, then choose which role they get. They&apos;ll only be able to
                access what that role allows.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isUserFormOpen && (
                <form onSubmit={handleCreateUser} className="space-y-4 p-4 border rounded-lg bg-muted/20">
                  <div>
                    <h4 className="text-sm font-semibold">Create New User</h4>
                    <p className="text-xs text-muted-foreground">
                      All fields are required.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="user-firstname" required>First Name</Label>
                      <Input
                        id="user-firstname"
                        placeholder="First name"
                        aria-invalid={!!userFormErrors.firstname}
                        className={userFormErrors.firstname ? 'border-destructive focus-visible:ring-destructive' : undefined}
                        value={userForm.firstname}
                        onChange={(e) => {
                          setUserForm((prev) => ({ ...prev, firstname: e.target.value }));
                          setUserFormErrors((prev) => ({ ...prev, firstname: undefined }));
                        }}
                      />
                      {userFormErrors.firstname && (
                        <p className="text-xs text-destructive">{userFormErrors.firstname}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-lastname" required>Last Name</Label>
                      <Input
                        id="user-lastname"
                        placeholder="Last name"
                        aria-invalid={!!userFormErrors.lastname}
                        className={userFormErrors.lastname ? 'border-destructive focus-visible:ring-destructive' : undefined}
                        value={userForm.lastname}
                        onChange={(e) => {
                          setUserForm((prev) => ({ ...prev, lastname: e.target.value }));
                          setUserFormErrors((prev) => ({ ...prev, lastname: undefined }));
                        }}
                      />
                      {userFormErrors.lastname && (
                        <p className="text-xs text-destructive">{userFormErrors.lastname}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-email" required>Email</Label>
                      <Input
                        id="user-email"
                        type="email"
                        placeholder="name@example.com"
                        aria-invalid={!!userFormErrors.email}
                        className={userFormErrors.email ? 'border-destructive focus-visible:ring-destructive' : undefined}
                        value={userForm.email}
                        onChange={(e) => {
                          setUserForm((prev) => ({ ...prev, email: e.target.value }));
                          setUserFormErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                      />
                      {userFormErrors.email && (
                        <p className="text-xs text-destructive">{userFormErrors.email}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-password" required>Password</Label>
                      <div className="relative">
                        <Input
                          id="user-password"
                          type={showUserPassword ? 'text' : 'password'}
                          placeholder="Temporary password"
                          aria-invalid={!!userFormErrors.password}
                          className={`pr-10 ${
                            userFormErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''
                          }`}
                          value={userForm.password}
                          onChange={(e) => {
                            setUserForm((prev) => ({ ...prev, password: e.target.value }));
                            setUserFormErrors((prev) => ({ ...prev, password: undefined }));
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label={showUserPassword ? 'Hide password' : 'Show password'}
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowUserPassword((prev) => !prev)}
                        >
                          {showUserPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      {userFormErrors.password && (
                        <p className="text-xs text-destructive">{userFormErrors.password}</p>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="user-role" required>Role</Label>
                      <Select
                        value={userForm.roleId}
                        onValueChange={(roleId) => {
                          setUserForm((prev) => ({ ...prev, roleId }));
                          setUserFormErrors((prev) => ({ ...prev, roleId: undefined }));
                        }}
                      >
                        <SelectTrigger
                          id="user-role"
                          className={userFormErrors.roleId ? 'border-destructive focus:ring-destructive' : undefined}
                        >
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem
                              key={role.id}
                              value={role.id}
                              disabled={role.name === 'Administrator' || role.status !== 'Active'}
                            >
                              <span className="flex items-center gap-2 whitespace-nowrap">
                                {role.name.trim()}
                                <span
                                  className={
                                    role.status === 'Active'
                                      ? 'text-xs text-emerald-600 dark:text-emerald-400'
                                      : 'text-xs text-muted-foreground'
                                  }
                                >
                                  ({role.status === 'Active' ? 'Active' : 'Inactive'})
                                </span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {userFormErrors.roleId && (
                        <p className="text-xs text-destructive">{userFormErrors.roleId}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeUserForm}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreatingUser}>
                      <Check className="mr-2 h-4 w-4" />
                      {isCreatingUser ? 'Creating...' : 'Create'}
                    </Button>
                  </div>
                </form>
              )}

              {users.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/30">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <UsersIcon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold">No users yet</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                    Create a user and assign them a role to control what they can access.
                  </p>
                  {canCreateSubAdmin && (
                    <Button className="mt-4" size="sm" onClick={() => setIsUserFormOpen(true)}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create User
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <ErrorBanner type="info" message="Permission changes apply the next time the user logs in." />
                  {users.map((user) => {
                    const administratorRoleId = roles.find((r) => r.name === 'Administrator')?.id;
                    const selectedRoleId = user.isSuperAdmin
                      ? administratorRoleId ?? ''
                      : user.roleId ?? '';
                    const isSelf = currentAdmin != null && user.id === String(currentAdmin.id);
                    const selectedRoleName = roles.find((r) => r.id === selectedRoleId)?.name?.trim();

                    return (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                    <Select
                      value={selectedRoleId}
                      onValueChange={(roleId) => handleAssign(user.id, roleId)}
                      disabled={user.isSuperAdmin || isSelf || !canAssignRole}
                    >
                      <SelectTrigger
                        className="w-[220px]"
                        title={
                          user.isSuperAdmin
                            ? 'Super Admin already has full access'
                            : isSelf
                            ? 'You cannot change your own role'
                            : !canAssignRole
                            ? "You don't have permission to assign roles"
                            : selectedRoleName
                        }
                      >
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem
                            key={role.id}
                            value={role.id}
                            disabled={role.name === 'Administrator' || role.status !== 'Active'}
                          >
                            <span className="flex items-center gap-2 whitespace-nowrap">
                              {role.name.trim()}
                              <span
                                className={
                                  role.status === 'Active'
                                    ? 'text-xs text-emerald-600 dark:text-emerald-400'
                                    : 'text-xs text-muted-foreground'
                                }
                              >
                                ({role.status === 'Active' ? 'Active' : 'Inactive'})
                              </span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                    );
                  })}
                  {totalUsers > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>Rows per page</span>
                        <Select
                          value={`${usersPageSize}`}
                          onValueChange={(val) => {
                            setUsersPageSize(Number(val));
                            setUsersPage(0);
                          }}
                        >
                          <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={usersPageSize} />
                          </SelectTrigger>
                          <SelectContent side="top">
                            {[5, 10, 20, 50].map((size) => (
                              <SelectItem key={size} value={`${size}`}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span>
                          Showing {Math.min(usersPage * usersPageSize + 1, totalUsers)} to{' '}
                          {Math.min((usersPage + 1) * usersPageSize, totalUsers)} of {totalUsers} entries
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setUsersPage(0)}
                          disabled={usersPage === 0}
                        >
                          <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setUsersPage((p) => Math.max(0, p - 1))}
                          disabled={usersPage === 0}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground px-2 font-medium">
                          Page {usersPage + 1} of {usersPageCount}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setUsersPage((p) => Math.min(usersPageCount - 1, p + 1))}
                          disabled={usersPage >= usersPageCount - 1}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setUsersPage(usersPageCount - 1)}
                          disabled={usersPage >= usersPageCount - 1}
                        >
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
