import React, { useState, useEffect } from 'react';
import MissionBriefing from './pages/student/MissionBriefing';
import MissionControl from './pages/instructor/MissionControl';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import RoleSidebar from './components/RoleSidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';

// Public Pages
import LandingPage from './pages/LandingPage';
import InstructorLandingPage from './pages/InstructorLandingPage';
import Blog from './pages/Blog';
import ArticleDetail from './pages/ArticleDetail';

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
import StudentLiveSessions from './pages/student/StudentLiveSessions';
import MyNotes from './pages/student/MyNotes';
import PurchaseHistory from './pages/student/PurchaseHistory';
import StudentPublicProfile from './pages/student/StudentPublicProfile';
import MyReviews from './pages/student/MyReviews';
import StudentPractice from './pages/student/StudentPractice'; // [NEW]
import TakeAssessment from './pages/student/TakeAssessment'; // [NEW]
import Reels from './pages/student/Reels'; // [NEW]

// Futuristic Overhaul Pages [NEW]
import NeuralTutor from './pages/NeuralTutor';
import SkillTrees from './pages/SkillTrees';
import ResourceVault from './pages/ResourceVault';
import DiscoverSectors from './pages/DiscoverSectors';

// Instructor Pages
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InstructorAdmin from './pages/instructor/InstructorAdmin';
import MyCourses from './pages/instructor/MyCourses';
import MyStudents from './pages/instructor/MyStudents';
import InstructorEarnings from './pages/instructor/InstructorEarnings';
import InstructorAnalytics from './pages/instructor/InstructorAnalytics';
import InstructorReviews from './pages/instructor/InstructorReviews';
import InstructorSettings from './pages/instructor/InstructorSettings';
import EditCourse from './pages/instructor/EditCourse'; // [NEW]
import UploadCourse from './pages/instructor/UploadCourse';

// ... (previous imports)


import InstructorAnnouncements from './pages/instructor/InstructorAnnouncements';
import PromotionManagement from './pages/instructor/PromotionManagement';
import BundleManagement from './pages/instructor/BundleManagement';
import AssessmentManagement from './pages/instructor/AssessmentManagement';
import InstructorLiveManager from './pages/instructor/InstructorLiveManager';
import InstructorArticleManager from './pages/instructor/InstructorArticleManager';
import InstructorCertificates from './pages/instructor/InstructorCertificates';
import InstructorPractice from './pages/instructor/InstructorPractice'; // [NEW]

// Admin Pages
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import CourseManagement from './pages/admin/CourseManagement';
import UserManagement from './pages/admin/UserManagement';
import InstructorApprovals from './pages/admin/InstructorApprovals';
import PaymentManagement from './pages/admin/PaymentManagement';
import AnnouncementManagement from './pages/admin/AnnouncementManagement';
import PlatformAnalytics from './pages/admin/PlatformAnalytics';
import PlatformSettings from './pages/admin/PlatformSettings';
import SubscriptionManagement from './pages/admin/SubscriptionManagement';
import ContentManager from './pages/admin/ContentManager'; // [NEW]
import InstructorContentManager from './pages/instructor/InstructorContentManager'; // Enhanced for instructors

// Shared Pages
import Notifications from './pages/Notifications';
import HelpCenter from './pages/HelpCenter';
import CommunityHub from './pages/CommunityHub';
import ContactUs from './pages/ContactUs';
import Referral from './pages/Referral';
import SubscriptionPlans from './pages/SubscriptionPlans';
import CourseBundles from './pages/CourseBundles';
import TrendingHub from './pages/TrendingHub';
import YouTubeWatchPage from './pages/student/YouTubeWatchPage';
import SocialMedia from './pages/SocialMedia'; // [NEW]

// Student Specific
import Leaderboard from './pages/student/Leaderboard';
import DirectMessage from './pages/student/DirectMessage';

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
import MobileNav from './components/MobileNav';

import ResizablePanel from './components/ResizablePanel';
import CommandPalette from './components/CommandPalette';
import GlobalCreateButton from './components/GlobalCreateButton';

const AppLayout = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        return saved === 'true';
    });
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', isSidebarCollapsed);
    }, [isSidebarCollapsed]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
            }
            if (e.key === 'b' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsSidebarCollapsed(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

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
        <div className="flex flex-col h-screen bg-dark-bg text-dark-text overflow-hidden relative selection:bg-brand-primary selection:text-dark-bg">
            {/* Global Background Layer */}
            <div className="fixed inset-0 cyber-grid opacity-[0.03] pointer-events-none z-0" />

            <Navbar onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />
            <div className="h-[60px] md:h-[72px] flex-shrink-0" />
            <div className="flex flex-1 overflow-hidden min-h-0 relative z-10">
                {user && (
                    <ResizablePanel
                        position="left"
                        minWidth={240}
                        maxWidth={400}
                        defaultWidth={280}
                        isCollapsed={isSidebarCollapsed}
                        storageKey="main-sidebar-width"
                        className="hidden md:flex flex-col border-r border-white/5"
                    >
                        <RoleSidebar
                            user={user}
                            onLogout={handleLogout}
                            isCollapsed={isSidebarCollapsed}
                            setIsCollapsed={setIsSidebarCollapsed}
                        />
                    </ResizablePanel>
                )}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 flex flex-col min-h-0 custom-scrollbar relative">
                    {children}
                </main>
            </div>
            {user && <MobileNav user={user} />}
            {user && <GlobalCreateButton user={user} />}
            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
            />
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

                {/* Blog Routes */}
                <Route path="/blog" element={<AppLayout><Blog /></AppLayout>} />
                <Route path="/blog/:slug" element={<AppLayout><ArticleDetail /></AppLayout>} />

                {/* Public Profile (Accessible by anyone, but using AppLayout may show sidebar if logged in) */}
                <Route path="/u/:studentKey" element={<AppLayout><StudentPublicProfile /></AppLayout>} />

                {/* Student Routes */}
                <Route path="/dashboard" element={<PrivateRoute><RoleRoute allowedRoles={['student', 'instructor', 'superadmin']}><AppLayout><Dashboard /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/browse" element={<PrivateRoute><RoleRoute allowedRoles={['student', 'instructor', 'superadmin']}><AppLayout><CourseBrowse /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructors" element={<PrivateRoute><RoleRoute allowedRoles={['student', 'instructor', 'superadmin']}><AppLayout><InstructorList /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/my-instructors" element={<PrivateRoute><RoleRoute allowedRoles={['student', 'instructor', 'superadmin']}><AppLayout><MyInstructors /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><AppLayout><Profile /></AppLayout></PrivateRoute>} />
                <Route path="/profile/:userId" element={<AppLayout><Profile /></AppLayout>} />
                <Route path="/my-learning" element={<PrivateRoute><RoleRoute allowedRoles={['student', 'instructor', 'superadmin']}><AppLayout><MyLearning /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/wishlist" element={<PrivateRoute><RoleRoute allowedRoles={['student', 'instructor', 'superadmin']}><AppLayout><Wishlist /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/announcements" element={<PrivateRoute><RoleRoute allowedRoles={['student', 'instructor', 'superadmin']}><AppLayout><StudentAnnouncements /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/categories" element={<PrivateRoute><RoleRoute allowedRoles={['student', 'instructor', 'superadmin']}><AppLayout><Categories /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/certificates" element={<PrivateRoute><AppLayout><Certificates /></AppLayout></PrivateRoute>} />
                <Route path="/course/:id" element={<PrivateRoute><AppLayout><CourseDetail /></AppLayout></PrivateRoute>} />
                <Route path="/course/:id/watch" element={<PrivateRoute><AppLayout><YouTubeWatchPage /></AppLayout></PrivateRoute>} />
                <Route path="/live" element={<PrivateRoute><RoleRoute allowedRoles={['student', 'instructor', 'superadmin']}><AppLayout><StudentLiveSessions /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/my-notes" element={<PrivateRoute><RoleRoute allowedRoles={['student', 'instructor', 'superadmin']}><AppLayout><MyNotes /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/purchase-history" element={<PrivateRoute><RoleRoute allowedRoles={['student', 'instructor', 'superadmin']}><AppLayout><PurchaseHistory /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/my-reviews" element={<PrivateRoute><RoleRoute allowedRoles={['student', 'instructor', 'superadmin']}><AppLayout><MyReviews /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/practice" element={<PrivateRoute><RoleRoute allowedRoles={['student', 'instructor', 'superadmin']}><AppLayout><StudentPractice /></AppLayout></RoleRoute></PrivateRoute>} /> {/* [NEW] */}
                <Route path="/course/:id/assessment" element={<PrivateRoute><RoleRoute allowedRoles={['student', 'instructor', 'superadmin']}><AppLayout><TakeAssessment /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/assignments" element={<PrivateRoute><RoleRoute allowedRoles={['student', 'instructor', 'superadmin']}><AppLayout><MissionBriefing /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/reels" element={<PrivateRoute><Reels /></PrivateRoute>} /> {/* [NEW] */}

                {/* Instructor Routes */}
                <Route path="/instructor" element={<PrivateRoute><RoleRoute allowedRoles={['instructor']}><AppLayout><InstructorDashboard /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/admin" element={<PrivateRoute><RoleRoute allowedRoles={['instructor', 'superadmin']}><AppLayout><InstructorAdmin /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/courses" element={<PrivateRoute><RoleRoute allowedRoles={['instructor', 'superadmin']}><AppLayout><MyCourses /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/upload" element={<PrivateRoute><RoleRoute allowedRoles={['instructor', 'superadmin']}><AppLayout><UploadCourse /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/announcements" element={<PrivateRoute><RoleRoute allowedRoles={['instructor', 'superadmin']}><AppLayout><InstructorAnnouncements /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/edit-course/:id" element={<PrivateRoute><RoleRoute allowedRoles={['instructor', 'admin', 'superadmin']}><AppLayout><EditCourse /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/students" element={<PrivateRoute><RoleRoute allowedRoles={['instructor', 'superadmin']}><AppLayout><MyStudents /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/earnings" element={<PrivateRoute><RoleRoute allowedRoles={['instructor', 'superadmin']}><AppLayout><InstructorEarnings /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/analytics" element={<PrivateRoute><RoleRoute allowedRoles={['instructor', 'superadmin']}><AppLayout><InstructorAnalytics /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/promotions" element={<PrivateRoute><RoleRoute allowedRoles={['instructor', 'superadmin']}><AppLayout><PromotionManagement /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/bundles" element={<PrivateRoute><RoleRoute allowedRoles={['instructor', 'superadmin']}><AppLayout><BundleManagement /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/assessments" element={<PrivateRoute><RoleRoute allowedRoles={['instructor', 'superadmin']}><AppLayout><AssessmentManagement /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/assignments" element={<PrivateRoute><RoleRoute allowedRoles={['instructor', 'superadmin']}><AppLayout><MissionControl /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/reviews" element={<PrivateRoute><RoleRoute allowedRoles={['instructor', 'superadmin']}><AppLayout><InstructorReviews /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/settings" element={<PrivateRoute><RoleRoute allowedRoles={['instructor', 'superadmin']}><AppLayout><InstructorSettings /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/live" element={<PrivateRoute><RoleRoute allowedRoles={['instructor', 'superadmin']}><AppLayout><InstructorLiveManager /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/articles" element={<PrivateRoute><RoleRoute allowedRoles={['instructor', 'superadmin']}><AppLayout><InstructorArticleManager /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/certificates" element={<PrivateRoute><RoleRoute allowedRoles={['instructor', 'superadmin']}><AppLayout><InstructorCertificates /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/practice" element={<PrivateRoute><RoleRoute allowedRoles={['instructor', 'superadmin']}><AppLayout><InstructorPractice /></AppLayout></RoleRoute></PrivateRoute>} /> {/* [NEW] */}

                {/* Super Admin Routes */}
                <Route path="/admin" element={<PrivateRoute><RoleRoute allowedRoles={['superadmin', 'admin']}><AppLayout><SuperAdminDashboard /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/admin/users" element={<PrivateRoute><RoleRoute allowedRoles={['superadmin', 'admin']}><AppLayout><UserManagement /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/admin/courses" element={<PrivateRoute><RoleRoute allowedRoles={['superadmin', 'admin']}><AppLayout><CourseManagement /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/admin/instructors" element={<PrivateRoute><RoleRoute allowedRoles={['superadmin', 'admin']}><AppLayout><InstructorApprovals /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/admin/payments" element={<PrivateRoute><RoleRoute allowedRoles={['superadmin', 'admin']}><AppLayout><PaymentManagement /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/admin/subscriptions" element={<PrivateRoute><RoleRoute allowedRoles={['superadmin', 'admin']}><AppLayout><SubscriptionManagement /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/admin/announcements" element={<PrivateRoute><RoleRoute allowedRoles={['superadmin', 'admin']}><AppLayout><AnnouncementManagement /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/admin/analytics" element={<PrivateRoute><RoleRoute allowedRoles={['superadmin', 'admin']}><AppLayout><PlatformAnalytics /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/admin/settings" element={<PrivateRoute><RoleRoute allowedRoles={['superadmin', 'admin']}><AppLayout><PlatformSettings /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/admin/content" element={<PrivateRoute><RoleRoute allowedRoles={['superadmin', 'admin']}><AppLayout><ContentManager /></AppLayout></RoleRoute></PrivateRoute>} />
                <Route path="/instructor/content" element={<PrivateRoute><RoleRoute allowedRoles={['instructor', 'superadmin', 'admin']}><AppLayout><InstructorContentManager /></AppLayout></RoleRoute></PrivateRoute>} />

                {/* Shared Routes */}
                <Route path="/notifications" element={<PrivateRoute><AppLayout><Notifications /></AppLayout></PrivateRoute>} />
                <Route path="/help" element={<AppLayout><HelpCenter /></AppLayout>} />
                <Route path="/community" element={<AppLayout><CommunityHub /></AppLayout>} />
                <Route path="/leaderboard" element={<AppLayout><Leaderboard /></AppLayout>} />
                <Route path="/contact" element={<AppLayout><ContactUs /></AppLayout>} />
                <Route path="/referral" element={<AppLayout><Referral /></AppLayout>} />
                <Route path="/subscriptions" element={<AppLayout><SubscriptionPlans /></AppLayout>} />
                <Route path="/bundles" element={<AppLayout><CourseBundles /></AppLayout>} />
                <Route path="/social" element={<PrivateRoute><AppLayout><SocialMedia /></AppLayout></PrivateRoute>} />
                <Route path="/trending" element={<PrivateRoute><AppLayout><TrendingHub /></AppLayout></PrivateRoute>} />
                <Route path="/messages" element={<PrivateRoute><AppLayout><DirectMessage /></AppLayout></PrivateRoute>} />
                <Route path="/messages/:userId" element={<PrivateRoute><AppLayout><DirectMessage /></AppLayout></PrivateRoute>} />

                {/* Futuristic Routes [NEW] */}
                <Route path="/intelligent-tutor" element={<PrivateRoute><AppLayout><NeuralTutor /></AppLayout></PrivateRoute>} />
                <Route path="/skill-paths" element={<PrivateRoute><AppLayout><SkillTrees /></AppLayout></PrivateRoute>} />
                <Route path="/storage-vault" element={<PrivateRoute><AppLayout><ResourceVault /></AppLayout></PrivateRoute>} />
                <Route path="/discover-sectors" element={<PrivateRoute><AppLayout><DiscoverSectors /></AppLayout></PrivateRoute>} />
            </Routes>
        </Router>
    );
}

export default App;
