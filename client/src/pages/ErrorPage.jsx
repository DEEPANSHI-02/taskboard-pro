import React from 'react';
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Oops! Something went wrong.</h1>
      <p style={styles.message}>The page you are looking for does not exist or an error occurred.</p>
      <button style={styles.button} onClick={() => navigate('/')}>
        Go to Home
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f8f9fa',
    textAlign: 'center',
    padding: '20px',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
    color: '#dc3545', // bootstrap danger red
  },
  message: {
    fontSize: '1.25rem',
    marginBottom: '2rem',
    color: '#6c757d',
  },
  button: {
    backgroundColor: '#007bff', // bootstrap primary blue
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    fontSize: '1rem',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default ErrorPage;
