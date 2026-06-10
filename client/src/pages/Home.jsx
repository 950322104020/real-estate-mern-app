import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css'; 

function Home() {
  const [properties, setProperties] = useState([]);
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', address: '', bedrooms: '', bathrooms: '', purpose: 'For Sale'
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All"); 
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [filterBedrooms, setFilterBedrooms] = useState("");

  // --- NEW: State to hold the logged-in user's favorite property IDs ---
  const [favorites, setFavorites] = useState([]);

  const navigate = useNavigate();

  const fetchProperties = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/properties', {
        params: { searchTerm, purpose: activeFilter, minPrice, maxPrice, bedrooms: filterBedrooms }
      });
      setProperties(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // --- NEW: Function to fetch the user's backpack of favorites ---
  const fetchFavorites = async () => {
    if (!isLoggedIn) return; // Only fetch if they are logged in!
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` } // Show the VIP wristband
      });
      setFavorites(response.data.favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [activeFilter]);

  // --- NEW: Run fetchFavorites whenever the user logs in ---
  useEffect(() => {
    fetchFavorites();
  }, [isLoggedIn]);

  // --- NEW: Function to toggle a favorite when the heart is clicked ---
  const toggleFavorite = async (propertyId) => {
    if (!isLoggedIn) {
      alert("Please log in to save properties to your wishlist!");
      navigate('/auth');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/api/users/favorite/${propertyId}`, {}, {
        headers: { Authorization: `Bearer ${token}` } // Show the VIP wristband
      });
      // Instantly update the React state so the heart turns red!
      setFavorites(response.data.favorites);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('address', formData.address);
      submitData.append('bedrooms', formData.bedrooms);
      submitData.append('bathrooms', formData.bathrooms);
      submitData.append('purpose', formData.purpose);
      
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (editingId) {
        await axios.put(`http://localhost:5000/api/properties/${editingId}`, submitData, config);
        setEditingId(null); 
      } else {
        await axios.post('http://localhost:5000/api/properties', submitData, config);
      }
      
      setFormData({ title: '', description: '', price: '', address: '', bedrooms: '', bathrooms: '', purpose: 'For Sale' });
      setImageFile(null);
      fetchProperties();
    } catch (error) {
      console.error("Error saving property:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/properties/${id}`);
      fetchProperties();
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

  const handleEdit = (property) => {
    setFormData(property);
    setEditingId(property._id);
    window.scrollTo({ top: 600, behavior: 'smooth' }); 
  };

  const handleAgentAction = (purpose) => {
    if (!isLoggedIn) {
      navigate('/auth');
    } else {
      setFormData({...formData, purpose: purpose}); 
      window.scrollTo({top: 700, behavior: 'smooth'}); 
    }
  };

  const handleAuthClick = () => {
    if (isLoggedIn) {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setFavorites([]); // Clear favorites from screen on logout
    } else {
      navigate('/auth');
    }
  };

  return (
    <div>
      <nav className="navbar">
        <h1 className="nav-logo">Ebenezer Properties</h1>
        <div className="nav-links">
          <span onClick={() => { setActiveFilter('Buy'); }}>Buy</span>
          <span onClick={() => { setActiveFilter('Rent'); }}>Rent</span>
          <span onClick={() => handleAgentAction('For Sale')}>Sell</span>
          <span onClick={() => handleAgentAction('For Rent')}>Rent Out</span>
          <div className="user-icon" onClick={handleAuthClick} title={isLoggedIn ? "Logout Agent" : "Login"} style={{ backgroundColor: isLoggedIn ? '#e74c3c' : 'white', color: isLoggedIn ? 'white' : '#333' }}>
            👤
          </div>
        </div>
      </nav>

      <div className="hero-section">
        <div className="glass-search-box">
          <div className="toggle-group">
            <button className={`toggle-btn ${activeFilter === 'All' ? 'active' : ''}`} onClick={() => setActiveFilter('All')}>All</button>
            <button className={`toggle-btn ${activeFilter === 'Buy' ? 'active' : ''}`} onClick={() => setActiveFilter('Buy')}>Buy</button>
            <button className={`toggle-btn ${activeFilter === 'Rent' ? 'active' : ''}`} onClick={() => setActiveFilter('Rent')}>Rent</button>
          </div>
          <div className="input-group">
            <span className="input-label">City / Address / Project</span>
            <input type="text" className="input-select" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="e.g. Noida, Sector 62..." />
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <span className="input-label">Min Price (₹)</span>
              <input type="number" className="input-select" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <span className="input-label">Max Price (₹)</span>
              <input type="number" className="input-select" placeholder="Any" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </div>
          </div>
          <div className="input-group">
            <span className="input-label">Minimum Bedrooms</span>
            <select className="input-select" value={filterBedrooms} onChange={(e) => setFilterBedrooms(e.target.value)}>
              <option value="">Any BHK</option>
              <option value="1">1+ BHK</option>
              <option value="2">2+ BHK</option>
              <option value="3">3+ BHK</option>
              <option value="4">4+ BHK</option>
              <option value="5">5+ BHK</option>
            </select>
          </div>
          <button className="search-submit-btn" onClick={() => { fetchProperties(); window.scrollTo({top: 600, behavior: 'smooth'}); }}>
            🔍 Search Properties
          </button>
        </div>
      </div>

      <div className="app-container">
        {isLoggedIn && (
          <div className="form-container">
            <h2 className="section-title">{editingId ? "✏️ Edit Listing" : "🏠 Add New Listing"}</h2>
            
            <form onSubmit={handleSubmit} className="property-form" encType="multipart/form-data">
              <input type="text" name="title" placeholder="Property Title" value={formData.title} onChange={handleChange} required />
              
              <select name="purpose" value={formData.purpose} onChange={handleChange} style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', outline: 'none' }}>
                <option value="For Sale">Sell (For Sale)</option>
                <option value="For Rent">Rent Out (For Rent)</option>
              </select>
              
              <div style={{ gridColumn: 'span 2', background: '#f8f9fa', padding: '15px', borderRadius: '6px', border: '1px dashed #ccc' }}>
                 <label style={{ fontSize: '0.95rem', color: '#333', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>📸 Upload Property Image:</label>
                 <input type="file" accept="image/*" onChange={handleFileChange} style={{ width: '100%', cursor: 'pointer' }} />
              </div>

              <input type="number" name="price" placeholder={formData.purpose === "For Rent" ? "Rent per month (₹)" : "Price (₹)"} value={formData.price} onChange={handleChange} required />
              <input type="text" name="address" placeholder="Location/Sector" value={formData.address} onChange={handleChange} required />
              <input type="number" name="bedrooms" placeholder="BHK (Bedrooms)" value={formData.bedrooms} onChange={handleChange} required />
              <input type="number" name="bathrooms" placeholder="Bathrooms" value={formData.bathrooms} onChange={handleChange} required />
              
              <input type="text" name="description" placeholder="Short description..." value={formData.description} onChange={handleChange} required style={{ gridColumn: 'span 2' }} />
              
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingId ? "Update Property" : "Post Property"}</button>
                {editingId && (
                  <button type="button" className="btn btn-danger" onClick={() => { setEditingId(null); setFormData({ title: '', description: '', price: '', address: '', bedrooms: '', bathrooms: '', purpose: 'For Sale' }); setImageFile(null); }}>Cancel</button>
                )}
              </div>
            </form>
          </div>
        )}

        <h2 className="section-title">
          {activeFilter === "All" ? "Featured Projects" : activeFilter === "Buy" ? "Properties for Sale" : "Properties for Rent"}
        </h2>
        <p>Showing <strong>{properties.length}</strong> results from the database.</p>

        <div className="properties-grid">
          {properties.map((property) => (
            <div key={property._id} className="property-card">
              <div className="image-container">
                <img src={property.imageUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"} alt={property.title} className="property-image" />
                <span className={`property-badge ${property.purpose === 'For Sale' ? 'badge-sale' : 'badge-rent'}`}>
                  {property.purpose || "For Sale"}
                </span>

                {/* --- NEW: The Wishlist Heart Button! --- */}
                <button 
                  onClick={() => toggleFavorite(property._id)}
                  style={{
                    position: 'absolute', top: '15px', right: '15px', background: 'white', border: 'none', borderRadius: '50%',
                    width: '38px', height: '38px', cursor: 'pointer', fontSize: '1.3rem', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, transition: '0.2s'
                  }}
                  title={favorites.includes(property._id) ? "Remove from Favorites" : "Save to Favorites"}
                >
                  {favorites.includes(property._id) ? '❤️' : '🤍'}
                </button>

              </div>
              <div className="card-content">
                <h3 className="property-title">{property.title}</h3>
                <p className="property-price">
                  ₹ {Number(property.price).toLocaleString()} {property.purpose === "For Rent" ? <span style={{fontSize: '1rem', color: '#7f8c8d'}}>/ month</span> : ""}
                </p>
                <div className="property-specs">
                  <span>🛏️ {property.bedrooms} BHK</span>
                  <span>🛁 {property.bathrooms} Baths</span>
                </div>
                <p className="property-address">📍 {property.address}</p>
                
                <Link to={`/property/${property._id}`} style={{ textDecoration: 'none' }}>
                  <button className="search-submit-btn" style={{ padding: '10px', marginTop: '10px' }}>
                      View Details
                  </button>
                </Link>

                {isLoggedIn && (
                  <div className="card-actions" style={{ marginTop: '10px' }}>
                    <button onClick={() => handleEdit(property)} className="btn btn-warning">Edit</button>
                    <button onClick={() => handleDelete(property._id)} className="btn btn-danger">Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ========================================== */}
        {/* --- NEW SECTION: FEATURED AGENTS --- */}
        {/* ========================================== */}
        <h2 className="section-title" style={{ marginTop: '60px' }}>Featured Agents</h2>
        <p>Top rated real estate consultants in your area.</p>
        <div className="agents-grid">
          {[
            { name: "Corvous Infra India", year: 2015, img: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=150&q=80" },
            { name: "Aranya Group", year: 2013, img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" },
            { name: "Aman Infra Estate", year: 2010, img: "https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&w=150&q=80" },
            { name: "Neocasa Infratech", year: 2018, img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" }
          ].map((agent, i) => (
            <div key={i} className="agent-card" onClick={() => navigate('/coming-soon')} >
              <img src={agent.img} alt={agent.name} className="agent-logo" />
              <div>
                <h4 style={{ margin: 0, color: '#2c3e50' }}>{agent.name}</h4>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#7f8c8d' }}>Operating since {agent.year}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ========================================== */}
        {/* --- NEW SECTION: PROPERTY GUIDE & NEWS --- */}
        {/* ========================================== */}
        <h2 className="section-title" style={{ marginTop: '60px' }}>Noida Property Guide & News</h2>
        <p>Latest insights, trends, and legal updates for homebuyers.</p>
        <div className="news-grid">
          {[
            { tag: "Guides", title: "How to Evaluate Gated Community Amenities in Noida", date: "Apr 6", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80" },
            { tag: "Guides", title: "First-Time Homebuyer's Roadmap to Noida Societies", date: "Apr 4", img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80" },
            { tag: "News", title: "Noida Authority Relents on Stalled Housing Relief", date: "6 days ago", img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80" },
            { tag: "News", title: "Noida Leads Uttar Pradesh Real Estate with 69 Projects", date: "8 days ago", img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80" }
          ].map((news, i) => (
            <div key={i} className="news-card" onClick={() => navigate('/coming-soon')}>
              <img src={news.img} alt="News" className="news-image" />
              <div className="news-content">
                <span style={{ background: '#e0f2f1', color: '#007367', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{news.tag}</span>
                <h4 style={{ margin: '12px 0', color: '#2c3e50', lineHeight: '1.4', fontSize: '1.1rem' }}>{news.title}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f8c8d' }}>{news.date}</p>
              </div>
            </div>
          ))}
        </div>

      </div> {/* <-- This is the closing tag for app-container */}

      {/* ========================================== */}
      {/* --- NEW SECTION: EXPLORE FOOTER --- */}
      {/* ========================================== */}
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-column">
            <h3>Explore</h3>
            <ul>
              <ul onClick={() => navigate('/coming-soon')}></ul>
              <li>Buy Properties</li>
              <li>Rent Properties</li>
              <li>Home Loans</li>
              <li>Developer API</li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Top Locations</h3>
            <ul>
              <li>Delhi & NCR</li>
              <li>Noida</li>
              <li>Gurgaon</li>
              <li>Mumbai</li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Company</h3>
            <ul>
              <li>About Us</li>
              <li>Contact Us</li>
              <li>Careers</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Contact</h3>
            <ul>
              <li>support@ebenezerproperties.com</li>
              <li>+91 98765 43210</li>
              <li>Sector 62, Noida, UP</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; 2026 Ebenezer Properties. All rights reserved. A completely professional portfolio project.
        </div>
      </footer>
      </div> /* <-- This is the closing tag for the main wrapper */
  );
}

export default Home;  