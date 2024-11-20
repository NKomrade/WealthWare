import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import Layout from './components/shared/Layout';
import Homepage from './pages/HomePage';
import About from './pages/About';
import Contact from './pages/Contact';
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

// Protected Route to block unauthenticated users
function ProtectedRoute({ isAuthenticated, redirectTo = "/login", children }) {
    if (!isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }
    return children;
}

// Main App Component
function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Auth state
    const [loading, setLoading] = useState(true); // Loading state

    // Firebase auth state change listener
    const handleAuthStateChange = useCallback((user) => {
        console.log("Auth state changed:", user);
        setIsAuthenticated(!!user); // User exists -> true, else -> false
        setLoading(false); // Auth state determined
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
        return () => unsubscribe(); // Cleanup subscription on unmount
    }, [handleAuthStateChange]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <ProfileProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Homepage />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                    <Route path="/forgotpassword" element={<Forgotpassword />} />

                    {/* Protected Routes */}
                    <Route
                        path="/dashboard/*"
                        element={
                            <ProtectedRoute isAuthenticated={isAuthenticated}>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="" element={<Dashboard />} />
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
                        element={<Navigate to="/" replace />}
                    />
                </Routes>
            </Router>
        </ProfileProvider>
    );
}

export default App;