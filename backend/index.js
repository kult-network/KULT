require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios'); // Already in your dependencies

const app = express();

// 1. CORS Configuration
// This allows your Vercel frontend to talk to this Railway backend
app.use(cors({
    origin: ['https://kult-nine.vercel.app', 'http://localhost:5001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

// Sample Route
app.get('/', (req, res) => {
    res.send('KULT Backend is running on Railway!');
});

// 2. Dynamic Port Handling
// Railway automatically assigns a port via process.env.PORT
const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is vibrating on port ${PORT}`);
});