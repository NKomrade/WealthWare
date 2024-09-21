import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase'; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

export const Login = ({ setIsAuthenticated }) => {
  const name = useRef();
  const email = useRef();
  const password = useRef();
  const shopname = useRef();
  const shoplogo = useRef();
  const typeofshop = useRef();
  const [showHome, setShowHome] = useState(false);
  const [show, setShow] = useState(true); 
  const navigate = useNavigate();

  useEffect(() => {
    const localSignUp = localStorage.getItem("signUp");
    if (localSignUp) {
      setShowHome(true);
    }
  }, []);

  const handleClick = async (e) => {
    e.preventDefault();

    // Proceed with registration only if in registration mode
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
    setShow(true); // Show login form
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {showHome ? (
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold">Welcome Back!</h1>
          <button onClick={handleLogout} className="mt-4 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600">
            Logout
          </button>
        </div>
      ) : (
        <div className={`bg-white shadow-md rounded-lg p-10 w-96 h-auto`}>
          {show ? (
            <div className="form-box login">
              <form>
                <h1 className="text-2xl font-bold mb-4">Login</h1>
                <div className='input-box mb-4'>
                  <input type="text" placeholder='Email' required ref={email} className="border rounded-lg p-2 w-full" />
                </div>
                <div className='input-box mb-4 relative'>
                  <input type="password" placeholder='Password' required ref={password} className="border rounded-lg p-2 w-full" />
                </div>
                <div className="remember-forgot flex justify-between mb-4">
                  <label><input type="checkbox" /> Remember me</label>
                  <button type="button" onClick={() => alert("Forgot password feature not implemented")} className="text-blue-500 hover:underline">Forgot password?</button>
                </div>
                <button onClick={handleSignIn} className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600">Login</button>
                <div className="register-link text-center mt-4">
                  <p>Don't have an account? <button type="button" onClick={registerLink} className="text-blue-500 hover:underline">Register</button></p>
                </div>
              </form>
            </div>
          ) : (
            <div className="form-box register">
              <form>
                <h1 className="text-2xl font-bold mb-4">Registration</h1>
                <div className='input-box mb-4'>
                  <input type="text" placeholder='Username' required ref={name} className="border rounded-lg p-2 w-full" />
                </div>
                <div className='input-box mb-4'>
                  <input type="email" placeholder='Email' required ref={email} className="border rounded-lg p-2 w-full" />
                </div>
                <div className='input-box mb-4'>
                  <input type="password" placeholder='Password' required ref={password} className="border rounded-lg p-2 w-full" />
                </div>
                <div className='input-box mb-4'>
                  <input type="text" placeholder='Name of your Shop' required ref={shopname} className="border rounded-lg p-2 w-full" />
                </div>
                <div className='input-box mb-4'>
                  <input type="file" required ref={shoplogo} className="border rounded-lg p-2 w-full" />
                </div>
                <div className='input-box mb-4'>
                  <select ref={typeofshop} className="border rounded-lg p-2 w-full" required>
                    <option value="">--Select Type Of Shop--</option>
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
                    <option value="Option23">Salon</option>
                    <option value="Option24">Tailor</option>
                    <option value="Option25">Electronics Repair Shop</option>
                    <option value="Option26">Spare Parts Dealer</option>
                    <option value="Option27">Photo Studio</option>
                  </select>
                </div>
                <div className="remember-forgot mb-4">
                  <label><input type="checkbox" /> I agree to the terms & conditions</label>
                </div>
                <button onClick={handleClick} type="submit" className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600">Register</button>
                <div className="register-link text-center mt-4">
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
