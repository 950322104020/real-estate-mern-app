import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      
      <div style={{ background: 'white', padding: '50px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', textAlign: 'center', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '3rem', margin: '0', textShadow: '2px 2px 0px #e0f2f1' }}>🚀</h1>
        <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginTop: '20px' }}>Feature in Development</h2>
        
        <p style={{ fontSize: '1.1rem', color: '#7f8c8d', lineHeight: '1.6', marginTop: '15px' }}>
          This section is currently under construction. In a fully scaled enterprise environment, this module would connect to its own dedicated database collection (like an Agents API or a News CMS).
        </p>
        
        <button 
          onClick={() => navigate(-1)} 
          className="search-submit-btn" 
          style={{ width: 'auto', padding: '12px 30px', marginTop: '30px' }}
        >
          ← Go Back
        </button>
      </div>

    </div>
  );
}

export default ComingSoon;