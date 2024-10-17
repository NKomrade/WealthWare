import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase'; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth"; // Import GoogleAuthProvider
import { setDoc, doc } from "firebase/firestore";
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { FcGoogle } from 'react-icons/fc';

export const Login = ({ setIsAuthenticated }) => {
  const name = useRef();
  const email = useRef();
  const password = useRef();
  const shopname = useRef();
  const shoplogo = useRef();
  const typeofshop = useRef();
  const [showHome, setShowHome] = useState(false);
  const [show, setShow] = useState(true); 
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [showPasswordRegister, setShowPasswordRegister] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const localSignUp = localStorage.getItem("signUp");
    if (localSignUp) {
      setShowHome(true);
    }
  }, []);

  const handleClick = async (e) => {
    e.preventDefault();
    if (!show && name.current.value && email.current.value && password.current.value && shopname.current.value && typeofshop.current.value) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.current.value, password.current.value);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          name: name.current.value,
          email: email.current.value,
          shopname: shopname.current.value,
          typeofshop: typeofshop.current.value
        });

        alert("Account created successfully!!");
        loginLink(); 
      } catch (error) {
        alert(error.message);
      }
    } else {
      alert("Please fill all fields in the registration form.");
    }
  };    

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {    
      const userCredential = await signInWithEmailAndPassword(auth, email.current.value, password.current.value);
      const user = userCredential.user;  

      setIsAuthenticated(true); 
      navigate("/"); 
    } catch (error) {
      alert("User not Found!");
    }
  };

  // Google Sign-in function
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setIsAuthenticated(true); 
      navigate("/");
    } catch (error) {
      alert("Error signing in with Google: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); 
      setIsAuthenticated(false); 
      navigate('/login'); 
    } catch (error) {
      alert("Error logging out: " + error.message);
    }
  };

  const registerLink = () => {
    setShow(false); 
  };

  const loginLink = () => {
    setShow(true); 
  };

  return (
    <div className="flex items-center justify-center min-h-screen relative">
      {show && (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/login.jpg)` }}></div>
      )}
      {!show && (
        <img 
          src={`${process.env.PUBLIC_URL}/signup.jpg`} 
          alt="Signup Background" 
          className="absolute left-0 top-0 w-720 h-full object-cover w-1/2" 
        />
      )}
  
      {showHome ? (
        <div className="flex flex-col items-center z-10 relative">
          <h1 className="text-2xl font-bold">Welcome Back!</h1>
          <button onClick={handleLogout} className="mt-4 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600">
            Logout
          </button>
        </div>
      ) : (
        <div className={`w-96 p-9 bg-white rounded-lg z-10 ${!show ? "ml-96" : ""}`}>
          {show ? (
            <div className="form-box login">
              <form>
                <h1 className="text-2xl font-bold mb-4 text-center">Login to your account</h1>
                <div className='input-box mb-4'>
                  <input type="text" placeholder='Email' required ref={email} className="border rounded-lg p-2 w-full" />
                </div>
                <div className='input-box mb-4 relative'>
                  <input
                    type={showPasswordLogin ? "text" : "password"}
                    placeholder='Password'
                    required
                    ref={password}
                    className="border rounded-lg p-2 w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordLogin(!showPasswordLogin)}
                    className="absolute right-2 top-2"
                  >
                    {showPasswordLogin ? <AiOutlineEyeInvisible size={24} /> : <AiOutlineEye size={24} />}
                  </button>
                </div>
                <div className="remember-forgot flex justify-between mb-4">
                  <label><input type="checkbox" /> Remember me</label>
                  <button
                    type="button"
                    onClick={() => navigate("/forgotpassword")} // Navigate to ForgotPassword page
                    className="text-blue-500 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <button onClick={handleSignIn} className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600">Login</button>
                <button 
                  type="button" 
                  onClick={handleGoogleSignIn} 
                  className="w-full mt-2 bg-[#4459dc] text-white p-2 rounded-lg hover:bg-[#4351cb] flex items-center justify-center">
                  <FcGoogle className="ml-0 mr-2" size={24} />
                  <span>Login with Google</span>
                </button>
                <div className="register-link text-center mt-4">
                  <p>Don't have an account? <button type="button" onClick={registerLink} className="text-blue-500 hover:underline">Register</button></p>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex relative w-full left-20">
              <form className = "relative left-20">
                <h1 className="text-2xl font-bold mb-4">Create an account</h1>
                <div className='input-box mb-4'>
                  <label htmlFor="username" className="block text-gray-700 mb-1">Username</label>
                  <input type="text" placeholder='Enter name' required ref={name} className="border border-neutral-500 rounded-lg p-2 w-full" 
                  />
                </div>
                <div className='input-box mb-4'>
                  <label htmlFor="email" className="block text-gray-700 mb-1">Email</label>
                  <input type="email" placeholder='person@gmail.com' required ref={email} className="border border-neutral-500 rounded-lg p-2 w-full" />
                </div>
                <div className='input-box mb-4 relative'>
                  <label htmlFor="password" className="block text-gray-700 mb-1">Password</label>
                  <input
                    type={showPasswordRegister ? "text" : "password"}
                    placeholder='Enter password'
                    required
                    ref={password}
                    className="border border-neutral-500 rounded-lg p-2 w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordRegister(!showPasswordRegister)}
                    className="absolute right-2 top-8"
                  >
                    {showPasswordRegister ? <AiOutlineEyeInvisible size={24} /> : <AiOutlineEye size={24} />}
                  </button>
                </div>
                <div className='input-box mb-4'>
                  <label htmlFor="text" className="block text-gray-700 mb-1">Shop Name</label>
                  <input type="text" placeholder='Enter name of your shop' required ref={shopname} className="border border-neutral-500 rounded-lg p-2 w-full" />
                </div>
                <div className='input-box mb-4'>
                  <label htmlFor="file" className="block text-gray-700 mb-1">Upload logo</label>
                  <input type="file" required ref={shoplogo} className="rounded-lg p-2 w-full" />
                </div>
                <div className='input-box mb-4'>
                  <label htmlFor="typeofshop" className="block text-gray-700 mb-1">Type of shop</label>
                  <select ref={typeofshop} className="border border-neutral-500 rounded-lg p-2 w-full" required>
                    <option value="">--Select type of shop--</option>
                    {/* Options */}
                    <option value="Option1">Franchise</option>
                    <option value="Option2">Tea Stall</option>
                    <option value="Option3">Restaurant</option>
                    <option value="Option4">Florist</option>
                    <option value="Option5">Auto Parts</option>
                    <option value="Option6">Bakery</option>
                    <option value="Option7">Cafe</option>
                    <option value="Option8">Auto Repair</option>
                    <option value="Option9">Paan Shop</option>
                    <option value="Option10">Vegetable Shop</option>
                    <option value="Option11">Pharmacy</option>
                    <option value="Option12">Jewelry</option>
                    <option value="Option13">Cycle Repair Shop</option>
                    <option value="Option14">Sweet Shop</option>
                    <option value="Option15">Pet Shop</option>
                    <option value="Option16">Furniture Store</option>
                    <option value="Option17">Dry Cleaner</option>
                    <option value="Option18">Gym</option>
                    <option value="Option19">Stationery Shop</option>
                    <option value="Option20">Convenience Shop</option>
                    <option value="Option21">Mobile Repair Shop</option>
                    <option value="Option22">Electronics Shop</option>
                  </select>
                </div>
                <button onClick={handleClick} className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600">Register</button>
                {/* Google Sign-up Button */}
                <button 
                  type="button" 
                  onClick={handleGoogleSignIn} 
                  className="w-full mt-2 bg-[#4459dc] text-white p-2 rounded-lg hover:bg-[#4351cb] flex items-center justify-center"
                >
                  <FcGoogle className="ml-0 mr-2" size={24} /> {/* Adjust margins here */}
                  <span>Continue with Google</span>
                </button>
                <div className="login-link text-center mt-4">
                  <p>Already have an account? <button type="button" onClick={loginLink} className="text-blue-500 hover:underline">Login</button></p>
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