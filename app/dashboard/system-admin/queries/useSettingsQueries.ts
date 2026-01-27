"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { systemSettingsService } from "@/lib/services/systemSettings";
import { userProfileService } from "@/lib/services/userProfile";
import { activityLogsService } from "@/lib/services/activityLogs";
import { userService } from "@/lib/services/users";
import { unifiedUserService } from "@/lib/services/unifiedUser";
import type {
  SystemSettings,
  ActivityLog,
  ActivityLogFilters
} from "@/lib/api/types";
import type {
  UserProfileData,
  UpdateProfileData,
  ChangePasswordData
} from "@/lib/services/userProfile";
import { AxiosError } from "axios";

/**
 * Hook for fetching user profile data
 */
export function useUserProfile() {
  return useQuery<UserProfileData, AxiosError>({
    queryKey: ["user-profile"],
    queryFn: () => userProfileService.getUserProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook for updating user profile
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation<UserProfileData, AxiosError, UpdateProfileData>({
    mutationFn: (data: UpdateProfileData) => userProfileService.updateUserProfile(data),
    onSuccess: (data) => {
      // Update the cached profile data
      queryClient.setQueryData(["user-profile"], data);
    },
  });
}

/**
 * Hook for changing password
 */
export function useChangePassword() {
  return useMutation<void, AxiosError, ChangePasswordData>({
    mutationFn: (data: ChangePasswordData) => userProfileService.changePassword(data),
  });
}

/**
 * Hook for updating profile picture
 */
export function useUpdateProfilePicture() {
  const queryClient = useQueryClient();

  return useMutation<UserProfileData, AxiosError, File>({
    mutationFn: (file: File) => userProfileService.updateProfilePicture(file),
    onSuccess: (data) => {
      // Update the cached profile data
      queryClient.setQueryData(["user-profile"], data);
    },
  });
}

/**
 * Hook for fetching system settings
 */
export function useSystemSettings() {
  return useQuery<SystemSettings, AxiosError>({
    queryKey: ["system-settings"],
    queryFn: async () => {
      console.log('🔄 useSystemSettings query executing');

      try {
        const result = await systemSettingsService.getSystemSettings();
        console.log('✅ useSystemSettings query successful:', {
          hasId: !!result.id,
          interestRate: result.globalDefaults?.interestRate,
          sessionTimeout: result.security?.sessionTimeout
        });
        return result;
      } catch (error) {
        console.error('❌ useSystemSettings query failed:', error);

        // Log additional debugging info
        console.error('🔍 System Settings Query Debug Info:', {
          timestamp: new Date().toISOString(),
          currentUrl: typeof window !== 'undefined' ? window.location.href : 'N/A'
        });

        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (endpoint doesn't exist)
      if ((error as any)?.status === 404) {
        console.log('🚫 Not retrying 404 error for system settings');
        return false;
      }

      // Retry up to 2 times for other errors
      return failureCount < 2;
    }
  });
}

/**
 * Hook for fetching all users with filters - uses unifiedUserService to get proper role information
 */
export function useUsers(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: async () => {
      console.log('🔄 [useUsers] Query executing with filters:', filters);
      
      try {
        // Use unifiedUserService.getUsers() which fetches from /admin/staff/my-staff 
        // This endpoint returns proper role information unlike /admin/users
        const result = await unifiedUserService.getUsers(filters);
        console.log('✅ [useUsers] Query successful:', {
          dataLength: result.data?.length || 0,
          pagination: result.pagination,
          firstUser: result.data?.[0]
        });
        return result;
      } catch (error: any) {
        console.error('❌ [useUsers] Query failed:', error);
        console.error('❌ [useUsers] Error details:', {
          message: error?.message,
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          data: error?.response?.data
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.log('🚫 [useUsers] Not retrying auth error:', error?.response?.status);
        return false;
      }
      
      // Don't retry on 404 errors (endpoint doesn't exist)
      if (error?.response?.status === 404) {
        console.log('🚫 [useUsers] Not retrying 404 error');
        return false;
      }

      // Retry up to 2 times for other errors
      console.log(`🔄 [useUsers] Retrying (${failureCount}/2):`, error?.message);
      return failureCount < 2;
    },
  });
}

/**
 * Hook for fetching admin/staff users only (for Permissions and Users tab)
 * Uses the /admin/staff/my-staff endpoint which should return only admin users
 */
export function useAdminStaff() {
  return useQuery({
    queryKey: ["admin-staff"],
    queryFn: async () => {
      try {
        // Use the staff endpoint which should return only admin users
        const staffUsers = await userService.getMyStaff();
        
        // Transform to match the expected format
        if (Array.isArray(staffUsers)) {
          return {
            data: staffUsers,
            pagination: {
              page: 1,
              limit: staffUsers.length,
              total: staffUsers.length,
              totalPages: 1
            }
          };
        }
        
        return {
          data: [],
          pagination: {
            page: 1,
            limit: 0,
            total: 0,
            totalPages: 0
          }
        };
      } catch (error) {
        console.error('Failed to fetch admin staff:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook for updating a user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
    },
  });
}

/**
 * Hook for updating a user's role
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => userService.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
    },
  });
}

/**
 * Hook for creating a staff user
 */
export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => userService.createStaffUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
    },
  });
}

/**
 * Hook for updating system settings
 */
export function useUpdateSystemSettings() {
  const queryClient = useQueryClient();

  return useMutation<SystemSettings, AxiosError, Partial<SystemSettings>>({
    mutationFn: async (settings: Partial<SystemSettings>) => {
      console.log('🔄 useUpdateSystemSettings mutation executing with settings:', settings);

      try {
        const result = await systemSettingsService.updateSystemSettings(settings);
        console.log('✅ useUpdateSystemSettings mutation successful:', {
          hasId: !!result.id,
          updatedAt: result.updatedAt
        });
        return result;
      } catch (error) {
        console.error('❌ useUpdateSystemSettings mutation failed:', error);

        // Log additional debugging info
        console.error('🔍 System Settings Update Mutation Debug Info:', {
          settings,
          timestamp: new Date().toISOString(),
          currentUrl: typeof window !== 'undefined' ? window.location.href : 'N/A'
        });

        throw error;
      }
    },
    onSuccess: (data) => {
      // Update the cached settings data
      queryClient.setQueryData(["system-settings"], data);
      console.log('🎉 System Settings Update Mutation Success:', {
        updatedAt: data.updatedAt,
        updatedBy: data.updatedBy
      });
    },
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (endpoint doesn't exist)
      if ((error as any)?.status === 404) {
        console.log('🚫 Not retrying 404 error for system settings update');
        return false;
      }

      // Retry up to 1 time for other errors
      return failureCount < 1;
    },
  });
}

/**
 * Hook for fetching activity logs with filters
 */
export function useActivityLogs(filters: ActivityLogFilters) {
  return useQuery<{ data: ActivityLog[]; pagination: Record<string, unknown> }, AxiosError>({
    queryKey: ["activity-logs", filters],
    queryFn: async () => {
      console.log('🔄 useActivityLogs query executing with filters:', filters);

      try {
        const result = await activityLogsService.getActivityLogs(filters);
        console.log('✅ useActivityLogs query successful:', {
          dataLength: result.data?.length || 0,
          pagination: result.pagination
        });
        return result;
      } catch (error) {
        console.error('❌ useActivityLogs query failed:', error);

        // Log additional debugging info
        console.error('🔍 Query Debug Info:', {
          filters,
          timestamp: new Date().toISOString(),
          currentUrl: typeof window !== 'undefined' ? window.location.href : 'N/A'
        });

        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (endpoint not implemented)
      if (error?.status === 404) {
        console.log('🚫 Not retrying 404 error for activity logs');
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    enabled: !!filters // Only run query when filters are provided
  });
}