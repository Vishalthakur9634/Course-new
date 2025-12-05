import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import RoleSidebar from './components/RoleSidebar';
import Login from './pages/Login';
import Register from './pages/Register';

// Public Pages
import LandingPage from './pages/LandingPage';
import InstructorLandingPage from './pages/InstructorLandingPage';

// Student Pages
import Dashboard from './pages/Dashboard';
import CourseBrowse from './pages/student/CourseBrowse';
import InstructorList from './pages/student/InstructorList';
import MyInstructors from './pages/student/MyInstructors';
import Profile from './pages/Profile';
import InstructorProfile from './pages/InstructorProfile';
import MyLearning from './pages/MyLearning';
import Wishlist from './pages/Wishlist';
import Certificates from './pages/Certificates';
import Categories from './pages/Categories';
import CourseDetail from './pages/CourseDetail';
import StudentAnnouncements from './pages/student/StudentAnnouncements';

// Instructor Pages
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InstructorAdmin from './pages/instructor/InstructorAdmin';
import MyCourses from './pages/instructor/MyCourses';
import MyStudents from './pages/instructor/MyStudents';
import InstructorEarnings from './pages/instructor/InstructorEarnings';
import InstructorAnalytics from './pages/instructor/InstructorAnalytics';
import InstructorReviews from './pages/instructor/InstructorReviews';
import InstructorSettings from './pages/instructor/InstructorSettings';
import UploadCourse from './pages/instructor/UploadCourse';
import InstructorAnnouncements from './pages/instructor/InstructorAnnouncements';

// Admin Pages
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import CourseManagement from './pages/admin/CourseManagement';
import UserManagement from './pages/admin/UserManagement';
import InstructorApprovals from './pages/admin/InstructorApprovals';
import PaymentManagement from './pages/admin/PaymentManagement';
import AnnouncementManagement from './pages/admin/AnnouncementManagement';
import PlatformAnalytics from './pages/admin/PlatformAnalytics';
import PlatformSettings from './pages/admin/PlatformSettings';

// Shared Pages
import Notifications from './pages/Notifications';

// Placeholder
import ComingSoon from './components/ComingSoon';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

// Utility to parse JWT token
const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

const RoleRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    let userRole = '';

    // 1. Try to get role from token (Source of Truth)
    if (token) {
        const decoded = parseJwt(token);
        if (decoded && decoded.role) {
            userRole = decoded.role.toLowerCase();
        }
    }

    // 2. Fallback to localStorage user object if token decode fails
    if (!userRole) {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.role) {
                    userRole = user.role.toLowerCase();
                }
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
        }
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Normalize allowed roles
    const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());

    // Check access
    const hasAccess = normalizedAllowedRoles.includes(userRole);

    if (hasAccess) {
        return children;
    }

    console.log(`Access denied. User role: '${userRole}', Allowed: ${normalizedAllowedRoles.join(', ')}`);

    // Redirect logic based on actual role
    // Instead of auto-redirecting, show a "Not Authorized" screen to prevent loops and confusion
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-dark-bg text-white">
            <div className="bg-dark-layer1 p-8 rounded-lg border border-dark-layer2 max-w-md text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
                <p className="text-dark-muted mb-6">
                    You do not have permission to view this page.
                    <br />
                    Required Role: <span className="font-mono text-brand-primary">{normalizedAllowedRoles.join(', ')}</span>
                    <br />
                    Your Role: <span className="font-mono text-yellow-500">{userRole}</span>
                </p>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => window.history.back()}
                        className="px-4 py-2 bg-dark-layer2 hover:bg-dark-layer1 rounded transition-colors"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            window.location.href = '/login';
                        }}
                        className="px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded transition-colors"
                    >
                        Login with Different Account
                    </button>
                </div>
            </div>
        </div>
    );
};

// Public Route (Redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user.role === 'superadmin' || user.role === 'admin') {
                return <Navigate to="/admin" replace />;
            }
            if (user.role === 'instructor') {
                return <Navigate to="/instructor" replace />;
            }
            return <Navigate to="/dashboard" replace />;
        } catch (e) {
            // If parsing fails, allow access (will likely fail later or require re-login)
            return children;
        }
    }

    return children;
};

// Unified Layout with Sidebar for ALL users
const AppLayout = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) setUser(JSON.parse(userStr));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-dark-bg text-dark-text overflow-hidden">
            {user && <RoleSidebar user={user} onLogout={handleLogout} />}
            <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
    );
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
                <Route path="/instructor-home" element={<PublicRoute><InstructorLandingPage /></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/instructor/profile/:instructorId" element={<AppLayout><InstructorProfile /></AppLayout>} />

                {/* Student Routes */}
                <Route path="/dashboard" element={<PrivateRoute><RoleRoute allowedRoles={['student']}><AppLayout><Dashboard /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/browse" element={<PrivateRoute><RoleRoute allowedRoles={['student']}><AppLayout><CourseBrowse /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructors" element={<PrivateRoute><RoleRoute allowedRoles={['student']}><AppLayout><InstructorList /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/my-instructors" element={<PrivateRoute><RoleRoute allowedRoles={['student']}><AppLayout><MyInstructors /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><AppLayout><Profile /></AppLayout></PrivateRoute>} />
                <Route path="/my-learning" element={<PrivateRoute><RoleRoute allowedRoles={['student']}><AppLayout><MyLearning /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/wishlist" element={<PrivateRoute><RoleRoute allowedRoles={['student']}><AppLayout><Wishlist /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/announcements" element={<PrivateRoute><RoleRoute allowedRoles={['student']}><AppLayout><StudentAnnouncements /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/categories" element={<PrivateRoute><RoleRoute allowedRoles={['student']}><AppLayout><Categories /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/certificates" element={<PrivateRoute><AppLayout><Certificates /></AppLayout></PrivateRoute>} />
                <Route path="/course/:id" element={<PrivateRoute><AppLayout><CourseDetail /></AppLayout></PrivateRoute>} />

                {/* Instructor Routes */}
                <Route path="/instructor" element={<PrivateRoute><RoleRoute allowedRoles={['instructor']}><AppLayout><InstructorDashboard /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/admin" element={<PrivateRoute><RoleRoute allowedRoles={['instructor']}><AppLayout><InstructorAdmin /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/courses" element={<PrivateRoute><RoleRoute allowedRoles={['instructor']}><AppLayout><MyCourses /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/upload" element={<PrivateRoute><RoleRoute allowedRoles={['instructor']}><AppLayout><UploadCourse /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/announcements" element={<PrivateRoute><RoleRoute allowedRoles={['instructor']}><AppLayout><InstructorAnnouncements /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/edit-course/:id" element={<PrivateRoute><RoleRoute allowedRoles={['instructor', 'admin', 'superadmin']}><AppLayout><UploadCourse /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/students" element={<PrivateRoute><RoleRoute allowedRoles={['instructor']}><AppLayout><MyStudents /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/earnings" element={<PrivateRoute><RoleRoute allowedRoles={['instructor']}><AppLayout><InstructorEarnings /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/analytics" element={<PrivateRoute><RoleRoute allowedRoles={['instructor']}><AppLayout><InstructorAnalytics /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/reviews" element={<PrivateRoute><RoleRoute allowedRoles={['instructor']}><AppLayout><InstructorReviews /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/settings" element={<PrivateRoute><RoleRoute allowedRoles={['instructor']}><AppLayout><InstructorSettings /></AppLayout></RoleRoute></PrivateRoute>} />

                {/* Super Admin Routes */}
                <Route path="/admin" element={<PrivateRoute><RoleRoute allowedRoles={['superadmin', 'admin']}><AppLayout><SuperAdminDashboard /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/admin/users" element={<PrivateRoute><RoleRoute allowedRoles={['superadmin', 'admin']}><AppLayout><UserManagement /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/admin/courses" element={<PrivateRoute><RoleRoute allowedRoles={['superadmin', 'admin']}><AppLayout><CourseManagement /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/admin/instructors" element={<PrivateRoute><RoleRoute allowedRoles={['superadmin', 'admin']}><AppLayout><InstructorApprovals /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/admin/payments" element={<PrivateRoute><RoleRoute allowedRoles={['superadmin', 'admin']}><AppLayout><PaymentManagement /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/admin/announcements" element={<PrivateRoute><RoleRoute allowedRoles={['superadmin', 'admin']}><AppLayout><AnnouncementManagement /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/admin/analytics" element={<PrivateRoute><RoleRoute allowedRoles={['superadmin', 'admin']}><AppLayout><PlatformAnalytics /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/admin/settings" element={<PrivateRoute><RoleRoute allowedRoles={['superadmin', 'admin']}><AppLayout><PlatformSettings /></AppLayout></RoleRoute></PrivateRoute>} />

                {/* Shared Routes */}
                <Route path="/notifications" element={<PrivateRoute><AppLayout><Notifications /></AppLayout></PrivateRoute>} />
            </Routes>
        </Router>
    );
}

export default App;
