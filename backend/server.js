const express = require('express');
const axios = require('axios');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// --- CONFIGURATION ---
// Render assignments PORT dynamically, so we use process.env.PORT
const PORT = process.env.PORT || 5001;

// CORS setup to allow your Vercel frontend to talk to this Backend
app.use(cors({
    origin: "*", // Change this to your Vercel URL in production for better security
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "xc-token"]
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Ensure NOCO_BASE_URL is correct from your NocoDB API docs
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

// --- HELPER FUNCTIONS ---
const logActivity = async (message, type = "GENERAL") => {
    try {
        await axios.post(`${NOCO_BASE_URL}/${TABLE_ID_ACTIVITY}`, { Log: message, Type: type }, { headers: HEADERS });
    } catch (e) { console.error("Pulse log failed:", e.message); }
};

// --- API ROUTES ---

// 1. Get All Hubs
app.get('/api/hubs', async (req, res) => {
    try {
        const response = await axios.get(`${NOCO_BASE_URL}/${TABLE_ID_HUBS}`, { headers: HEADERS });
        res.json(response.data.list || response.data || []);
    } catch (err) {
        console.error("DEBUG HUBS ERROR:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to fetch hubs", details: err.message });
    }
});

// 2. Create New Hub
app.post('/api/hubs', async (req, res) => {
    try {
        const response = await axios.post(`${NOCO_BASE_URL}/${TABLE_ID_HUBS}`, { ...req.body, Status: 'Active' }, { headers: HEADERS });
        await logActivity(`🏗️ NEW HUB DEPLOYED: ${req.body.Name?.toUpperCase()}`, "SYSTEM");
        res.json({ success: true, data: response.data });
    } catch (err) {
        console.error("Hub Creation Error:", err.response?.data || err.message);
        res.status(500).json({ error: "Hub deployment failed" });
    }
});

// 3. Host New Event (Mission)
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

        const response = await axios.post(`${NOCO_BASE_URL}/${TABLE_ID_PROGRAMS}`, payloadData, { headers: HEADERS });
        await logActivity(`🚀 MISSION LIVE: ${Name?.toUpperCase()}`, "EVENT");
        res.json({ success: true, data: response.data });
    } catch (err) {
        console.error("❌ Mission Sync Error:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to host mission" });
    }
});

// 4. Get Events by Hub ID
app.get('/api/hubs/:id/events', async (req, res) => {
    try {
        const response = await axios.get(`${NOCO_BASE_URL}/${TABLE_ID_PROGRAMS}`, {
            headers: HEADERS,
            params: { limit: 100, sort: '-Id' }
        });
        const allEvents = response.data.list || response.data || [];
        const hubEvents = allEvents.filter(e => e.Hubs && e.Hubs.some(h => String(h.Id || h.id) === String(req.params.id)));
        res.json(hubEvents);
    } catch (err) {
        console.error("Fetch Events Error:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to fetch hub events" });
    }
});

// 5. Get/Sync User Role
app.get('/api/user-role/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const response = await axios.get(`${NOCO_BASE_URL}/${TABLE_ID_USERS}`, {
            params: { where: `(Email,eq,${email.toLowerCase().trim()})` },
            headers: HEADERS
        });
        const list = response.data.list || response.data;
        res.json(Array.isArray(list) ? list[0] : list || { Role: 'USER' });
    } catch (err) { res.json({ Role: 'USER' }); }
});

app.post('/api/user-role', async (req, res) => {
    const { email, name, role } = req.body;
    try {
        const getRes = await axios.get(`${NOCO_BASE_URL}/${TABLE_ID_USERS}`, {
            params: { where: `(Email,eq,${email.toLowerCase().trim()})` },
            headers: HEADERS
        });
        const list = getRes.data.list || getRes.data || [];
        if (list.length > 0) return res.json({ success: true, data: list[0] });

        const postRes = await axios.post(`${NOCO_BASE_URL}/${TABLE_ID_USERS}`, {
            "Email": email.toLowerCase().trim(),
            "Name": name || email.split('@')[0],
            "Role": role || 'USER'
        }, { headers: HEADERS });

        res.json({ success: true, data: postRes.data });
    } catch (err) {
        console.error("User Sync Error:", err.message);
        res.status(500).json({ error: "Failed to sync user" });
    }
});

// 6. Tokens, Polls, Bookings, Activity (Mini-Routes)
app.post('/api/tokens/generate', async (req, res) => {
    try {
        const newToken = `KULT-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        await axios.post(`${NOCO_BASE_URL}/${TABLE_ID_TOKENS}`, { Token: newToken, Status: 'Unused' }, { headers: HEADERS });
        res.json({ success: true, token: newToken });
    } catch (err) { res.status(500).json({ error: "Token fail" }); }
});

app.post('/api/polls', async (req, res) => {
    try {
        await axios.post(`${NOCO_BASE_URL}/${TABLE_ID_POLLS}`, { ...req.body, VotesA: 0, VotesB: 0, Status: 'Active' }, { headers: HEADERS });
        await logActivity(`📊 NEW VIBE CHECK: ${req.body.Question?.toUpperCase()}`, "SYSTEM");
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Poll fail" }); }
});

app.get('/api/polls/active', async (req, res) => {
    try {
        const response = await axios.get(`${NOCO_BASE_URL}/${TABLE_ID_POLLS}`, { headers: HEADERS, params: { limit: 1, sort: '-Id' } });
        res.json(response.data.list?.[0] || null);
    } catch (err) { res.status(500).json(null); }
});

app.post('/api/bookings', async (req, res) => {
    try {
        await axios.post(`${NOCO_BASE_URL}/${TABLE_ID_BOOKINGS}`, req.body, { headers: HEADERS });
        await logActivity(`🎟️ REGISTRATION: ${req.body.Name?.toUpperCase()} -> ${req.body.Event_Name?.toUpperCase()}`, "BOOKING");
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Booking fail" }); }
});

app.get('/api/activity', async (req, res) => {
    try {
        const response = await axios.get(`${NOCO_BASE_URL}/${TABLE_ID_ACTIVITY}`, { headers: HEADERS, params: { limit: 15, sort: '-Id' } });
        res.json(response.data.list || []);
    } catch (err) { res.status(500).json([]); }
});

// --- SERVER START ---
app.listen(PORT, () => {
    console.log(`\n🚀 KULT ENGINE MASTER - ONLINE`);
    console.log(`📡 PORT: ${PORT}`);
    console.log(`🔗 API BASE: ${NOCO_BASE_URL}`);
});