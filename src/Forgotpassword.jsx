import React, { useState } from 'react';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider } from 'firebase/auth'; 
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

function Forgotpassword() {
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [verificationId, setVerificationId] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const db = getFirestore();
    const auth = getAuth();

    const validatePhone = (phone) => {
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone);
    };

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
                size: 'invisible',
                callback: (response) => {
                    console.log('Recaptcha resolved');
                },
            }, auth);
        }
    };

    // Updated function to check phone number in database
    const checkPhoneNumberInDB = async (phoneNumber) => {
        try {
            const usersRef = collection(db, 'users');
            const formattedPhone = `+1${phoneNumber}`; // Add country code if needed
    
            // Fetch all user documents in the 'users' collection
            const usersSnapshot = await getDocs(usersRef);
            
            // Check if any document contains the provided phone number
            const isRegistered = usersSnapshot.docs.some(doc => {
                const userPhone = doc.data().phone; // Assuming phone is stored in 'phone' field
                return userPhone === phone || userPhone === formattedPhone;
            });
    
            return isRegistered;
        } catch (error) {
            console.error("Error checking phone number: ", error);
            throw error;
        }
    };    

    const sendVerificationCode = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!validatePhone(phone)) {
            setError('Please enter a valid 10-digit phone number.');
            return;
        }

        try {
            const isPhoneRegistered = await checkPhoneNumberInDB(phone);
            if (!isPhoneRegistered) {
                setError('Phone number is not registered.');
                return;
            }

            setupRecaptcha();
            const confirmationResult = await signInWithPhoneNumber(auth, `+1${phone}`, window.recaptchaVerifier);
            setVerificationId(confirmationResult.verificationId);
            setMessage('Verification code sent successfully!');
            setStep(2);
        } catch (error) {
            console.error("Error during verification: ", error);
            setError(error.message || 'Failed to send verification code. Please try again.');
        }
    };

    // Rest of the component remains the same
    const verifyCode = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!verificationId || !code) {
            setError('Invalid verification code.');
            return;
        }

        try {
            const credential = PhoneAuthProvider.credential(verificationId, code);
            await auth.signInWithCredential(credential);
            setMessage('OTP verified successfully.');
            setStep(3);
        } catch (error) {
            setError('Invalid OTP.');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!newPassword || newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        try {
            const user = auth.currentUser;
            await user.updatePassword(newPassword);
            setMessage('Password updated successfully.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            setError(`Failed to update password: ${error.message}`);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
                <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
                    {step === 1 ? 'Forgot Password' : step === 2 ? 'Enter OTP' : 'Reset Password'}
                </h2>

                {step === 1 && (
                    <form onSubmit={sendVerificationCode} className="space-y-6">
                        <div className="flex flex-col">
                            <label htmlFor="phone" className="text-sm font-medium text-gray-600">Phone Number:</label>
                            <input
                                type="tel"
                                id="phone"
                                className="mt-2 p-3 border rounded-lg w-full focus:outline-none focus:border-blue-500"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                placeholder="Enter your registered phone number"
                            />
                        </div>
                        <div id="recaptcha-container"></div>
                        <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200">
                            Send Verification Code
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={verifyCode} className="space-y-6">
                        <div className="flex flex-col">
                            <label htmlFor="code" className="text-sm font-medium text-gray-600">OTP:</label>
                            <input
                                type="text"
                                id="code"
                                className="mt-2 p-3 border rounded-lg w-full focus:outline-none focus:border-blue-500"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                                placeholder="Enter the OTP"
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200">
                            Verify OTP
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div className="flex flex-col">
                            <label htmlFor="newPassword" className="text-sm font-medium text-gray-600">New Password:</label>
                            <input
                                type="password"
                                id="newPassword"
                                className="mt-2 p-3 border rounded-lg w-full focus:outline-none focus:border-blue-500"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                placeholder="Enter new password"
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200">
                            Reset Password
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
