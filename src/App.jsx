import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Layout from './components/shared/Layout'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Invoices from './pages/Invoices'
import Expense_Tracking from './pages/Expense_Tracking'
import Sales_Report from './pages/Sales_Report'
import Login from './Login'

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    return (
        <Router>
            <Routes>
                {!isAuthenticated ? (
                    <Route path="*" element={<Navigate to="/login" />} /> 
                ) : (
                    <>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Dashboard />} />
                            <Route path="/inventory" element={<Inventory />} />
                            <Route path="/invoices" element={<Invoices />} />
                            <Route path="/expensetracking" element={<Expense_Tracking />} />
                            <Route path="/salesreport" element={<Sales_Report />} />
                        </Route>
                        <Route path="/register" element={<Register />} />
                    </>
                )}
                
                {/* Login route */}
                <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            </Routes>
        </Router>
    );
}

export default App