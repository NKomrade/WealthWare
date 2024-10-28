import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import Layout from './components/shared/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';
import ExpenseTracking from './pages/Expense_Tracking';
import SalesReport from './pages/Sales_Report';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './Login';
import Forgotpassword from './Forgotpassword';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ProfileProvider } from './context/contextProfile';

// Protected route component to block unauthenticated users
function ProtectedRoute({ isAuthenticated, children }) {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Main App Component
function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Tracks auth state
    const [loading, setLoading] = useState(true); // Tracks loading state

    // Handle Firebase auth state change
    const handleAuthStateChange = useCallback((user) => {
        console.log("Auth state changed:", user); // Debug log
        setIsAuthenticated(!!user); // Set authentication status (true if user exists)
        setLoading(false); // Set loading to false once auth state is determined
    }, []);

    // Subscribe to Firebase authentication state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
        return () => unsubscribe(); // Cleanup subscription on component unmount
    }, [handleAuthStateChange]);

    // Show a loading screen while checking the authentication status
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <ProfileProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                    <Route path="/forgotpassword" element={<Forgotpassword />} />

                    {/* Protected Routes - only accessible if authenticated */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute isAuthenticated={isAuthenticated}>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Dashboard />} />
                        <Route path="inventory" element={<Inventory />} />
                        <Route path="invoices" element={<Invoices />} />
                        <Route path="expensetracking" element={<ExpenseTracking />} />
                        <Route path="salesreport" element={<SalesReport />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>

                    {/* Fallback Route */}
                    <Route
                        path="*"
                        element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
                    />
                </Routes>
            </Router>
        </ProfileProvider>
    );
}

export default App;