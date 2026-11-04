import { apiSlice } from './apiSlice';
import { ApiResponse, Permission, PERMISSION_GROUPS, Role } from '@/types';

export interface BackendRole {
  id: number;
  name: string;
  description: string | null;
  permissions: string[];
  isSystem: boolean;
  status?: 'Active' | 'InActive';
  createdAt: string;
  updatedAt: string;
}

export interface BackendRoleAdmin {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  status: 'Active' | 'Blocked';
  type: 'SuperAdmin' | 'SubAdmin';
  roleId: number | null;
  role: { id: number; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoleAssignableUser {
  id: string;
  name: string;
  email: string;
  roleId?: string;
  roleName?: string;
  isSuperAdmin: boolean;
}

export interface AssignableUsersResponse {
  success: boolean;
  message: string;
  data: RoleAssignableUser[];
  count: number;
  skip: number;
  take: number;
}

function mapRole(role: BackendRole): Role {
  return {
    id: String(role.id),
    name: role.name,
    description: role.description ?? undefined,
    permissions: role.permissions as Permission[],
    isSystem: role.isSystem,
    status: role.status ?? 'Active',
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
}

function mapRoleAdmin(admin: BackendRoleAdmin): RoleAssignableUser {
  return {
    id: String(admin.id),
    name: `${admin.firstname} ${admin.lastname}`.trim() || admin.email,
    email: admin.email,
    roleId: admin.role ? String(admin.role.id) : undefined,
    roleName: admin.type === 'SuperAdmin' ? 'Super Admin' : admin.role?.name,
    isSuperAdmin: admin.type === 'SuperAdmin',
  };
}

export interface BackendRolesPaginatedResponse {
  count: number;
  skip: number;
  take: number;
  data: BackendRole[];
}

export interface RolesResponse {
  count: number;
  skip: number;
  take: number;
  data: Role[];
}

export interface GetRolesParams {
  skip?: number;
  take?: number;
  search?: string;
}

export const rolesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Backend endpoint: GET /roles
    getRoles: builder.query<ApiResponse<RolesResponse>, GetRolesParams | void>({
      query: (params) => ({
        url: '/roles',
        params: params
          ? {
              ...(params.skip !== undefined ? { skip: params.skip } : {}),
              ...(params.take !== undefined ? { take: params.take } : {}),
              ...(params.search ? { search: params.search } : {}),
            }
          : undefined,
      }),
      transformResponse: (response: any): ApiResponse<RolesResponse> => {
        let rawCount = 0;
        let rawSkip = 0;
        let rawTake = 10;
        let rawList: BackendRole[] = [];

        if (response) {
          if (Array.isArray(response)) {
            rawList = response;
            rawCount = response.length;
            rawSkip = 0;
            rawTake = response.length;
          } else if (Array.isArray(response.data)) {
            if (typeof response.count === 'number') {
              rawCount = response.count;
              rawSkip = response.skip ?? 0;
              rawTake = response.take ?? 10;
              rawList = response.data;
            } else {
              rawList = response.data;
              rawCount = rawList.length;
              rawSkip = 0;
              rawTake = rawList.length;
            }
          } else if (response.data && Array.isArray(response.data.data)) {
            rawCount = response.data.count ?? 0;
            rawSkip = response.data.skip ?? 0;
            rawTake = response.data.take ?? 10;
            rawList = response.data.data ?? [];
          }
        }

        return {
          success: true,
          message: 'Roles fetched',
          data: {
            count: rawCount,
            skip: rawSkip,
            take: rawTake,
            data: rawList.map(mapRole),
          },
        };
      },
      providesTags: ['Role'],
    }),

    // Backend endpoint: GET /roles/:id
    getRole: builder.query<ApiResponse<Role>, string>({
      query: (id) => `/roles/${id}`,
      transformResponse: (response: BackendRole): ApiResponse<Role> => ({
        success: true,
        message: 'Role fetched',
        data: mapRole(response),
      }),
      providesTags: (result, error, id) => [{ type: 'Role', id }],
    }),

    // Backend endpoint: GET /permissions
    getPermissions: builder.query<
      ApiResponse<{ permissions: Permission[]; groups: typeof PERMISSION_GROUPS }>,
      { search?: string } | void
    >({
      query: (params) => ({
        url: '/permissions',
        params: params?.search ? { search: params.search } : undefined,
      }),
      transformResponse: (response: {
        permissions: { key: string }[];
        groups: { module: string; label: string; permissions: string[] }[];
      }) => ({
        success: true,
        message: 'Permissions fetched',
        data: {
          permissions: response.permissions.map((p) => p.key) as Permission[],
          groups: response.groups as typeof PERMISSION_GROUPS,
        },
      }),
    }),

    // Backend endpoint: POST /roles
    createRole: builder.mutation<ApiResponse<Role>, { name: string; description?: string; permissions: Permission[] }>({
      query: (input) => ({ url: '/roles', method: 'POST', body: input }),
      transformResponse: (response: BackendRole): ApiResponse<Role> => ({
        success: true,
        message: 'Role created',
        data: mapRole(response),
      }),
      invalidatesTags: ['Role'],
    }),

    // Backend endpoint: PUT /roles/:id
    updateRole: builder.mutation<
      ApiResponse<Role>,
      { id: string; name?: string; description?: string; permissions?: Permission[] }
    >({
      query: ({ id, ...input }) => ({ url: `/roles/${id}`, method: 'PUT', body: input }),
      transformResponse: (response: BackendRole): ApiResponse<Role> => ({
        success: true,
        message: 'Role updated',
        data: mapRole(response),
      }),
      invalidatesTags: ['Role', 'User'],
    }),

    // Backend endpoint: PATCH /roles/:id/:status
    updateRoleStatus: builder.mutation<ApiResponse<Role>, { id: string; status: 'Active' | 'InActive' }>({
      query: ({ id, status }) => ({ url: `/roles/${id}/${status}`, method: 'PATCH' }),
      transformResponse: (response: BackendRole): ApiResponse<Role> => ({
        success: true,
        message: 'Role status updated',
        data: mapRole(response),
      }),
      invalidatesTags: ['Role'],
    }),

    // Backend endpoint: DELETE /roles/:id
    deleteRole: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/roles/${id}`, method: 'DELETE' }),
      transformResponse: (): ApiResponse<null> => ({
        success: true,
        message: 'Role deleted',
        data: null,
      }),
      invalidatesTags: ['Role'],
    }),

    // Backend endpoint: GET /sub-admin — Sub Admin roster for role assignment
    getAssignableUsers: builder.query<
      AssignableUsersResponse,
      { skip?: number; take?: number } | void
    >({
      query: (params) => ({
        url: '/sub-admin',
        params: { skip: params?.skip ?? 0, take: params?.take ?? 10 },
      }),
      transformResponse: (response: {
        count: number;
        skip: number;
        take: number;
        data: BackendRoleAdmin[];
      }): AssignableUsersResponse => ({
        success: true,
        message: 'Admins fetched',
        data: response.data.map(mapRoleAdmin),
        count: response.count,
        skip: response.skip,
        take: response.take,
      }),
      providesTags: ['User'],
    }),

    // Backend endpoint: POST /sub-admin
    createRoleUser: builder.mutation<
      ApiResponse<RoleAssignableUser>,
      { firstname: string; lastname: string; email: string; password: string; roleId: string }
    >({
      query: ({ firstname, lastname, email, password, roleId }) => ({
        url: '/sub-admin',
        method: 'POST',
        body: {
          firstname,
          lastname,
          email,
          password,
          roleId: Number(roleId),
        },
      }),
      transformResponse: (response: BackendRoleAdmin): ApiResponse<RoleAssignableUser> => ({
        success: true,
        message: 'User created and role assigned',
        data: mapRoleAdmin(response),
      }),
      invalidatesTags: ['User'],
    }),

    // Backend endpoint: PATCH /sub-admin/:adminId/role
    assignUserRole: builder.mutation<ApiResponse<RoleAssignableUser>, { userId: string; roleId: string }>({
      query: ({ userId, roleId }) => ({
        url: `/sub-admin/${userId}/role`,
        method: 'PATCH',
        body: { roleId: Number(roleId) },
      }),
      transformResponse: (response: BackendRoleAdmin): ApiResponse<RoleAssignableUser> => {
        const user = mapRoleAdmin(response);
        return {
          success: true,
          message: `Role assigned to ${user.name}`,
          data: user,
        };
      },
      invalidatesTags: ['User', 'Role'],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleQuery,
  useGetPermissionsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useUpdateRoleStatusMutation,
  useDeleteRoleMutation,
  useGetAssignableUsersQuery,
  useCreateRoleUserMutation,
  useAssignUserRoleMutation,
} = rolesApi;
