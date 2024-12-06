import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './Auth/AuthContext'; // Import AuthContext

const Header = () => {
  const { currentUser } = useAuth(); // Fetch logged-in user data

  return (
    <header className="App-header">
      <div style={headerContainerStyle}>
        <h1>Family Collection Index</h1>
        {currentUser ? (
          <p style={userInfoStyle}>
            Logged in as: <strong>{currentUser.email}</strong>
          </p>
        ) : (
          <p style={userInfoStyle}>Not logged in</p>
        )}
      </div>
      <nav>
        <ul style={navStyle}>
          {!currentUser ? (
            <>
              <li style={listItemStyle}>
                <Link to="/login">Login</Link>
              </li>
              <li style={listItemStyle}>
                <Link to="/register">Register</Link>
              </li>
            </>
          ) : (
            <>
              <li style={listItemStyle}>
                <Link to="/create">Create Record</Link>
              </li>
              <li style={listItemStyle}>
                <Link to="/read">View Records</Link>
              </li>
              <li style={listItemStyle}>
                <Link to="/delete">Delete Record</Link>
              </li>
              <li style={listItemStyle}>
                <Link to="/logout">Logout</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

// Inline styles for the header and navigation
const headerContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px',
  backgroundColor: '#282c34',
  color: 'white',
};

const navStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  padding: '10px',
  listStyle: 'none',
  backgroundColor: '#20232a',
};

const listItemStyle = {
  margin: '0 10px',
  color: '#61dafb',
  textDecoration: 'none',
};

const userInfoStyle = {
  margin: '0 20px',
  fontSize: '14px',
  color: '#ffffff',
};

export default Header;
