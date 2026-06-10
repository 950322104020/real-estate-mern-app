// 1. Import the Express tool we installed
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Import the new User blueprint
require('dotenv').config(); // Wakes up our secret .env file
const Property = require('./models/Property');
const cors = require('cors'); // <--- NEW: Import CORS
const upload = require('./middleware/upload');
const nodemailer = require('nodemailer');
require('dotenv').config();

// 2. Initialize the app
const app = express();
app.use(cors()); // <--- NEW: Enable CORS for all routes
// Wakes up Express's ability to read JSON data
app.use(express.json());

// 3. Define a "port" (this is the door your server listens to)
const PORT = 5000;
// --- NEW CODE: Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB is successfully connected!'))
    .catch((err) => console.log('Database connection error:', err));
// ------------------------------------

// 4. Create a simple route to test if it works
app.get('/', (req, res) => {
    res.send('Real Estate Server is running!');
});
// ==========================================
// --- AUTHENTICATION ROUTES (SIGNUP & LOGIN) ---
// ==========================================

// 1. REGISTER A NEW AGENT
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists!" });

        // Scramble (Hash) the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save the new user
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User created successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Registration failed", error: error.message });
    }
});

// 2. LOGIN AN EXISTING AGENT
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found!" });

        // Check if the password matches the scrambled password in the database
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials!" });

        // Create the VIP Wristband (JWT Token)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        // Send the wristband and user info back to the frontend
        res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: "Login failed", error: error.message });
    }
});
// ==========================================
// --- UPGRADED ROUTE: Create a Property (WITH IMAGE UPLOAD) ---
// Notice we added `upload.single('image')` in the middle! 
// This tells Multer to intercept the incoming file named "image" and upload it to Cloudinary first.
app.post('/api/properties', upload.single('image'), async (req, res) => {
    try {
        // 1. Grab the text data sent by the user
        const propertyData = req.body;
        
        // 2. If Multer successfully uploaded a file, attach the secure Cloudinary URL!
        if (req.file) {
            propertyData.imageUrl = req.file.path; 
        }

        // 3. Save it to MongoDB
        const newProperty = new Property(propertyData);
        const savedProperty = await newProperty.save();
        
        res.status(201).json(savedProperty);
    } catch (error) {
        res.status(500).json({ message: "Failed to save property", error: error.message });
    }
});
// -------------------------------------------------------------
// ------------------------------------
/// --- UPGRADED ROUTE: Get Properties with Advanced Filters ---
app.get('/api/properties', async (req, res) => {
    try {
        let query = {};

        if (req.query.purpose && req.query.purpose !== 'All') {
            query.purpose = req.query.purpose === 'Buy' ? 'For Sale' : 'For Rent';
        }

        if (req.query.searchTerm) {
            query.$or = [
                { address: { $regex: req.query.searchTerm, $options: 'i' } },
                { title: { $regex: req.query.searchTerm, $options: 'i' } }
            ];
        }

        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice); 
            if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice); 
        }

        if (req.query.bedrooms) {
            query.bedrooms = { $gte: Number(req.query.bedrooms) };
        }

        const properties = await Property.find(query);
        res.status(200).json(properties);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch properties", error: error.message });
    }
});
// ------------------------------------------------------------
// --- NEW ROUTE: Get a Single Property by ID ---
app.get('/api/properties/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ message: "Property not found" });
        res.status(200).json(property);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch property", error: error.message });
    }
});
// ----------------------------------------------
// --- NEW ROUTE: Delete a Property ---
app.delete('/api/properties/:id', async (req, res) => {
    try {
        // 1. Grab the unique ID from the URL and tell Mongoose to delete it
        await Property.findByIdAndDelete(req.params.id);
        
        // 2. Send a success message back to the frontend
        res.status(200).json({ message: 'Property deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete property", error: error.message });
    }
});

// ------------------------------------
// --- UPDATED ROUTE: Update a Property (WITH IMAGE UPLOAD) ---
app.put('/api/properties/:id', upload.single('image'), async (req, res) => {
    try {
        const propertyData = req.body;
        
        // If they uploaded a NEW image while editing, update the URL!
        if (req.file) {
            propertyData.imageUrl = req.file.path; 
        }

        const updatedProperty = await Property.findByIdAndUpdate(
            req.params.id, 
            propertyData, 
            { new: true } 
        );
        
        res.status(200).json(updatedProperty);
    } catch (error) {
        res.status(500).json({ message: "Failed to update property", error: error.message });
    }
});
// ------------------------------------------------------------ ------------------------------------
// 2. TOGGLE A FAVORITE PROPERTY (Add or Remove)
app.post('/api/users/favorite/:propertyId', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "No token provided!" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        const propertyId = req.params.propertyId;

        // BULLETPROOF TOGGLE LOGIC: 
        // We force MongoDB to convert its ObjectIds to normal strings before comparing!
        const isFavorited = user.favorites.some(id => id.toString() === propertyId);

        if (isFavorited) {
            user.favorites.pull(propertyId); // Remove it
        } else {
            user.favorites.push(propertyId); // Add it
        }

        await user.save();
        res.status(200).json({ message: isFavorited ? "Removed" : "Added", favorites: user.favorites });
    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ message: "Failed to update favorites", error: error.message });
    }
});
// ==========================================
// ==========================================
// --- REAL EMAIL CONTACT ROUTE ---
// ==========================================
app.post('/api/contact', async (req, res) => {
    try {
        const { name, phone, propertyTitle, propertyAddress } = req.body;

        // 1. Configure the "postman" (Nodemailer) with your .env secrets
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Uses the placeholder!
                pass: process.env.EMAIL_PASS  // Uses the placeholder!
            }
        });

        // 2. Draft the email you will receive
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Sending it to your own inbox
            subject: `🏠 New Lead for: ${propertyTitle}`,
            text: `You have a new interested buyer!\n\nName: ${name}\nPhone: ${phone}\nProperty: ${propertyTitle}\nLocation: ${propertyAddress}\n\nPlease reach out to them ASAP!`
        };

        // 3. Send it!
        await transporter.sendMail(mailOptions);
        
        res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
        console.error("Email Error:", error);
        res.status(500).json({ message: "Failed to send email", error: error.message });
    }
});
// ==========================================


// 5. Tell the server to start listening
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});