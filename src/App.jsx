// Import necessary libraries and components
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

// Custom hook for handling authentication redirection
function useAuthRedirect(isAuthenticated) {
    const location = useLocation();
    
    useEffect(() => {
        if (!isAuthenticated && location.pathname !== '/login') {
            console.log("Redirecting unauthenticated user to login..."); // Debugging
            return <Navigate to="/login" replace />;
        }
    }, [isAuthenticated, location]);
}

// Protected route component to guard private routes
function ProtectedRoute({ isAuthenticated, children }) {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Main App Component
function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Callback to handle authentication state change
    const handleAuthStateChange = useCallback((user) => {
        console.log("Auth state changed:", user); // Debugging
        setIsAuthenticated(!!user);
        setLoading(false);
    }, []);

    // Subscribe to Firebase auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
        return () => unsubscribe();
    }, [handleAuthStateChange]);

    if (loading) {
        return <div>Loading...</div>; 
    }

    return (
        <ProfileProvider>
            <Router>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                    <Route path="/forgotpassword" element={<Forgotpassword />} />

                    {/* Protected routes under Layout */}
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

                    {/* Fallback route for undefined paths */}
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
