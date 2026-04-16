import { useAuth } from "../context/AuthContext";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import {
  RoleBasedFeatures,
  AdminOnly,
  SuperAdminOnly,
  StudentOnly,
  useHasRole,
  useIsAdmin,
  useIsSuperAdmin,
  useIsStudent,
  useUserPermissions,
} from "../components/RoleBasedFeatures";
import {
  User,
  Shield,
  Crown,
  GraduationCap,
  CheckCircle,
  XCircle,
  Upload,
  FileText,
  BarChart3,
  Users,
  Download,
  Edit,
  Trash2,
  Star,
  TrendingUp,
  FileDown,
} from "lucide-react";

export function RoleTestPage() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const isSuperAdmin = useIsSuperAdmin();
  const isStudent = useIsStudent();
  const permissions = useUserPermissions();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-slate-600">Please log in to view this page.</p>
        </Card>
      </div>
    );
  }

  const PermissionItem = ({ permission, label, icon: Icon }) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </span>
      </div>
      {permission ? (
        <CheckCircle className="w-5 h-5 text-green-600" />
      ) : (
        <XCircle className="w-5 h-5 text-red-600" />
      )}
    </div>
  );

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Role-Based Features Test Page
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Testing UI features based on user roles and permissions
        </p>
      </div>

      {/* Current User Info */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
          Current User Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {user.firstName} {user.lastName}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Department:</strong> {user.department}
            </p>
            <p>
              <strong>Batch:</strong> {user.batch}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <strong>Role:</strong>
              <Badge
                variant={
                  user.role === "super-admin"
                    ? "default"
                    : user.role === "admin"
                      ? "secondary"
                      : "outline"
                }
                className="capitalize"
              >
                {user.role === "super-admin" && (
                  <Crown className="w-4 h-4 mr-1" />
                )}
                {user.role === "admin" && <Shield className="w-4 h-4 mr-1" />}
                {user.role === "student" && (
                  <GraduationCap className="w-4 h-4 mr-1" />
                )}
                {user.role}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <strong>Status:</strong>
              <Badge variant={user.verified ? "default" : "destructive"}>
                {user.verified ? "Verified" : "Unverified"}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Role Detection Tests */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
          Role Detection Tests
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <GraduationCap
              className={`w-8 h-8 mx-auto mb-2 ${isStudent ? "text-green-600" : "text-slate-400"}`}
            />
            <p className="font-medium">Student</p>
            <Badge variant={isStudent ? "default" : "outline"}>
              {isStudent ? "Yes" : "No"}
            </Badge>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <Shield
              className={`w-8 h-8 mx-auto mb-2 ${isAdmin ? "text-blue-600" : "text-slate-400"}`}
            />
            <p className="font-medium">Admin</p>
            <Badge variant={isAdmin ? "default" : "outline"}>
              {isAdmin ? "Yes" : "No"}
            </Badge>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <Crown
              className={`w-8 h-8 mx-auto mb-2 ${isSuperAdmin ? "text-purple-600" : "text-slate-400"}`}
            />
            <p className="font-medium">Super Admin</p>
            <Badge variant={isSuperAdmin ? "default" : "outline"}>
              {isSuperAdmin ? "Yes" : "No"}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Permission Matrix */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
          User Permissions Matrix
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">
              Project Management
            </h3>
            <PermissionItem
              permission={permissions.canUploadProjects}
              label="Upload Projects"
              icon={Upload}
            />
            <PermissionItem
              permission={permissions.canEditOwnProjects}
              label="Edit Own Projects"
              icon={Edit}
            />
            <PermissionItem
              permission={permissions.canDownloadProjects}
              label="Download Projects"
              icon={Download}
            />
            <PermissionItem
              permission={permissions.canApproveProjects}
              label="Approve Projects"
              icon={CheckCircle}
            />
            <PermissionItem
              permission={permissions.canDeleteProjects}
              label="Delete Projects"
              icon={Trash2}
            />
            <PermissionItem
              permission={permissions.canFeatureProjects}
              label="Feature Projects"
              icon={Star}
            />
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">
              System Access
            </h3>
            <PermissionItem
              permission={permissions.canViewDashboard}
              label="View Dashboard"
              icon={BarChart3}
            />
            <PermissionItem
              permission={permissions.canViewPendingProjects}
              label="View Pending Projects"
              icon={FileText}
            />
            <PermissionItem
              permission={permissions.canManageUsers}
              label="Manage Users"
              icon={Users}
            />
            <PermissionItem
              permission={permissions.canViewAnalytics}
              label="View Analytics"
              icon={TrendingUp}
            />
            <PermissionItem
              permission={permissions.canExportData}
              label="Export Data"
              icon={FileDown}
            />
            <PermissionItem
              permission={permissions.canViewAllProjects}
              label="View All Projects"
              icon={FileText}
            />
          </div>
        </div>
      </Card>

      {/* Role-Based Component Tests */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
          Role-Based Component Visibility Tests
        </h2>
        <div className="space-y-4">
          {/* Student Only Content */}
          <div className="p-4 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">
              Student Only Content
            </h3>
            <StudentOnly
              fallback={
                <p className="text-slate-500 italic">
                  Hidden - You are not a student
                </p>
              }
            >
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                <p className="text-green-700 dark:text-green-400">
                  🎓 Welcome, student! You can upload and manage your projects
                  here.
                </p>
              </div>
            </StudentOnly>
          </div>

          {/* Admin Only Content */}
          <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
              Admin Only Content
            </h3>
            <AdminOnly
              fallback={
                <p className="text-slate-500 italic">
                  Hidden - You are not an admin
                </p>
              }
            >
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                <p className="text-blue-700 dark:text-blue-400">
                  🛡️ Admin panel access: You can review and approve projects
                  from your department.
                </p>
              </div>
            </AdminOnly>
          </div>

          {/* Super Admin Only Content */}
          <div className="p-4 border border-purple-200 dark:border-purple-800 rounded-lg">
            <h3 className="font-semibold text-purple-700 dark:text-purple-400 mb-2">
              Super Admin Only Content
            </h3>
            <SuperAdminOnly
              fallback={
                <p className="text-slate-500 italic">
                  Hidden - You are not a super admin
                </p>
              }
            >
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                <p className="text-purple-700 dark:text-purple-400">
                  👑 Super Admin privileges: Full system access, user
                  management, and global analytics.
                </p>
              </div>
            </SuperAdminOnly>
          </div>

          {/* Custom Role-Based Content */}
          <div className="p-4 border border-amber-200 dark:border-amber-800 rounded-lg">
            <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">
              Custom Role-Based Content (Admin + Super Admin)
            </h3>
            <RoleBasedFeatures
              allowedRoles={["admin", "super-admin"]}
              fallback={
                <p className="text-slate-500 italic">
                  Hidden - You need admin privileges
                </p>
              }
            >
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded">
                <p className="text-amber-700 dark:text-amber-400">
                  📊 Analytics Dashboard: Advanced reporting and system insights
                  available.
                </p>
              </div>
            </RoleBasedFeatures>
          </div>
        </div>
      </Card>

      {/* Action Buttons Based on Role */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
          Role-Based Action Buttons
        </h2>
        <div className="flex flex-wrap gap-4">
          {permissions.canUploadProjects && (
            <Button className="bg-green-600 hover:bg-green-700">
              <Upload className="w-4 h-4 mr-2" />
              Upload Project
            </Button>
          )}

          {permissions.canViewDashboard && (
            <Button className="bg-blue-600 hover:bg-blue-700">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Dashboard
            </Button>
          )}

          {permissions.canViewPendingProjects && (
            <Button className="bg-amber-600 hover:bg-amber-700">
              <FileText className="w-4 h-4 mr-2" />
              Pending Projects
            </Button>
          )}

          {permissions.canManageUsers && (
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Users className="w-4 h-4 mr-2" />
              Manage Users
            </Button>
          )}

          {permissions.canExportData && (
            <Button variant="outline">
              <FileDown className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          )}
        </div>
      </Card>

      {/* Navigation Test */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
          Navigation Access Test
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Available Routes:</h3>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Home (/)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Browse Projects (/browse)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Upload Project (/upload)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                My Profile (/profile)
              </li>
              {permissions.canViewPendingProjects && (
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Pending Projects (/pending)
                </li>
              )}
              {permissions.canViewDashboard && (
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Dashboard (/dashboard)
                </li>
              )}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Restricted Routes:</h3>
            <ul className="space-y-1 text-sm">
              {!permissions.canViewPendingProjects && (
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Pending Projects (/pending)
                </li>
              )}
              {!permissions.canViewDashboard && (
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Dashboard (/dashboard)
                </li>
              )}
              {!permissions.canManageUsers && (
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  User Management (Super Admin only)
                </li>
              )}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default RoleTestPage;
