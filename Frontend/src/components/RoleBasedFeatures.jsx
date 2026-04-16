import { useAuth } from "../context/AuthContext";
import { USER_ROLES } from "../utils/constants";

/**
 * Component to conditionally render content based on user roles
 * @param {Object} props
 * @param {string|string[]} props.allowedRoles - Role(s) that can see the content
 * @param {React.ReactNode} props.children - Content to render if user has permission
 * @param {React.ReactNode} props.fallback - Content to render if user doesn't have permission
 * @returns {React.ReactNode}
 */
export const RoleBasedFeatures = ({
  allowedRoles,
  children,
  fallback = null,
}) => {
  const { user } = useAuth();

  if (!user) {
    return fallback;
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const hasPermission = roles.includes(user.role);

  return hasPermission ? children : fallback;
};

/**
 * Hook to check if current user has specific role(s)
 * @param {string|string[]} roles - Role(s) to check
 * @returns {boolean}
 */
export const useHasRole = (roles) => {
  const { user } = useAuth();

  if (!user) return false;

  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(user.role);
};

/**
 * Hook to check if current user is admin (admin or super-admin)
 * @returns {boolean}
 */
export const useIsAdmin = () => {
  return useHasRole([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]);
};

/**
 * Hook to check if current user is super admin
 * @returns {boolean}
 */
export const useIsSuperAdmin = () => {
  return useHasRole(USER_ROLES.SUPER_ADMIN);
};

/**
 * Hook to check if current user is student
 * @returns {boolean}
 */
export const useIsStudent = () => {
  return useHasRole(USER_ROLES.STUDENT);
};

/**
 * Component for admin-only features
 */
export const AdminOnly = ({ children, fallback = null }) => (
  <RoleBasedFeatures
    allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]}
    fallback={fallback}
  >
    {children}
  </RoleBasedFeatures>
);

/**
 * Component for super admin-only features
 */
export const SuperAdminOnly = ({ children, fallback = null }) => (
  <RoleBasedFeatures allowedRoles={USER_ROLES.SUPER_ADMIN} fallback={fallback}>
    {children}
  </RoleBasedFeatures>
);

/**
 * Component for student-only features
 */
export const StudentOnly = ({ children, fallback = null }) => (
  <RoleBasedFeatures allowedRoles={USER_ROLES.STUDENT} fallback={fallback}>
    {children}
  </RoleBasedFeatures>
);

/**
 * Hook to get user permissions for specific actions
 * @returns {Object} Object with permission flags
 */
export const useUserPermissions = () => {
  const { user } = useAuth();

  if (!user) {
    return {
      canUploadProjects: false,
      canApproveProjects: false,
      canViewDashboard: false,
      canManageUsers: false,
      canViewPendingProjects: false,
      canEditOwnProjects: false,
      canDownloadProjects: true, // Public feature
    };
  }

  const isStudent = user.role === USER_ROLES.STUDENT;
  const isAdmin = user.role === USER_ROLES.ADMIN;
  const isSuperAdmin = user.role === USER_ROLES.SUPER_ADMIN;

  return {
    canUploadProjects: isStudent || isAdmin || isSuperAdmin,
    canApproveProjects: isAdmin || isSuperAdmin,
    canViewDashboard: isAdmin || isSuperAdmin,
    canManageUsers: isSuperAdmin,
    canViewPendingProjects: isAdmin || isSuperAdmin,
    canEditOwnProjects: true, // All authenticated users can edit their own projects
    canDownloadProjects: true, // All users can download approved projects
    canViewAllProjects: isAdmin || isSuperAdmin,
    canDeleteProjects: isAdmin || isSuperAdmin,
    canFeatureProjects: isSuperAdmin,
    canViewAnalytics: isAdmin || isSuperAdmin,
    canExportData: isAdmin || isSuperAdmin,
  };
};

export default RoleBasedFeatures;
