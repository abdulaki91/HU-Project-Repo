# Role-Based Features Testing Guide

This document outlines the role-based access control (RBAC) implementation and testing procedures for the Haramaya University Project Store.

## 🎭 User Roles Overview

### 1. Student (`student`)

**Primary Users**: University students uploading their projects
**Capabilities**:

- ✅ Upload new projects
- ✅ View and edit their own projects
- ✅ Browse approved projects from all departments
- ✅ Download approved project files
- ✅ Manage personal profile and settings
- ❌ Cannot approve/reject projects
- ❌ Cannot access admin dashboard
- ❌ Cannot manage other users

### 2. Admin (`admin`)

**Primary Users**: Department administrators and faculty
**Capabilities**:

- ✅ All student capabilities
- ✅ Review and approve/reject projects from their department
- ✅ Access admin dashboard with department-specific analytics
- ✅ View pending projects from their department
- ✅ Manage projects within their department
- ❌ Cannot manage users from other departments
- ❌ Cannot access super admin features

### 3. Super Admin (`super-admin`)

**Primary Users**: System administrators
**Capabilities**:

- ✅ All admin capabilities across all departments
- ✅ Full system dashboard with global analytics
- ✅ User management (create, edit, delete users)
- ✅ System configuration and settings
- ✅ Access to all projects regardless of department
- ✅ Feature/unfeature projects
- ✅ Export system data and reports

## 🔐 Authentication & Authorization Flow

### Authentication Process

1. User logs in with email/password
2. Backend validates credentials
3. JWT token issued with user role and department
4. Frontend stores token and fetches user profile
5. Role-based UI components render based on user.role

### Authorization Checks

- **Frontend**: UI components conditionally render based on user role
- **Backend**: API endpoints validate user permissions before processing
- **Route Guards**: Protect sensitive pages from unauthorized access

## 🧪 Testing Role-Based Features

### Manual Testing Steps

#### 1. Student Role Testing

```bash
# Test Account: student@test.com / password123
```

**Expected Behavior**:

- ✅ Can access: Home, Upload, Browse, Profile
- ❌ Cannot access: Dashboard, Pending Projects
- ✅ Sidebar shows: Home, Upload Project, Browse Projects, Profile
- ❌ Sidebar hides: Dashboard, Pending Projects

**Test Cases**:

1. Login as student
2. Verify sidebar navigation items
3. Try accessing `/dashboard` → Should redirect to `/unauthorized`
4. Try accessing `/pending` → Should redirect to `/unauthorized`
5. Upload a project → Should succeed
6. Edit own project → Should succeed
7. Try to approve project → Should not see approval options

#### 2. Admin Role Testing

```bash
# Test Account: admin@test.com / password123
```

**Expected Behavior**:

- ✅ Can access: All student features + Dashboard + Pending Projects
- ✅ Sidebar shows: All items including Dashboard and Pending Projects
- ✅ Can approve/reject projects from their department only

**Test Cases**:

1. Login as admin
2. Verify all navigation items are visible
3. Access `/dashboard` → Should show department-specific analytics
4. Access `/pending` → Should show projects from admin's department only
5. Approve/reject projects → Should work for department projects only
6. Try to manage users → Should not see user management options

#### 3. Super Admin Role Testing

```bash
# Test Account: superadmin@test.com / password123
```

**Expected Behavior**:

- ✅ Can access: All features across all departments
- ✅ Full system dashboard with global statistics
- ✅ User management capabilities

**Test Cases**:

1. Login as super admin
2. Verify all navigation items are visible
3. Access `/dashboard` → Should show global system analytics
4. Access `/pending` → Should show projects from all departments
5. Manage users → Should have full user management access
6. Feature/unfeature projects → Should work for any project

### Automated Testing

#### Component Tests

```javascript
// Test role-based component rendering
describe("RoleBasedFeatures", () => {
  it("shows admin content to admin users", () => {
    render(<AdminOnly>Admin Content</AdminOnly>, {
      user: { role: "admin" },
    });
    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });

  it("hides admin content from students", () => {
    render(<AdminOnly>Admin Content</AdminOnly>, {
      user: { role: "student" },
    });
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });
});
```

#### Route Protection Tests

```javascript
// Test route guards
describe("Route Protection", () => {
  it("redirects students from admin routes", () => {
    renderWithRouter("/dashboard", { user: { role: "student" } });
    expect(screen.getByText("Unauthorized")).toBeInTheDocument();
  });

  it("allows admins to access admin routes", () => {
    renderWithRouter("/dashboard", { user: { role: "admin" } });
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
```

## 🛠 Implementation Details

### Frontend Components

#### 1. Route Guards

```javascript
// RequireAdmin.jsx - Protects admin routes
export const RequireAdmin = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  if (!["admin", "super-admin"].includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};
```

#### 2. Role-Based Components

```javascript
// RoleBasedFeatures.jsx - Conditional rendering
export const AdminOnly = ({ children, fallback = null }) => (
  <RoleBasedFeatures
    allowedRoles={["admin", "super-admin"]}
    fallback={fallback}
  >
    {children}
  </RoleBasedFeatures>
);
```

#### 3. Permission Hooks

```javascript
// Custom hooks for permission checking
export const useUserPermissions = () => {
  const { user } = useAuth();

  return {
    canUploadProjects: user?.role === "student" || isAdmin,
    canApproveProjects: isAdmin || isSuperAdmin,
    canViewDashboard: isAdmin || isSuperAdmin,
    // ... more permissions
  };
};
```

### Backend Authorization

#### 1. Middleware

```javascript
// roleMiddleware.js - Server-side role checking
export const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        code: "INSUFFICIENT_PERMISSIONS",
      });
    }
    next();
  };
};
```

#### 2. Route Protection

```javascript
// Protected admin routes
router.get(
  "/admin/pending-projects",
  authenticateUser,
  roleMiddleware(["admin", "super-admin"]),
  getPendingProjects,
);
```

## 🐛 Common Issues & Solutions

### Issue 1: Role Check Inconsistency

**Problem**: Different role string formats (`super_admin` vs `super-admin`)
**Solution**: Standardize role strings across frontend and backend

### Issue 2: Route Access After Role Change

**Problem**: User can access restricted routes after role downgrade
**Solution**: Implement real-time role validation and token refresh

### Issue 3: UI Components Not Updating

**Problem**: Role-based components don't re-render after login
**Solution**: Ensure proper React Query cache invalidation

## 📋 Testing Checklist

### Pre-Deployment Checklist

- [ ] All role-based routes are properly protected
- [ ] Sidebar navigation shows correct items for each role
- [ ] API endpoints validate user permissions
- [ ] Error handling for unauthorized access
- [ ] Role-based components render correctly
- [ ] Permission hooks return accurate values
- [ ] Database queries respect role-based access
- [ ] File upload/download permissions work correctly
- [ ] Project approval workflow functions properly
- [ ] User management features are restricted to super admins

### User Acceptance Testing

- [ ] Students can upload and manage their projects
- [ ] Admins can review projects from their department
- [ ] Super admins have full system access
- [ ] Unauthorized users are properly redirected
- [ ] Role changes take effect immediately
- [ ] All features work across different browsers
- [ ] Mobile responsiveness maintained for all roles

## 🔧 Development Tools

### Role Testing Page

Access `/role-test` in development mode to see:

- Current user role and permissions
- Role-based component visibility
- Permission matrix
- Available navigation routes
- Interactive role testing

### Browser Developer Tools

```javascript
// Check current user in console
console.log("Current user:", window.__REACT_QUERY_STATE__);

// Manually test permissions
import { useUserPermissions } from "./hooks/useUserPermissions";
const permissions = useUserPermissions();
console.log("User permissions:", permissions);
```

## 📊 Monitoring & Analytics

### Role-Based Metrics

- User distribution by role
- Feature usage by role
- Access attempt failures
- Permission-related errors
- Role change frequency

### Security Monitoring

- Unauthorized access attempts
- Token validation failures
- Role escalation attempts
- Suspicious activity patterns

---

## 🚀 Quick Start Testing

1. **Setup Test Users**:

   ```sql
   -- Create test users with different roles
   INSERT INTO users (firstName, lastName, email, password, role, verified) VALUES
   ('Student', 'User', 'student@test.com', '$2a$10$hashedpassword', 'student', TRUE),
   ('Admin', 'User', 'admin@test.com', '$2a$10$hashedpassword', 'admin', TRUE),
   ('Super', 'Admin', 'superadmin@test.com', '$2a$10$hashedpassword', 'super-admin', TRUE);
   ```

2. **Run Application**:

   ```bash
   # Start backend
   cd Backend && npm run dev

   # Start frontend
   cd Frontend && npm run dev
   ```

3. **Test Each Role**:
   - Login with each test account
   - Navigate through available features
   - Verify role-based restrictions
   - Check error handling for unauthorized access

4. **Verify API Endpoints**:

   ```bash
   # Test with different user tokens
   curl -H "Authorization: Bearer $STUDENT_TOKEN" http://localhost:5000/api/project/admin/pending
   # Should return 403 Forbidden

   curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:5000/api/project/admin/pending
   # Should return pending projects
   ```

This comprehensive testing ensures that the role-based access control system works correctly and securely across all user types and features.
