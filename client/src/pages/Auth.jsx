import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Auth() {
  // Toggles between Login mode and Register mode
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  
  // This tool lets us automatically redirect the user to a different page
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        // --- LOGIN MODE ---
        const response = await axios.post('https://ebenezer-backend-vw14.onrender.com/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
        
        // Success! We received the VIP Wristband (JWT token). 
        // Let's save it to the browser's permanent memory (localStorage)
        localStorage.setItem('token', response.data.token);
        
        // Send the user back to the Home page
        navigate('/'); 
      } else {
        // --- REGISTER MODE ---
        await axios.post('https://ebenezer-backend-vw14.onrender.com/api/auth/register', formData);
        alert("Registration successful! You can now log in.");
        setIsLogin(true); // Switch the form back to login mode automatically
      }
    } catch (err) {
      // If they type the wrong password, show the error message from our backend
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f7f6' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        
        <h2 style={{ textAlign: 'center', color: '#007367', marginBottom: '20px' }}>
          {isLogin ? "Agent Login" : "Register as Agent"}
        </h2>

        {/* Display red error messages if login fails */}
        {error && <p style={{ color: 'red', textAlign: 'center', background: '#ffe6e6', padding: '10px', borderRadius: '5px' }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* Only show the Username box if they are registering */}
          {!isLogin && (
            <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }} />
          )}
          
          <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }} />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }} />

          <button type="submit" style={{ background: '#007367', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#555' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#007367', cursor: 'pointer', fontWeight: 'bold' }}>
            {isLogin ? "Register here" : "Login here"}
          </span>
        </p>

        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <Link to="/" style={{ color: '#7f8c8d', textDecoration: 'none' }}>← Back to Home</Link>
        </div>

      </div>
    </div>
  );
}

export default Auth;