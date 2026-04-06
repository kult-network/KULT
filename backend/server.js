const express = require('express');
const axios = require('axios');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// --- 1. MIDDLEWARE & CORS ---
app.use(cors({
    origin: "*", // In production, replace "*" with your Vercel URL
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "xc-token"]
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- 2. CONFIGURATION ---
// Ensure NOCO_TOKEN is added to Railway Variables tab!
const NOCO_BASE_URL = "https://app.nocodb.com/api/v1/db/data/v1/pdo67xcuojyjxq5";
const HEADERS = { 'xc-token': process.env.NOCO_TOKEN };

// Table IDs
const TABLE_ID_PROGRAMS = "m8dmxdncr8cvqwh";
const TABLE_ID_USERS = "myg3noa7m6dl5d9";
const TABLE_ID_HUBS = "mipum5ek0vzc7cc";
const TABLE_ID_ACTIVITY = "mu8han7k2m68xzs";
const TABLE_ID_BOOKINGS = "mq28zf6dbmbnyhp";
const TABLE_ID_TOKENS = "mc0b38mv8ao1a1o";
const TABLE_ID_POLLS = "mc7vexszhan3k4r";

// --- 3. HELPER FUNCTIONS ---
const logActivity = async (message, type = "GENERAL") => {
    try {
        await axios.post(`${NOCO_BASE_URL}/${TABLE_ID_ACTIVITY}/rows`, { Log: message, Type: type }, { headers: HEADERS });
    } catch (e) {
        console.error("Pulse log failed:", e.response?.data || e.message);
    }
};

// --- 4. API ROUTES ---

// Get All Hubs
app.get('/api/hubs', async (req, res) => {
    try {
        const response = await axios.get(`${NOCO_BASE_URL}/${TABLE_ID_HUBS}/rows`, { headers: HEADERS });
        res.json(response.data.list || []);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch hubs", details: err.message });
    }
});

// Create New Hub
app.post('/api/hubs', async (req, res) => {
    try {
        const response = await axios.post(`${NOCO_BASE_URL}/${TABLE_ID_HUBS}/rows`, { ...req.body, Status: 'Active' }, { headers: HEADERS });
        await logActivity(`🏗️ NEW HUB DEPLOYED: ${req.body.Name?.toUpperCase()}`, "SYSTEM");
        res.json({ success: true, data: response.data });
    } catch (err) {
        res.status(500).json({ error: "Hub deployment failed" });
    }
});

// Host New Event
app.post('/api/events', async (req, res) => {
    try {
        const { Name, Description, Category, start_time, end_time, Price, Hub_ID, Speaker, Poster, Itinerary, Redirect_Link, UPI_ID } = req.body;
        let payloadData = {
            "Title": Name,
            "Description": Description,
            "Category": Category,
            "Speaker": Speaker,
            "Poster": Poster,
            "Itinerary": Itinerary,
            "start_time": start_time,
            "end_time": end_time,
            "Price": Price,
            "UPI_ID": UPI_ID || "",
            "Hubs": Hub_ID ? [Hub_ID] : []
        };
        if (Redirect_Link) payloadData["Redirect_Link"] = Redirect_Link;

        const response = await axios.post(`${NOCO_BASE_URL}/${TABLE_ID_PROGRAMS}/rows`, payloadData, { headers: HEADERS });
        await logActivity(`🚀 MISSION LIVE: ${Name?.toUpperCase()}`, "EVENT");
        res.json({ success: true, data: response.data });
    } catch (err) {
        res.status(500).json({ error: "Failed to host mission" });
    }
});

// User Role Sync
app.get('/api/user-role/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const response = await axios.get(`${NOCO_BASE_URL}/${TABLE_ID_USERS}/rows`, {
            params: { where: `(Email,eq,${email.toLowerCase().trim()})` },
            headers: HEADERS
        });
        const list = response.data.list || [];
        res.json(list[0] || { Role: 'USER' });
    } catch (err) { res.json({ Role: 'USER' }); }
});

// Token Generation
app.post('/api/tokens/generate', async (req, res) => {
    try {
        const newToken = `KULT-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        await axios.post(`${NOCO_BASE_URL}/${TABLE_ID_TOKENS}/rows`, { Token: newToken, Status: 'Unused' }, { headers: HEADERS });
        res.json({ success: true, token: newToken });
    } catch (err) { res.status(500).json({ error: "Token fail" }); }
});

// Root check
app.get('/', (req, res) => res.send("🚀 KULT ENGINE MASTER IS ONLINE"));

// --- 5. SERVER START ---
// Railway dynamically assigns PORT; default to 5001 for local dev
const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 KULT ENGINE MASTER - ONLINE`);
    console.log(`📡 LISTENING ON PORT: ${PORT}`);
});