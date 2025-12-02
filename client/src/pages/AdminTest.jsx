import React, { useEffect } from 'react';

const AdminTest = () => {
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        console.log('=== ADMIN TEST DEBUG ===');
        console.log('Raw user string:', userStr);
        console.log('Parsed user:', user);
        console.log('User role:', user?.role);
        console.log('Is admin?:', user?.role === 'admin');
        console.log('=======================');
    }, []);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Admin Access Test</h1>

            <div className="bg-dark-layer1 p-6 rounded-lg space-y-4">
                <div>
                    <strong>User Data:</strong>
                    <pre className="mt-2 bg-dark-layer2 p-4 rounded overflow-auto">
                        {userStr || 'No user data in localStorage'}
                    </pre>
                </div>

                <div>
                    <strong>Role Check:</strong>
                    <p className={`mt-2 p-3 rounded ${user?.role === 'admin' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                        {user?.role === 'admin' ? '✓ IS ADMIN' : `✗ NOT ADMIN (role: ${user?.role || 'undefined'})`}
                    </p>
                </div>

                <div>
                    <strong>Instructions:</strong>
                    <ol className="mt-2 list-decimal list-inside space-y-1">
                        <li>Open browser console (F12)</li>
                        <li>Run: <code className="bg-dark-layer2 px-2 py-1 rounded">localStorage.clear()</code></li>
                        <li>Go to /login</li>
                        <li>Login with admin credentials</li>
                        <li>Come back to /admin-test</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default AdminTest;
