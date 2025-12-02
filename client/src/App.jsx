import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseDetail from './pages/CourseDetail';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import MyLearning from './pages/MyLearning';
import Wishlist from './pages/Wishlist';
import Categories from './pages/Categories';
import Certificates from './pages/Certificates';
import AdminTest from './pages/AdminTest';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    console.log('AdminRoute Check:', { userStr, user, role: user?.role });

    if (!user) {
        console.log('No user found, redirecting to login');
        return <Navigate to="/login" />;
    }

    if (user.role !== 'admin') {
        console.log('User is not admin, role:', user.role);
        return <Navigate to="/" />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-dark-bg text-dark-text">
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                        <Route path="/my-learning" element={<PrivateRoute><MyLearning /></PrivateRoute>} />
                        <Route path="/wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
                        <Route path="/categories" element={<PrivateRoute><Categories /></PrivateRoute>} />
                        <Route path="/certificates" element={<PrivateRoute><Certificates /></PrivateRoute>} />
                        <Route path="/course/:id" element={<PrivateRoute><CourseDetail /></PrivateRoute>} />
                        <Route path="/admin-test" element={<PrivateRoute><AdminTest /></PrivateRoute>} />
                        <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
