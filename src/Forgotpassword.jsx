// src/pages/ForgotPassword.js
import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';  // Adjusted path to firebase config
import { useNavigate } from 'react-router-dom';  // Import useNavigate for navigation

function Forgotpassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();  // Initialize useNavigate

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setMessage(''); // Reset the message before a new attempt
        setError('');   // Reset the error before a new attempt
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Password reset email sent! Check your inbox.');
            // Automatically navigate to login after a successful password reset
            setTimeout(() => navigate('/login'), 3000);  // Redirect after 3 seconds
        } catch (error) {
            setError('Failed to send reset email. Please check your email and try again.');
            console.error(error);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
                <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">Forgot Password</h2>
                <form onSubmit={handleForgotPassword} className="space-y-6">
                    <div className="flex flex-col">
                        <label htmlFor="email" className="text-sm font-medium text-gray-600">Email:</label>
                        <input 
                            type="email" 
                            id="email" 
                            className="mt-2 p-3 border rounded-lg w-full focus:outline-none focus:border-blue-500" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            placeholder="Enter your registered email"
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200">
                        Send Reset Link
                    </button>
                </form>

                {/* Success or Error messages */}
                {message && (
                    <p className="text-green-600 text-center mt-4">{message}</p>
                )}
                {error && (
                    <p className="text-red-600 text-center mt-4">{error}</p>
                )}

                {/* Back button */}
                <button 
                    className="mt-6 w-full bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition duration-200"
                    onClick={() => navigate('/login')}  // Navigate back to login
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
}

export default Forgotpassword;