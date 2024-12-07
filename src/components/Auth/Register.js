import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, db } from '../../firebase';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if the email is in the whitelist
      const whitelistRef = ref(db, `whitelistedEmails/${btoa(email)}`);
      const whitelistSnapshot = await get(whitelistRef);

      if (!whitelistSnapshot.exists()) {
        setError('Registration failed: Your email is not on the whitelist. Please contact the administrator.');
        setLoading(false);
        return;
      }

      // Proceed with registration if email is whitelisted
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Store user details in the database
      await set(ref(db, `users/${userId}`), {
        email,
        userType: 'regular',
      });

      // Send email verification
      await sendEmailVerification(auth.currentUser);
      alert('Registration successful! A verification email has been sent. Please verify your email before logging in.');

      // Redirect to the login page
      navigate('/login');
    } catch (error) {
      setError('Registration failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-5 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <p className="text-gray-600 mb-4">
        Please enter your email and password to create an account. After registering, you’ll receive a verification email. Make sure to verify your email before logging in.
      </p>
      <form onSubmit={handleRegister} className="space-y-4">
        {error && <p className="text-red-500">{error}</p>}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Email:</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Password:</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 text-white font-bold rounded focus:outline-none focus:ring-2 ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 focus:ring-blue-400'
          }`}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;
