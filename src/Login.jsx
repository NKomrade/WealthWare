import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase'; 
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification
} from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

const Login = ({ setIsAuthenticated }) => {
  const name = useRef();
  const email = useRef();
  const password = useRef();
  const phone = useRef(); 
  const shopname = useRef();
  const shoplogo = useRef();
  const typeofshop = useRef();
  const [showHome, setShowHome] = useState(false);
  const [show, setShow] = useState(true);
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [showPasswordRegister, setShowPasswordRegister] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const localSignUp = localStorage.getItem('signUp');
    if (localSignUp) {
      setShowHome(true);
    }
  }, []);

  const handleClick = async (e) => {
    e.preventDefault();
  
    if (
      !show &&
      name.current.value &&
      email.current.value &&
      password.current.value &&
      phone.current.value &&  
      shopname.current.value &&
      typeofshop.current.value &&
      shoplogo.current.files.length > 0
    ) {
      try {
        // Create user with email and password in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email.current.value, password.current.value);
        const user = userCredential.user;

        // Send verification email
        await sendEmailVerification(user);
        alert('Verification email sent! Please check your inbox and verify your email before logging in.');
  
        // Upload the shop logo to Firebase Storage
        const file = shoplogo.current.files[0];
        const storage = getStorage();
        const storageRef = ref(storage, `shoplogos/${user.uid}/${file.name}`);
  
        await uploadBytes(storageRef, file);
        console.log('File uploaded successfully');
  
        const downloadURL = await getDownloadURL(storageRef);
        console.log('File available at', downloadURL);
  
        // Format phone number with +1 prefix
        const formattedPhone = `${phone.current.value}`;

        await setDoc(doc(db, 'users', user.uid), {
          name: name.current.value,
          email: email.current.value,
          phone: formattedPhone,  
          shopname: shopname.current.value,
          typeofshop: typeofshop.current.value,
          shoplogo: downloadURL,
          createdAt: new Date().toISOString(),
        });
  
        navigate('/login');
        loginLink();
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error: ' + error.message);
      }
    } else {
      alert('Please fill all fields in the registration form.');
    }
  };  

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.current.value,
        password.current.value
      );
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        alert('Please verify your email before logging in.');
        return;
      }

      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      alert('User not Found or email not verified.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      alert('Error logging out: ' + error.message);
    }
  };

  const registerLink = () => {
    setShow(false);
  };

  const loginLink = () => {
    setShow(true);
  };

  // Optional: Function to resend verification email
  const resendVerificationEmail = async () => {
    try {
      const user = auth.currentUser;
      if (user && !user.emailVerified) {
        await sendEmailVerification(user);
        alert('Verification email resent! Please check your inbox.');
      } else {
        alert('User is already verified or not logged in.');
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen relative">
      {show && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/login.jpg)` }}
        ></div>
      )}
      {!show && (
        <img
          src={`${process.env.PUBLIC_URL}/signup.jpg`}
          alt="Signup Background"
          className="absolute left-0 top-0 w-1/2 h-full object-cover"
        />
      )}

      {showHome ? (
        <div className="flex flex-col items-center z-10 relative">
          <h1 className="text-2xl font-bold">Welcome Back!</h1>
          <button
            onClick={handleLogout}
            className="mt-4 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className={`w-96 p-9 bg-white rounded-lg z-10 ${!show ? 'ml-96' : ''}`}>
          {show ? (
            <div className="form-box login">
              <form>
                <h1 className="text-2xl font-bold mb-4 text-center">
                  Login to your account
                </h1>
                <div className="input-box mb-4">
                  <input
                    type="text"
                    placeholder="Email"
                    required
                    ref={email}
                    className="border border-neutral-500 rounded-lg p-2 w-full"
                  />
                </div>
                <div className="input-box mb-4 relative">
                  <input
                    type={showPasswordLogin ? 'text' : 'password'}
                    placeholder="Password"
                    required
                    ref={password}
                    className="border border-neutral-500 rounded-lg p-2 w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordLogin(!showPasswordLogin)}
                    className="absolute right-2 top-2"
                  >
                    {showPasswordLogin ? (
                      <AiOutlineEyeInvisible size={24} />
                    ) : (
                      <AiOutlineEye size={24} />
                    )}
                  </button>
                </div>
                <div className="remember-forgot flex justify-between mb-4">
                  <label>
                    <input type="checkbox" /> Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/forgotpassword')}
                    className="text-blue-500 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <button
                  onClick={handleSignIn}
                  className="w-full bg-blue-900 text-white p-2 rounded-lg hover:bg-blue-600"
                >
                  Login
                </button>
                <div className="register-link text-center mt-4">
                  <p>
                    Don't Have An Account?{' '}
                    <button
                      type="button"
                      onClick={registerLink}
                      className="text-blue-500 hover:underline"
                    >
                      Register
                    </button>
                  </p>
                  <button
                    onClick={resendVerificationEmail}
                    className="text-blue-500 hover:underline mt-2"
                  >
                    Resend Verification Email
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex relative w-full left-20">
              <form className="relative left-20">
                <h1 className="text-2xl font-bold mb-4">Create an account</h1>
                <div className="input-box mb-4">
                  <label htmlFor="username" className="block text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="Enter name"
                    required
                    ref={name}
                    className="border border-neutral-500 rounded-lg p-2 w-full"
                  />
                </div>
                <div className="input-box mb-4">
                  <label htmlFor="email" className="block text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="person@gmail.com"
                    required
                    ref={email}
                    className="border border-neutral-500 rounded-lg p-2 w-full"
                  />
                </div>
                <div className="input-box mb-4 relative">
                  <label htmlFor="password" className="block text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type={showPasswordRegister ? 'text' : 'password'}
                    placeholder="Enter password"
                    required
                    ref={password}
                    className="border border-neutral-500 rounded-lg p-2 w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordRegister(!showPasswordRegister)}
                    className="absolute right-2 top-8"
                  >
                    {showPasswordRegister ? (
                      <AiOutlineEyeInvisible size={24} />
                    ) : (
                      <AiOutlineEye size={24} />
                    )}
                  </button>
                </div>
                <div className="input-box mb-4">
                  <label htmlFor="phone" className="block text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="1234567890"
                    required
                    ref={phone}
                    className="border border-neutral-500 rounded-lg p-2 w-full"
                  />
                </div>
                <div className="input-box mb-4">
                  <label htmlFor="shopname" className="block text-gray-700 mb-1">
                    Shop Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter shop name"
                    required
                    ref={shopname}
                    className="border border-neutral-500 rounded-lg p-2 w-full"
                  />
                </div>
                <div className='input-box mb-4'>
                  <label htmlFor="typeofshop" className="block text-gray-700 mb-1">Type of shop</label>
                  <select ref={typeofshop} className="border border-neutral-500 rounded-lg p-2 w-full" required>
                    <option value="">--Select type of shop--</option>
                    <option value="Franchise">Franchise</option>
                    <option value="Tea Stall">Tea Stall</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Florist">Florist</option>
                    <option value="Auto Parts">Auto Parts</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Cafe">Cafe</option>
                    <option value="Auto Repair">Auto Repair</option>
                    <option value="Paan Shop">Paan Shop</option>
                    <option value="Vegetable Shop">Vegetable Shop</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Jewelry">Jewelry</option>
                    <option value="Cycle Repair Shop">Cycle Repair Shop</option>
                    <option value="Sweet Shop">Sweet Shop</option>
                    <option value="Pet Shop">Pet Shop</option>
                    <option value="Furniture Store">Furniture Store</option>
                    <option value="Dry Cleaner">Dry Cleaner</option>
                    <option value="Gym">Gym</option>
                    <option value="Stationery Shop">Stationery Shop</option>
                    <option value="Convenience Shop">Convenience Shop</option>
                    <option value="Mobile Repair Shop">Mobile Repair Shop</option>
                    <option value="Electronics Shop">Electronics Shop</option>
                    <option value="Salon">Salon</option>
                    <option value="Tailor">Tailor</option>
                    <option value="Electronics Repair Shop">Electronics Repair Shop</option>
                    <option value="Spare Parts Dealer">Spare Parts Dealer</option>
                    <option value="Photo Studio">Photo Studio</option>
                    <option value="Toy Shop">Toy Shop</option>
                    <option value="Bicycle Shop">Bicycle Shop</option>
                    <option value="Textile Shop">Textile Shop</option>
                  </select>
                </div>
                <div className="input-box mb-4">
                  <label htmlFor="shoplogo" className="block text-gray-700 mb-1">
                    Shop Logo
                  </label>
                  <input
                    type="file"
                    required
                    ref={shoplogo}
                    className="rounded-lg p-2 w-full"
                  />
                </div>
                <button
                  onClick={handleClick}
                  className="w-full bg-blue-900 text-white p-2 rounded-lg hover:bg-blue-600"
                >
                  Register
                </button>
                <div className="login-link text-center mt-4">
                  <p>
                    Already Have An Account?{' '}
                    <button
                      type="button"
                      onClick={loginLink}
                      className="text-blue-500 hover:underline"
                    >
                      Login
                    </button>
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Login;