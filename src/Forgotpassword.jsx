import React, { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'; 
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

function Forgotpassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const db = getFirestore();
    const auth = getAuth();

    // Validate email
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Function to check if email exists in the database
    const checkEmailInDB = async (email) => {
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', email));
            const querySnapshot = await getDocs(q);

            // Check if any document contains the provided email
            return !querySnapshot.empty;
        } catch (error) {
            console.error("Error checking email: ", error);
            throw error;
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        try {
            const isEmailRegistered = await checkEmailInDB(email);
            if (!isEmailRegistered) {
                setError('No user found with this email address.');
                return;
            }

            // Send password reset email using Firebase Auth
            await sendPasswordResetEmail(auth, email);
            setMessage('Password reset link has been sent to your email.');
        } catch (error) {
            console.error("Error during password reset: ", error);
            setError(error.message || 'Failed to send password reset email. Please try again.');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
                <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
                    Forgot Password
                </h2>

                {step === 1 && (
                    <form onSubmit={handlePasswordReset} className="space-y-6">
                        <div className="flex flex-col">
                            <label htmlFor="email" className="text-sm font-medium text-gray-600">Email:</label>
                            <input
                                type="email"
                                id="email"
                                className="mt-2 p-3 border rounded-lg w-full focus:outline-none focus:border-blue-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter your registered email address"
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200">
                            Send Password Reset Link
                        </button>
                    </form>
                )}

                {message && (
                    <p className="text-green-600 text-center mt-4">{message}</p>
                )}

                {error && (
                    <p className="text-red-600 text-center mt-4">{error}</p>
                )}

                <button
                    className="mt-6 w-full bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition duration-200"
                    onClick={() => navigate('/login')}
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
}

export default Forgotpassword;