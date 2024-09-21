import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Layout from './components/shared/Layout'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Invoices from './pages/Invoices'
import Orders from './pages/Orders'
import Customers from './pages/Customers'
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
                            <Route path="/products" element={<Products />} />
                            <Route path="/invoices" element={<Invoices />} />
                            <Route path="/orders" element={<Orders />} />
                            <Route path="/customers" element={<Customers />} />
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
