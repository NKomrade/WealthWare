import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/shared/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';
import Expense_Tracking from './pages/Expense_Tracking';
import Sales_Report from './pages/Sales_Report';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './Login';
import Forgotpassword from './Forgotpassword';  
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ProfileProvider } from './context/contextProfile';

// Protected route component
function ProtectedRoute({ isAuthenticated, children }) {
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    return children;
}

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Persist authentication status using Firebase onAuthStateChanged
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user); // Set to true if user exists, false otherwise
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return (
        <ProfileProvider>
            <Router>
                <Routes>
                    {/* Public routes */}
                    <Route 
                        path="/login" 
                        element={<Login setIsAuthenticated={setIsAuthenticated} />} 
                    />
                    <Route path="/forgotpassword" element={<Forgotpassword />} />

                    {/* Protected routes */}
                    <Route 
                        path="/" 
                        element={
                            <ProtectedRoute isAuthenticated={isAuthenticated}>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        {/* Nested routes inside the layout */}
                        <Route index element={<Dashboard />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/invoices" element={<Invoices />} />
                        <Route path="/expensetracking" element={<Expense_Tracking />} />
                        <Route path="/salesreport" element={<Sales_Report />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<Settings />} />
                    </Route>

                    {/* Fallback route */}
                    <Route 
                        path="*" 
                        element={
                            <Navigate to={isAuthenticated ? "/" : "/login"} />
                        } 
                    />
                </Routes>
            </Router>
        </ProfileProvider>
    );
}

export default App;