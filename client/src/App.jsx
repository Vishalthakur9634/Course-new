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

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    // Temporarily allow all logged-in users to access admin
    return token ? children : <Navigate to="/login" />;
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
                        <Route path="/course/:id" element={<PrivateRoute><CourseDetail /></PrivateRoute>} />
                        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
