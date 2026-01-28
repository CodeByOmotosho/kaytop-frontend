/**
 * Enhanced User Service - Uses Working Endpoints with Role Information
 * Solves the customer identification problem by using endpoints that provide role data
 */

import apiClient from '@/lib/apiClient';
import { API_ENDPOINTS } from '../api/config';
import type {
  User,
  UserFilterParams,
  PaginatedResponse,
  PaginationParams,
} from '../api/types';

export interface EnhancedUser extends User {
  role: string; // Guaranteed to have role field
}

export interface CustomerFilterParams extends PaginationParams {
  branch?: string;
  state?: string;
  verificationStatus?: string;
  accountStatus?: string;
}

class EnhancedUserService {
  // Cache for branch names to avoid repeated API calls
  private branchCache: string[] | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get all users with role information by combining working endpoints
   */
  async getAllUsersWithRoles(): Promise<EnhancedUser[]> {
    try {
      console.log('🔍 Fetching users with role information...');
      
      const allUsers: EnhancedUser[] = [];
      
      // 1. Get staff members (guaranteed to have role field)
      try {
        const staffResponse = await apiClient.get<EnhancedUser[]>(API_ENDPOINTS.ADMIN.MY_STAFF);
        const staff = Array.isArray(staffResponse.data) ? staffResponse.data : [];
        
        console.log(`✅ Found ${staff.length} staff members with roles`);
        allUsers.push(...staff);
      } catch (error) {
        console.warn('⚠️ Could not fetch staff members:', error);
      }
      
      // 2. Get users from all branches (also have role field)
      const branches = await this.getBranchNames();
      
      for (const branch of branches) {
        try {
          const branchResponse = await apiClient.get<{ users?: EnhancedUser[] } | EnhancedUser[]>(
            API_ENDPOINTS.ADMIN.USERS_BY_BRANCH(branch)
          );
          
          let branchUsers: EnhancedUser[] = [];
          
          // Handle different response formats
          if (Array.isArray(branchResponse.data)) {
            branchUsers = branchResponse.data;
          } else if (branchResponse.data && Array.isArray(branchResponse.data.users)) {
            branchUsers = branchResponse.data.users;
          }
          
          // Filter out users already in staff list (avoid duplicates)
          const newUsers = branchUsers.filter(branchUser => 
            !allUsers.some(existingUser => existingUser.id === branchUser.id)
          );
          
          console.log(`✅ Found ${newUsers.length} new users from ${branch} branch`);
          allUsers.push(...newUsers);
          
        } catch (error) {
          console.warn(`⚠️ Could not fetch users from ${branch} branch:`, error);
        }
      }
      
      console.log(`🎉 Total users with roles: ${allUsers.length}`);
      
      // Log role distribution for debugging
      const roleDistribution = allUsers.reduce((acc, user) => {
        const role = user.role || 'undefined';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log('📊 Role distribution:', roleDistribution);
      
      return allUsers;
      
    } catch (error) {
      console.error('❌ Error fetching users with roles:', error);
      throw error;
    }
  }

  /**
   * Get customers only (users with customer-like roles)
   */
  async getCustomers(params?: CustomerFilterParams): Promise<PaginatedResponse<EnhancedUser>> {
    try {
      console.log('🎯 Fetching customers with role filtering...');
      
      const allUsers = await this.getAllUsersWithRoles();
      
      // Filter for customers based on role
      let customers = allUsers.filter(user => {
        // Customer identification logic based on discovered roles
        const isCustomer = user.role === 'user' || 
                          user.role === 'customer' ||
                          user.role === 'client';
        
        return isCustomer;
      });
      
      console.log(`🎯 Found ${customers.length} customers after role filtering`);
      
      // Apply additional filters if provided
      if (params?.branch) {
        customers = customers.filter(user => 
          user.branch?.toLowerCase().includes(params.branch!.toLowerCase())
        );
        console.log(`🏢 After branch filter (${params.branch}): ${customers.length} customers`);
      }
      
      if (params?.state) {
        customers = customers.filter(user => 
          user.state?.toLowerCase().includes(params.state!.toLowerCase())
        );
        console.log(`🌍 After state filter (${params.state}): ${customers.length} customers`);
      }
      
      if (params?.verificationStatus) {
        customers = customers.filter(user => 
          user.verificationStatus === params.verificationStatus
        );
        console.log(`✅ After verification filter (${params.verificationStatus}): ${customers.length} customers`);
      }
      
      if (params?.accountStatus) {
        customers = customers.filter(user => 
          user.accountStatus === params.accountStatus
        );
        console.log(`📋 After account status filter (${params.accountStatus}): ${customers.length} customers`);
      }
      
      // Apply pagination
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      const paginatedCustomers = customers.slice(startIndex, endIndex);
      
      console.log(`📄 Page ${page}: Showing ${paginatedCustomers.length} of ${customers.length} customers`);
      
      return {
        data: paginatedCustomers,
        pagination: {
          page,
          limit,
          total: customers.length,
          totalPages: Math.ceil(customers.length / limit)
        }
      };
      
    } catch (error) {
      console.error('❌ Error fetching customers:', error);
      throw error;
    }
  }

  /**
   * Get staff members only (non-customer roles)
   */
  async getStaff(params?: PaginationParams): Promise<PaginatedResponse<EnhancedUser>> {
    try {
      console.log('👥 Fetching staff members...');
      
      const allUsers = await this.getAllUsersWithRoles();
      
      // Filter for staff (non-customer roles)
      const staff = allUsers.filter(user => {
        const isStaff = user.role === 'system_admin' ||
                       user.role === 'hq_manager' ||
                       user.role === 'account_manager' ||
                       user.role === 'branch_manager' ||
                       user.role === 'credit_officer';
        
        return isStaff;
      });
      
      console.log(`👥 Found ${staff.length} staff members`);
      
      // Apply pagination
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      const paginatedStaff = staff.slice(startIndex, endIndex);
      
      return {
        data: paginatedStaff,
        pagination: {
          page,
          limit,
          total: staff.length,
          totalPages: Math.ceil(staff.length / limit)
        }
      };
      
    } catch (error) {
      console.error('❌ Error fetching staff:', error);
      throw error;
    }
  }

  /**
   * Get user by ID with role information
   */
  async getUserById(id: string): Promise<EnhancedUser> {
    try {
      console.log(`🔍 Fetching user ${id} with role information...`);
      
      const response = await apiClient.get<EnhancedUser>(API_ENDPOINTS.ADMIN.USER_BY_ID(id));
      
      // Handle different response formats
      let userData: EnhancedUser;
      
      if (response.data && typeof response.data === 'object') {
        // Check if it's wrapped in success/data format
        if ((response.data as any).success && (response.data as any).data) {
          userData = (response.data as any).data;
        } else {
          userData = response.data;
        }
      } else {
        throw new Error('Invalid response format');
      }
      
      console.log(`✅ Found user ${id} with role: ${userData.role}`);
      return userData;
      
    } catch (error) {
      console.error(`❌ Error fetching user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get branch names for branch-based user fetching
   */
  private async getBranchNames(): Promise<string[]> {
    // Check cache first
    if (this.branchCache && Date.now() < this.cacheExpiry) {
      return this.branchCache;
    }
    
    try {
      console.log('🏢 Discovering branch names...');
      
      // Try to get branches from a known working endpoint
      // We'll use the staff endpoint and extract unique branch names
      const staffResponse = await apiClient.get<EnhancedUser[]>(API_ENDPOINTS.ADMIN.MY_STAFF);
      const staff = Array.isArray(staffResponse.data) ? staffResponse.data : [];
      
      const branches = [...new Set(
        staff
          .map(user => user.branch)
          .filter(branch => branch && branch.trim() !== '')
      )];
      
      // Add some common branches that might not be in staff data
      const commonBranches = ['Lagos Island', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan'];
      commonBranches.forEach(branch => {
        if (!branches.includes(branch)) {
          branches.push(branch);
        }
      });
      
      console.log(`🏢 Found ${branches.length} branches:`, branches);
      
      // Cache the results
      this.branchCache = branches;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;
      
      return branches;
      
    } catch (error) {
      console.warn('⚠️ Could not discover branches, using defaults:', error);
      
      // Fallback to common branch names
      const defaultBranches = ['Lagos Island', 'Abuja', 'Port Harcourt'];
      this.branchCache = defaultBranches;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;
      
      return defaultBranches;
    }
  }

  /**
   * Get role statistics for dashboard/analytics
   */
  async getRoleStatistics(): Promise<Record<string, number>> {
    try {
      const allUsers = await this.getAllUsersWithRoles();
      
      const roleStats = allUsers.reduce((acc, user) => {
        const role = user.role || 'undefined';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log('📊 Role statistics:', roleStats);
      return roleStats;
      
    } catch (error) {
      console.error('❌ Error getting role statistics:', error);
      throw error;
    }
  }

  /**
   * Clear cache (useful for testing or forced refresh)
   */
  clearCache(): void {
    this.branchCache = null;
    this.cacheExpiry = 0;
    console.log('🗑️ Cache cleared');
  }
}

// Export singleton instance
export const enhancedUserService = new EnhancedUserService();