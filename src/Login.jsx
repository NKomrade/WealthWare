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
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineHome } from 'react-icons/ai';

const Login = ({ setIsAuthenticated }) => {
  const name = useRef();
  const email = useRef();
  const password = useRef();
  const phone = useRef(); 
  const shopname = useRef();
  const shoplogo = useRef();
  const typeofshop = useRef();

  const [isOtherShop, setIsOtherShop] = useState(false); // To toggle the custom shop type input
  const [customShopType, setCustomShopType] = useState(""); // To store custom shop type value
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showHome, setShowHome] = useState(false);
  const [show, setShow] = useState(true);
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [showPasswordRegister, setShowPasswordRegister] = useState(false);
  const navigate = useNavigate();

  const handleShopTypeChange = (e) => {
    const selectedType = e.target.value;
    if (selectedType === "others") {
      setIsOtherShop(true);
    } else {
      setIsOtherShop(false);
      setCustomShopType(""); // Reset custom shop type when it's not "Others"
    }
  };

  useEffect(() => {
    const localSignUp = localStorage.getItem('signUp');
    if (localSignUp) {
      setShowHome(true);
    }
  }, []);

  const handleClick = async (e) => {
    e.preventDefault();
    
    const nameValue = name.current.value;
    const emailValue = email.current.value;
    const passwordValue = password.current.value;
    const phoneValue = phone.current.value;
    const shopnameValue = shopname.current.value;
    const typeofshopValue = typeofshop.current.value === "others" ? customShopType : typeofshop.current.value;
    const file = shoplogo.current.files[0];
    
    // Name validation: Only letters and spaces
    if (!/^[a-zA-Z\s]+$/.test(nameValue)) {
      alert("Name can only contain letters and spaces.");
      return;
    }else {
      setNameError("");
    }
  
    // Email validation: Only @gmail.com allowed
    if (!/@gmail\.com$/.test(emailValue)) {
      alert("Email must be a Gmail address (ends with @gmail.com).");
      return;
    }else {
      setEmailError("");
    }
  
    // Phone validation: Only numbers allowed
    if (!/^\d+$/.test(phoneValue)) {
      alert("Phone number can only contain numbers.");
      return;
    }else {
      setPhoneError("");
    }

    // Password validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{8,}$/;
    if (!passwordRegex.test(passwordValue)) {
      setPasswordError("Password must be at least 8 characters, include one uppercase letter and one special character.");
      return;
    } else {
      setPasswordError("");
    }
  
    // Check if all fields are filled (excluding optional shop logo)
    if (!nameValue || !emailValue || !passwordValue || !phoneValue || !shopnameValue || !typeofshopValue) {
      alert("Please fill all required fields in the registration form.");
      return;
    }
  
    try {
      // Create user with email and password in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, emailValue, passwordValue);
      const user = userCredential.user;
  
      // Send verification email
      await sendEmailVerification(user);
      alert('Verification email sent! Please check your inbox and verify your email before logging in.');
  
      let downloadURL = "";
      if (file) {
        // Upload the shop logo to Firebase Storage if provided
        const storage = getStorage();
        const storageRef = ref(storage, `shoplogos/${user.uid}/${file.name}`);
        await uploadBytes(storageRef, file);
        console.log('File uploaded successfully');
        downloadURL = await getDownloadURL(storageRef);
        console.log('File available at', downloadURL);
      }
  
      // Format phone number (no additional prefixing done as per your code)
      const formattedPhone = phoneValue;
  
      // Store user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: nameValue,
        email: emailValue,
        phone: formattedPhone,
        shopname: shopnameValue,
        typeofshop: typeofshopValue,
        shoplogo: downloadURL,
        createdAt: new Date().toISOString(),
      });
  
      navigate('/login');
      loginLink();
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
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
      navigate('/dashboard');
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
      <div className="absolute top-4 right-4 bg-white/60 backdrop-blur-md shadow-lg p-3 rounded-full">
        <button
          onClick={() => navigate('/')} // Navigate to the homepage
          className="text-black hover:text-gray-700"
          title="Go to Homepage"
        >
          <AiOutlineHome size={28} />
        </button>
      </div>
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
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={registerLink}
                      className="text-blue-500 hover:underline"
                    >
                      Register
                    </button>
                  </p>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex relative w-full left-20">
              <form className="relative left-20">
                <h1 className="text-2xl font-bold mb-4">Create an account</h1>
                <div className="input-box mb-4">
                  <label htmlFor="username" className="block text-gray-700 mb-1">
                    Name<span className="text-red-500"> *</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <select
                      className="border border-neutral-500 rounded-lg p-2"
                      required
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Enter name"
                      required
                      ref={name}
                      className="border border-neutral-500 rounded-lg p-2 w-full"
                    />
                  </div>
                  {nameError && <p className="text-red-500 mt-1">{nameError}</p>}
                </div>
                <div className="input-box mb-4">
                  <label htmlFor="email" className="block text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="person@gmail.com"
                    required
                    ref={email}
                    className="border border-neutral-500 rounded-lg p-2 w-full"
                  />
                  {emailError && <p className="text-red-500 mt-1">{emailError}</p>}
                </div>
                <div className="input-box mb-4 relative">
                  <label htmlFor="password" className="block text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showPasswordRegister ? 'text' : 'password'}
                    placeholder="Enter password"
                    required
                    ref={password}
                    className="border border-neutral-500 rounded-lg p-2 w-full"
                    onChange={(e) => {
                      const passwordValue = e.target.value;
                      const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{8,}$/;
                      
                      if (!passwordRegex.test(passwordValue)) {
                        setPasswordError("Password must be at least 8 characters, include one uppercase letter, and one special character.");
                      } else {
                        setPasswordError("");
                      }
                    }}
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
                  {passwordError && <p className="text-red-500 mt-1">{passwordError}</p>}
                </div>
                <div className="input-box mb-4">
                  <label htmlFor="phone" className="block text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="1234567890"
                    required
                    ref={phone}
                    className="border border-neutral-500 rounded-lg p-2 w-full"
                  />
                  {phoneError && <p className="text-red-500 mt-1">{phoneError}</p>}
                </div>
                <div className="input-box mb-4">
                  <label htmlFor="shopname" className="block text-gray-700 mb-1">
                    Shop Name <span className="text-red-500">*</span>
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
                  <label htmlFor="typeofshop" className="block text-gray-700 mb-1">Type of shop <span className="text-red-500">*</span></label>
                  <select ref={typeofshop} className="border border-neutral-500 rounded-lg p-2 w-full" required onChange={handleShopTypeChange}>
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
                    <option value="others">Others</option>
                  </select>
                  {isOtherShop && (
                    <div className="mt-2">
                      <label className="block">Specify Shop Type</label>
                      <input
                        type="text"
                        placeholder="Enter custom shop type"
                        value={customShopType}
                        onChange={(e) => setCustomShopType(e.target.value)}
                        className="border p-2 rounded w-full"
                        required={isOtherShop}
                      />
                    </div>
                  )}
                </div>
                <div className="input-box mb-4">
                  <label htmlFor="shoplogo" className="block text-gray-700 mb-1">
                    Upload Profile (optional)
                  </label>
                  <input
                    type="file"
                    accept= ".jpg, .jpeg, .png"
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
                    Already have an account?{' '}
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