import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, db } from '../../firebase'; // Import Firebase authentication and database
import { useNavigate } from 'react-router-dom'; // Import navigation hook

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize navigation hook

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Save user details in the Firebase Realtime Database with default userType 'regular'
      await set(ref(db, `users/${userId}`), {
        email,
        userType: 'regular', // Default user type
      });

      // Send email verification
      await sendEmailVerification(auth.currentUser);
      alert(
        'Registration successful! A verification email has been sent. Please verify your email before logging in.'
      );

      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Error during registration:', error);
      setError('Registration failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <h2>Register</h2>
      <p>
        Please enter your email and password to create an account. After
        registering, you’ll receive a verification email. Make sure to verify your
        email before logging in.
      </p>
      <form onSubmit={handleRegister}>
        {error && (
          <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>
        )}
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              margin: '5px 0',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Password:</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              margin: '5px 0',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007BFF',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}

export default Register;
