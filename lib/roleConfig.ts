/**
 * Role and Permission Configuration
 * 
 * Centralized configuration for roles and their default permissions.
 */

export type UserRoleType = 'HQ' | 'CO' | 'BM' | 'ADMIN';

export interface RoleConfig {
    label: string;
    color: string;
    backgroundColor: string;
    defaultPermissions: string[];
}

export const ROLE_CONFIG: Record<UserRoleType, RoleConfig> = {
    HQ: {
        label: 'HQ Manager',
        color: '#AB659C',
        backgroundColor: '#FBEFF8',
        defaultPermissions: ['Services', 'Clients', 'Subscriptions', 'Reports', 'Analytics', 'Branch Management']
    },
    CO: {
        label: 'Credit Officer',
        color: '#462ACD',
        backgroundColor: '#DEDAF3',
        defaultPermissions: ['Services', 'Clients', 'Loan Processing']
    },
    BM: {
        label: 'Branch Manager',
        color: '#AB659C',
        backgroundColor: '#FBEFF8',
        defaultPermissions: ['Services', 'Clients', 'Subscriptions', 'Staff Management']
    },
    ADMIN: {
        label: 'System Administrator',
        color: '#DC2626',
        backgroundColor: '#FEF2F2',
        defaultPermissions: ['Services', 'Clients', 'Subscriptions', 'Reports', 'Analytics', 'Branch Management', 'Staff Management', 'User Administration', 'System Configuration']
    }
};

export const PERMISSION_CATEGORIES = {
    'Core Services': ['Services', 'Clients', 'Subscriptions'],
    'Financial': ['Loan Processing', 'Payment Management', 'Financial Reports'],
    'Management': ['Staff Management', 'Branch Management', 'User Administration'],
    'Analytics': ['Reports', 'Analytics', 'Data Export']
};

/**
 * Enhanced role mapping with email-based inference as fallback
 * when backend doesn't provide role field
 */
export const mapBackendToFrontendRole = (backendRole: string, email?: string, name?: string): UserRoleType => {
    console.log('🔍 Role mapping input:', { backendRole, email, name }); // Debug log
    
    // If backend provides a valid role, use it
    if (backendRole && backendRole !== 'undefined' && backendRole !== 'null') {
        const normalizedRole = backendRole.toLowerCase().trim();
        
        if (normalizedRole === 'branch_manager' || normalizedRole === 'bm') return 'BM';
        if (normalizedRole === 'account_manager' || normalizedRole === 'am') return 'HQ'; // Legacy map to HQ
        if (normalizedRole === 'credit_officer' || normalizedRole === 'co') return 'CO';
        if (normalizedRole === 'hq_manager' || normalizedRole === 'hq') return 'HQ';
        if (normalizedRole === 'system_admin' || normalizedRole === 'admin') return 'ADMIN';
        
        // Log unrecognized roles
        console.warn('⚠️ Unrecognized backend role:', backendRole);
    }
    
    // Fallback: Infer role from email patterns when backend role is missing
    if (email) {
        const emailLower = email.toLowerCase();
        const nameLower = name?.toLowerCase() || '';
        
        // System Admin patterns
        if (emailLower.includes('admin@kaytop.com') || emailLower.includes('system') || nameLower.includes('system administrator')) {
            console.log('🔍 Mapped to ADMIN via email pattern');
            return 'ADMIN';
        }
        
        // Branch Manager patterns
        if (emailLower.includes('bm@') || emailLower.includes('branch') || emailLower.includes('bmadmin') || 
            emailLower.includes('_branch@') || nameLower.includes('branch manager')) {
            console.log('🔍 Mapped to BM via email pattern');
            return 'BM';
        }
        
        // HQ Manager patterns
        if (emailLower.includes('hq') || emailLower.includes('adminhq') || nameLower.includes('hq manager')) {
            console.log('🔍 Mapped to HQ via email pattern');
            return 'HQ';
        }
        
        // Credit Officer patterns (less specific, so check last)
        if (emailLower.includes('credit') || emailLower.includes('officer') || nameLower.includes('credit officer')) {
            console.log('🔍 Mapped to CO via email pattern');
            return 'CO';
        }
    }
    
    // Default fallback - but log this as it might indicate a problem
    console.warn('⚠️ Role mapping fell back to default HQ for:', { backendRole, email, name });
    return 'HQ';
};

/**
 * Maps frontend role to backend role
 */
export const mapFrontendToBackendRole = (frontendRole: UserRoleType): string => {
    switch (frontendRole) {
        case 'BM': return 'branch_manager';
        case 'CO': return 'credit_officer';
        case 'HQ': return 'hq_manager';
        case 'ADMIN': return 'system_admin';
        default: return 'hq_manager';
    }
};

/**
 * Gets default permissions for a backend role
 */
export const getPermissionsForRole = (backendRole: string): string[] => {
    const frontendRole = mapBackendToFrontendRole(backendRole);
    return ROLE_CONFIG[frontendRole].defaultPermissions;
};
