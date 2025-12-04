import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import RoleSidebar from './components/RoleSidebar';
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import Dashboard from './pages/Dashboard';
import CourseBrowse from './pages/student/CourseBrowse';
import Profile from './pages/Profile';
import MyLearning from './pages/MyLearning';
import Wishlist from './pages/Wishlist';
import Certificates from './pages/Certificates';
import Categories from './pages/Categories';
import CourseDetail from './pages/CourseDetail';

// Instructor Pages
import InstructorDashboard from './pages/instructor/InstructorDashboard';

// Admin Pages
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';

// Placeholder
import ComingSoon from './components/ComingSoon';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

const RoleRoute = ({ children, allowedRoles }) => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user) return <Navigate to="/login" />;
    if (!allowedRoles.includes(user.role)) {
        if (user.role === 'superadmin') return <Navigate to="/admin" />;
        if (user.role === 'instructor') return <Navigate to="/instructor" />;
        return <Navigate to="/" />;
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
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Student Routes - WITH SIDEBAR */}
                <Route path="/" element={<PrivateRoute><RoleRoute allowedRoles={['student']}><AppLayout><Dashboard /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/browse" element={<PrivateRoute><RoleRoute allowedRoles={['student']}><AppLayout><CourseBrowse /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><AppLayout><Profile /></AppLayout></PrivateRoute>} />
                <Route path="/my-learning" element={<PrivateRoute><RoleRoute allowedRoles={['student']}><AppLayout><MyLearning /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/wishlist" element={<PrivateRoute><RoleRoute allowedRoles={['student']}><AppLayout><Wishlist /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/categories" element={<PrivateRoute><RoleRoute allowedRoles={['student']}><AppLayout><Categories /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/certificates" element={<PrivateRoute><AppLayout><Certificates /></AppLayout></PrivateRoute>} />
                <Route path="/course/:id" element={<PrivateRoute><AppLayout><CourseDetail /></AppLayout></PrivateRoute>} />

                {/* Instructor Routes - WITH SIDEBAR */}
                <Route path="/instructor" element={<PrivateRoute><RoleRoute allowedRoles={['instructor']}><AppLayout><InstructorDashboard /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/courses" element={<PrivateRoute><RoleRoute allowedRoles={['instructor']}><AppLayout><ComingSoon title="My Courses" /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/upload" element={<PrivateRoute><RoleRoute allowedRoles={['instructor']}><AppLayout><ComingSoon title="Upload Course" /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/students" element={<PrivateRoute><RoleRoute allowedRoles={['instructor']}><AppLayout><ComingSoon title="My Students" /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/earnings" element={<PrivateRoute><RoleRoute allowedRoles={['instructor']}><AppLayout><ComingSoon title="Earnings" /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/analytics" element={<PrivateRoute><RoleRoute allowedRoles={['instructor']}><AppLayout><ComingSoon title="Analytics" /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/reviews" element={<PrivateRoute><RoleRoute allowedRoles={['instructor']}><AppLayout><ComingSoon title="Reviews" /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/settings" element={<PrivateRoute><RoleRoute allowedRoles={['instructor']}><AppLayout><ComingSoon title="Settings" /></AppLayout></RoleRoute></PrivateRoute>} />

                {/* Super Admin Routes - WITH SIDEBAR */}
                <Route path="/admin" element={<PrivateRoute><RoleRoute allowedRoles={['superadmin', 'admin']}><AppLayout><SuperAdminDashboard /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/admin/users" element={<PrivateRoute><RoleRoute allowedRoles={['superadmin', 'admin']}><AppLayout><ComingSoon title="User Management" /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/admin/courses" element={<PrivateRoute><RoleRoute allowedRoles={['superadmin', 'admin']}><AppLayout><ComingSoon title="Course Management" /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/admin/instructors" element={<PrivateRoute><RoleRoute allowedRoles={['superadmin', 'admin']}><AppLayout><ComingSoon title="Instructor Approvals" /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/admin/payments" element={<PrivateRoute><RoleRoute allowedRoles={['superadmin', 'admin']}><AppLayout><ComingSoon title="Payments & Payouts" /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/admin/announcements" element={<PrivateRoute><RoleRoute allowedRoles={['superadmin', 'admin']}><AppLayout><ComingSoon title="Announcements" /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/admin/analytics" element={<PrivateRoute><RoleRoute allowedRoles={['superadmin', 'admin']}><AppLayout><ComingSoon title="Platform Analytics" /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/admin/settings" element={<PrivateRoute><RoleRoute allowedRoles={['superadmin', 'admin']}><AppLayout><ComingSoon title="Platform Settings" /></AppLayout></RoleRoute></PrivateRoute>} />
            </Routes>
        </Router>
    );
}

export default App;
