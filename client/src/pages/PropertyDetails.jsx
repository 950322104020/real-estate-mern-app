import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function PropertyDetails() {
  const { id } = useParams(); 
  const [property, setProperty] = useState(null);
  
  // --- NEW: State for the Contact Form ---
  const [contactData, setContactData] = useState({ name: '', phone: '' });
  const [emailStatus, setEmailStatus] = useState(''); // Gives user feedback!

  useEffect(() => {
    const fetchSingleProperty = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/properties/${id}`);
        setProperty(response.data);
      } catch (error) {
        console.error("Error fetching the property:", error);
      }
    };
    fetchSingleProperty();
  }, [id]);

  // --- NEW: Function to send the email! ---
  const handleContactSubmit = async () => {
    if (!contactData.name || !contactData.phone) {
        setEmailStatus('⚠️ Please fill out your name and phone number.');
        return;
    }
    
    setEmailStatus('⏳ Sending...');
    try {
        await axios.post('http://localhost:5000/api/contact', {
            name: contactData.name,
            phone: contactData.phone,
            propertyTitle: property.title,
            propertyAddress: property.address
        });
        setEmailStatus('✅ Request sent successfully! The agent will contact you soon.');
        setContactData({ name: '', phone: '' }); // Clear the form
    } catch (error) {
        setEmailStatus('❌ Failed to send request. Please try again later.');
    }
  };

  if (!property) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Loading Property Details...</h2>;

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '50px' }}>
      <nav className="navbar" style={{ position: 'relative', backgroundColor: '#007367' }}>
        <h1 className="nav-logo" style={{ color: 'white' }}>Ebenezer Properties</h1>
        <div className="nav-links">
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>← Back to Listings</Link>
        </div>
      </nav>

      <div style={{ 
        backgroundImage: `url(${property.imageUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3"})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '60vh',
        width: '100%'
      }}></div>

      <div className="app-container" style={{ marginTop: '-80px', position: 'relative', zIndex: 10 }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <span className={`property-badge ${property.purpose === 'For Sale' ? 'badge-sale' : 'badge-rent'}`} style={{ position: 'relative', top: '0', left: '0', display: 'inline-block', marginBottom: '15px' }}>
             {property.purpose}
          </span>
          
          <h1 style={{ fontSize: '2.5rem', color: '#2c3e50', margin: '0 0 10px 0' }}>{property.title}</h1>
          <p style={{ fontSize: '1.2rem', color: '#7f8c8d', marginBottom: '20px' }}>📍 {property.address}</p>
          
          <h2 style={{ color: '#27ae60', fontSize: '2.5rem', margin: '0 0 30px 0' }}>
            ₹ {Number(property.price).toLocaleString()} {property.purpose === "For Rent" ? <span style={{fontSize: '1.2rem', color: '#7f8c8d'}}>/ month</span> : ""}
          </h2>

          <div className="property-specs" style={{ display: 'inline-flex', padding: '15px 30px', fontSize: '1.2rem' }}>
            <span>🛏️ {property.bedrooms} Bedrooms</span>
            <span style={{ marginLeft: '20px' }}>🛁 {property.bathrooms} Bathrooms</span>
          </div>

          <h3 style={{ marginTop: '40px', borderBottom: '2px solid #27ae60', paddingBottom: '10px', display: 'inline-block' }}>Property Overview</h3>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#555', marginTop: '20px' }}>
            {property.description}
          </p>

          <div style={{ marginTop: '40px' }}>
            <h3 style={{ borderBottom: '2px solid #27ae60', paddingBottom: '10px', display: 'inline-block' }}>Location</h3>
            <div style={{ width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden', marginTop: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
              <iframe
                title="Property Location"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(property.address)}&output=embed`}
              ></iframe>
            </div>
          </div>

          {/* --- UPGRADED REAL CONTACT FORM --- */}
          <div style={{ marginTop: '50px', padding: '30px', backgroundColor: '#f4f7f6', borderRadius: '8px' }}>
            <h3>Interested? Contact the Agent</h3>
            <div style={{ display: 'flex', gap: '15px', marginTop: '15px', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  value={contactData.name}
                  onChange={(e) => setContactData({...contactData, name: e.target.value})}
                  style={{ flex: 1, minWidth: '200px', padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} 
                />
                <input 
                  type="text" 
                  placeholder="Your Phone" 
                  value={contactData.phone}
                  onChange={(e) => setContactData({...contactData, phone: e.target.value})}
                  style={{ flex: 1, minWidth: '200px', padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} 
                />
                <button 
                  onClick={handleContactSubmit}
                  className="search-submit-btn" 
                  style={{ margin: 0, width: 'auto', padding: '0 30px', cursor: 'pointer' }}
                >
                  Request Info
                </button>
            </div>
            {/* Displays Success or Error messages below the form! */}
            {emailStatus && <p style={{ marginTop: '15px', fontWeight: 'bold', color: emailStatus.includes('✅') ? '#27ae60' : '#e74c3c' }}>{emailStatus}</p>}
          </div>

        </div>
      </div>
    </div>
  );
}

export default PropertyDetails;