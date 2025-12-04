import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Users, Search, Shield, Ban, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/admin/users');
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/admin/users/${userId}/role`, { role: newRole });
            await fetchUsers();
            alert('User role updated successfully!');
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Failed to update user role');
        }
    };

    const handleBanToggle = async (userId, currentBanStatus) => {
        try {
            await api.put(`/admin/users/${userId}/ban`, {
                isBanned: !currentBanStatus,
                banReason: !currentBanStatus ? 'Violated platform policies' : ''
            });
            await fetchUsers();
            alert(`User ${!currentBanStatus ? 'banned' : 'unbanned'} successfully!`);
        } catch (error) {
            console.error('Error toggling ban status:', error);
            alert('Failed to update ban status');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;

        try {
            await api.delete(`/admin/users/${userId}`);
            await fetchUsers();
            alert('User deleted successfully!');
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const getRoleColor = (role) => {
        switch (role) {
            case 'superadmin': return 'bg-red-500/20 text-red-400';
            case 'admin': return 'bg-orange-500/20 text-orange-400';
            case 'instructor': return 'bg-purple-500/20 text-purple-400';
            case 'student': return 'bg-blue-500/20 text-blue-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    if (loading) {
        return <div className="text-center mt-10 text-white">Loading users...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">User Management</h1>
                <div className="flex items-center gap-2 text-dark-muted">
                    <Users size={20} />
                    <span>{filteredUsers.length} users</span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted" size={20} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-dark-layer1 border border-dark-layer2 rounded-lg py-3 pl-10 pr-4 text-white focus:border-brand-primary focus:outline-none"
                    />
                </div>
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="bg-dark-layer1 border border-dark-layer2 rounded-lg px-4 py-3 text-white focus:border-brand-primary focus:outline-none"
                >
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="instructor">Instructors</option>
                    <option value="admin">Admins</option>
                    <option value="superadmin">Super Admins</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="bg-dark-layer1 rounded-lg border border-dark-layer2 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-dark-layer2">
                        <tr>
                            <th className="text-left p-4 text-dark-muted font-medium">User</th>
                            <th className="text-left p-4 text-dark-muted font-medium">Role</th>
                            <th className="text-left p-4 text-dark-muted font-medium">Status</th>
                            <th className="text-left p-4 text-dark-muted font-medium">Joined</th>
                            <th className="text-left p-4 text-dark-muted font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user._id} className="border-t border-dark-layer2 hover:bg-dark-layer2 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                            <span className="text-white font-bold">{user.name.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{user.name}</p>
                                            <p className="text-sm text-dark-muted">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)} bg-transparent border-0 cursor-pointer`}
                                    >
                                        <option value="student">Student</option>
                                        <option value="instructor">Instructor</option>
                                        <option value="admin">Admin</option>
                                        <option value="superadmin">Super Admin</option>
                                    </select>
                                </td>
                                <td className="p-4">
                                    {user.isBanned ? (
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 flex items-center gap-1 w-fit">
                                            <XCircle size={14} /> Banned
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 flex items-center gap-1 w-fit">
                                            <CheckCircle size={14} /> Active
                                        </span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <p className="text-white text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleBanToggle(user._id, user.isBanned)}
                                            className={`p-2 rounded transition-colors ${user.isBanned
                                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                }`}
                                            title={user.isBanned ? 'Unban User' : 'Ban User'}
                                        >
                                            <Ban size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user._id)}
                                            className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                                            title="Delete User"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center text-dark-muted py-10">
                    No users found matching your criteria.
                </div>
            )}
        </div>
    );
};

export default UserManagement;
