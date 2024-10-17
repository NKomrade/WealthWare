import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/shared/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';
import Expense_Tracking from './pages/Expense_Tracking';
import Sales_Report from './pages/Sales_Report';
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Login from './Login';
import Forgotpassword from './Forgotpassword';  

function ProtectedRoute({ isAuthenticated, children }) {
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    return children;
}

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <Router>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/forgotpassword" element={<Forgotpassword />} /> {/* Add ForgotPassword route */}
                
                {/* Protected routes */}
                <Route path="/" element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <Layout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Dashboard />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/invoices" element={<Invoices />} />
                    <Route path="/expensetracking" element={<Expense_Tracking />} />
                    <Route path="/salesreport" element={<Sales_Report />} />
                    <Route path="/profile" element={<Profile />} />
					<Route path="/settings" element={<Settings />} />
                </Route>

                {/* Fallback route */}
                <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
            </Routes>
        </Router>
    );
}
export default App;