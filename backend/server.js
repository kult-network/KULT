const express = require('express');
const axios = require('axios');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
if (!process.env.VERCEL) {
    require('dotenv').config();
}

// LOG TO VERCEL DASHBOARD (Delete this after it works)
console.log("CRITICAL DEBUG: BREVO_API_KEY status ->", !!process.env.BREVO_API_KEY);

const app = express();

// --- 1.5 EMAIL CONFIGURATION (NODEMAILER INTEGRATION) ---
/**
 * Using Nodemailer with Port 465 (SSL) for Vercel stability.
 * Ensure EMAIL_USER and EMAIL_PASS (App Password) are set in Vercel/Env.
 */
const sendEmail = async (to, subject, htmlContent) => {
    const { EMAIL_USER, EMAIL_PASS } = process.env;
    
    if (!EMAIL_USER || !EMAIL_PASS) {
        console.error("❌ Email failed: EMAIL_USER or EMAIL_PASS is missing in environment settings");
        return false;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: `"KULT Support" <${EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: htmlContent
        });
        
        console.log(`✅ Email sent to ${to} via Nodemailer`);
        return true;
    } catch (err) {
        console.error("❌ Nodemailer Error:", err.message);
        return false;
    }
};

// --- 1. MIDDLEWARE & CORS ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// In-memory stores
const otpStore = new Map(); // email -> { otp, expiry, action }
const sessions = new Map(); // token -> { userId, email, role, createdAt }

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateSessionToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// --- 2. CONFIGURATION ---
const NOCO_BASE_URL = "https://app.nocodb.com/api/v1/db/data/noco/pdo67xcuojyjxq5";
const HEADERS = { 'xc-token': process.env.NOCO_TOKEN };

// Table IDs
const TABLE_ID_PROGRAMS = "m8dmxdncr8cvqwh";
const TABLE_ID_USERS = "myg3noa7m6dl5d9";
const TABLE_ID_HUBS = "mipum5ek0vzc7cc";
const TABLE_ID_ACTIVITY = "mu8han7k2m68xzs";
const TABLE_ID_BOOKINGS = "mq28zf6dbmbnyhp";
const TABLE_ID_TOKENS = "mc0b38mv8ao1a1o";
const TABLE_ID_POLLS = "mc7vexszhan3k4r";
const TABLE_ID_NOTIFICATIONS = "mvxwc3h19a4a0jw"; 

// --- 3. HELPER FUNCTIONS ---
const logActivity = async (message, type = "GENERAL") => {
    try {
        await axios.post(`${NOCO_BASE_URL}/${TABLE_ID_ACTIVITY}`, { Log: message, Type: type }, { headers: HEADERS });
    } catch (e) {
        console.error("Pulse log failed:", e.response?.data || e.message);
    }
};

// --- 4. OTP-AUTH ENDPOINTS ---

app.post('/api/auth/send-otp', async (req, res) => {
    const { email, action } = req.body;
    
    if (!email) return res.status(400).json({ error: "Email required" });
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }
    
    const otp = generateOTP();
    const expiry = Date.now() + 10 * 60 * 1000; 
    
    otpStore.set(email.toLowerCase(), { otp, expiry, action: action || 'login' });
    
    const htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #BC13FE; font-size: 32px; margin: 0;">KULT</h1>
            </div>
            <div style="background: #0f172a; border-radius: 20px; padding: 30px; text-align: center;">
                <p style="color: #eef2ff; font-size: 16px; margin-bottom: 20px;">Your verification code:</p>
                <div style="background: linear-gradient(135deg, #7c3aed, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 48px; font-weight: bold; letter-spacing: 8px; margin: 30px 0;">
                    ${otp}
                </div>
                <p style="color: #94a3b8; font-size: 14px;">This code expires in <strong style="color: #eef2ff;">10 minutes</strong>.</p>
                <p style="color: #64748b; font-size: 12px; margin-top: 30px;">If you didn't request this, please ignore this email.</p>
            </div>
        </div>
    `;
    
    const sent = await sendEmail(email, 'KULT - Your Verification Code', htmlContent);
    if (sent) {
        res.json({ success: true, message: "OTP sent to email" });
    } else {
        res.status(500).json({ error: "Failed to send OTP. Check email configuration." });
    }
});

app.post('/api/auth/verify-otp', async (req, res) => {
    const { email, otp, name } = req.body;
    
    if (!email || !otp) {
        return res.status(400).json({ error: "Email and OTP required" });
    }
    
    const emailKey = email.toLowerCase();
    const stored = otpStore.get(emailKey);
    
    if (!stored) {
        return res.status(400).json({ error: "No OTP requested. Please request a new code." });
    }
    
    if (Date.now() > stored.expiry) {
        otpStore.delete(emailKey);
        return res.status(400).json({ error: "OTP expired. Please request a new code." });
    }
    
    if (stored.otp !== otp) {
        return res.status(400).json({ error: "Invalid OTP" });
    }
    
    otpStore.delete(emailKey);
    const action = stored.action || 'login';
    
    try {
        if (action === 'signup') {
            const existingUser = await axios.get(`${NOCO_BASE_URL}/${TABLE_ID_USERS}`, {
                params: { where: `(Email,eq,${email.toLowerCase().trim()})` },
                headers: HEADERS
            });
            
            const existingList = existingUser.data.list || existingUser.data || [];
            if (existingList.length > 0) {
                return res.status(400).json({ error: "Email already registered. Please login instead." });
            }
            
            const userName = name || email.split('@')[0];
            const newUser = await axios.post(`${NOCO_BASE_URL}/${TABLE_ID_USERS}`, {
                "Email": email.toLowerCase().trim(),
                "Name": userName,
                "Role": "USER"
            }, { headers: HEADERS });
            
            const sessionToken = generateSessionToken();
            sessions.set(sessionToken, {
                userId: newUser.data.id,
                email: email.toLowerCase().trim(),
                role: 'USER',
                createdAt: Date.now()
            });
            
            res.json({ 
                success: true, 
                action: 'signup',
                token: sessionToken,
                user: {
                    id: newUser.data.id,
                    email: email.toLowerCase().trim(),
                    name: userName,
                    role: 'USER'
                }
            });
            
        } else {
            const userRes = await axios.get(`${NOCO_BASE_URL}/${TABLE_ID_USERS}`, {
                params: { where: `(Email,eq,${email.toLowerCase().trim()})` },
                headers: HEADERS
            });
            
            const userList = userRes.data.list || userRes.data || [];
            const users = Array.isArray(userList) ? userList : [userList];
            const user = users.find(u => u && u.Email && u.Email.toLowerCase() === email.toLowerCase().trim());
            
            if (!user) {
                return res.status(404).json({ 
                    error: "Account not found. Please sign up first.",
                    needsSignup: true 
                });
            }
            
            const sessionToken = generateSessionToken();
            sessions.set(sessionToken, {
                userId: user.Id || user.id,
                email: user.Email,
                role: user.Role || 'USER',
                createdAt: Date.now()
            });
            
            res.json({ 
                success: true, 
                action: 'login',
                token: sessionToken,
                user: {
                    id: user.Id || user.id,
                    email: user.Email,
                    name: user.Name,
                    role: user.Role || 'USER'
                }
            });
        }
    } catch (err) {
        console.error("Auth error:", err.message);
        res.status(500).json({ error: "Authentication failed. Please try again." });
    }
});

app.get('/api/auth/verify', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }
    
    const session = sessions.get(token);
    if (!session) {
        return res.status(401).json({ error: "Invalid or expired session" });
    }
    
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - session.createdAt > sevenDays) {
        sessions.delete(token);
        return res.status(401).json({ error: "Session expired" });
    }
    
    res.json({ 
        valid: true, 
        user: {
            userId: session.userId,
            email: session.email,
            role: session.role
        }
    });
});

app.post('/api/auth/logout', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token && sessions.has(token)) {
        sessions.delete(token);
    }
    
    res.json({ success: true });
});

// --- 5. HUBS & PROGRAMS ---

app.get('/api/hubs', async (req, res) => {
    try {
        const response = await axios.get(`${NOCO_BASE_URL}/${TABLE_ID_HUBS}`, { headers: HEADERS });
        res.json(response.data.list || response.data || []);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch hubs", details: err.message });
    }
});

app.post('/api/hubs', async (req, res) => {
    try {
        const response = await axios.post(`${NOCO_BASE_URL}/${TABLE_ID_HUBS}`, { ...req.body, Status: 'Active' }, { headers: HEADERS });
        await logActivity(`🏗️ NEW HUB DEPLOYED: ${req.body.Name?.toUpperCase()}`, "SYSTEM");
        res.json({ success: true, data: response.data });
    } catch (err) {
        res.status(500).json({ error: "Hub deployment failed" });
    }
});

app.post('/api/events', async (req, res) => {
    try {
        const {
            Name, Description, Category, start_time, end_time, Price, Hub_ID, Speaker, Poster, Itinerary, Redirect_Link, UPI_ID, DL_Protocol
        } = req.body;

        const normalizedPrice = typeof Price === 'string' ? (Price.trim().toUpperCase() === 'FREE' ? 'Free' : 'Paid') : Price;

        let payloadData = {
            "Title": Name, "Description": Description, "Category": Category, "Speaker": Speaker, "Poster": Poster, "Itinerary": Itinerary,
            "start_time": start_time, "end_time": end_time, "Price": normalizedPrice, "UPI_ID": UPI_ID || "", "DL_Protocol": DL_Protocol || "NO",
            "Hubs": Hub_ID ? [Hub_ID] : []
        };
        if (Redirect_Link) payloadData["Redirect_Link"] = Redirect_Link;

        const response = await axios.post(`${NOCO_BASE_URL}/${TABLE_ID_PROGRAMS}`, payloadData, { headers: HEADERS });
        await logActivity(`🚀 MISSION LIVE: ${Name?.toUpperCase()}`, "EVENT");
        res.json({ success: true, data: response.data });
    } catch (err) {
        res.status(500).json({ error: "Failed to host mission" });
    }
});

app.get('/api/hubs/:id/events', async (req, res) => {
    try {
        const response = await axios.get(`${NOCO_BASE_URL}/${TABLE_ID_PROGRAMS}`, {
            headers: HEADERS,
            params: { limit: 100, sort: '-Id' }
        });
        const allEvents = response.data.list || response.data || [];
        
        if (req.params.id === '0' || req.params.id === 'all') {
            res.json(allEvents);
        } else {
            const hubEvents = allEvents.filter(e => e.Hubs && e.Hubs.some(h => String(h.Id || h.id) === String(req.params.id)));
            res.json(hubEvents);
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch hub events" });
    }
});

// --- 6. USER ROLES & TOKENS ---

app.get('/api/user-role/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const response = await axios.get(`${NOCO_BASE_URL}/${TABLE_ID_USERS}`, {
            params: { where: `(Email,eq,${email.toLowerCase().trim()})` },
            headers: HEADERS
        });
        const list = response.data.list || response.data;
        res.json(Array.isArray(list) ? list[0] : list || { Role: 'USER' });
    } catch (err) { res.status(500).json({ Role: 'USER' }); }
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
        res.status(500).json({ error: "Failed to sync user" });
    }
});

app.post('/api/tokens/generate', async (req, res) => {
    try {
        const newToken = `KULT-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        await axios.post(`${NOCO_BASE_URL}/${TABLE_ID_TOKENS}`, { Token: newToken, Status: 'Unused' }, { headers: HEADERS });
        res.json({ success: true, token: newToken });
    } catch (err) { res.status(500).json({ error: "Token fail" }); }
});

// --- 7. POLLS & BOOKINGS ---

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

app.patch('/api/polls/:id/vote', async (req, res) => {
    try {
        const pollRes = await axios.get(`${NOCO_BASE_URL}/${TABLE_ID_POLLS}/${req.params.id}`, { headers: HEADERS });
        const currentVotes = pollRes.data[req.body.option] || 0;
        await axios.patch(`${NOCO_BASE_URL}/${TABLE_ID_POLLS}/${req.params.id}`, { [req.body.option]: currentVotes + 1 }, { headers: HEADERS });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Vote fail" }); }
});

app.post('/api/bookings', async (req, res) => {
    try {
        await axios.post(`${NOCO_BASE_URL}/${TABLE_ID_BOOKINGS}`, req.body, { headers: HEADERS });
        await logActivity(`🎟️ REGISTRATION: ${req.body.Name?.toUpperCase()} -> ${req.body.Event_Name?.toUpperCase()}`, "BOOKING");
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Booking fail" }); }
});

app.get('/api/bookings/event/:eventId', async (req, res) => {
    try {
        const response = await axios.get(`${NOCO_BASE_URL}/${TABLE_ID_BOOKINGS}`, {
            headers: HEADERS,
            params: { limit: 100, sort: '-Id' }
        });
        const allBookings = response.data.list || response.data || [];
        const eventBookings = allBookings.filter(b => String(b.Event_ID) === String(req.params.eventId));
        res.json(eventBookings);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch event bookings" });
    }
});

app.get('/api/organizer-events/:email', async (req, res) => {
    try {
        const response = await axios.get(`${NOCO_BASE_URL}/${TABLE_ID_PROGRAMS}`, {
            headers: HEADERS,
            params: { limit: 100, sort: '-Id' }
        });
        const allEvents = response.data.list || response.data || [];
        const myEvents = allEvents.filter(e => e.Organizer_Email === req.params.email);
        res.json(myEvents);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch organizer events" });
    }
});

// --- 8. FEATURED & NOTIFICATIONS ---

app.get('/api/featured-event', async (req, res) => {
    try {
        const response = await axios.get(`${NOCO_BASE_URL}/${TABLE_ID_PROGRAMS}`, {
            headers: HEADERS,
            params: { limit: 100, sort: '-Id' }
        });
        const events = response.data.list || response.data || [];
        const featured = events.find(e => e.Featured === true || e.Featured === 'true');
        res.json(featured || null);
    } catch (err) { res.json(null); }
});

app.post('/api/featured-event', async (req, res) => {
    try {
        const response = await axios.get(`${NOCO_BASE_URL}/${TABLE_ID_PROGRAMS}`, {
            headers: HEADERS,
            params: { where: '(Featured,eq,true)' }
        });
        const currentFeatured = response.data.list || response.data || [];
        for (const event of currentFeatured) {
            await axios.patch(`${NOCO_BASE_URL}/${TABLE_ID_PROGRAMS}/${event.Id || event.id}`, { Featured: false }, { headers: HEADERS });
        }
        if (req.body.eventId) {
            await axios.patch(`${NOCO_BASE_URL}/${TABLE_ID_PROGRAMS}/${req.body.eventId}`, { Featured: true }, { headers: HEADERS });
        }
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Failed to set featured event" }); }
});

app.get('/api/notifications', async (req, res) => {
    try {
        const response = await axios.get(`${NOCO_BASE_URL}/${TABLE_ID_NOTIFICATIONS}`, { 
            headers: HEADERS, 
            params: { limit: 50, sort: '-Id' } 
        });
        res.json(response.data.list || response.data || []);
    } catch (err) {
        res.json([{ Category: 'SYSTEM', Title: 'KULT ONLINE', Message: 'All systems operational.', Status: 'Active' }]);
    }
});

app.post('/api/notifications', async (req, res) => {
    try {
        const { category, title, message, authorName, authorRole } = req.body;
        await axios.post(`${NOCO_BASE_URL}/${TABLE_ID_NOTIFICATIONS}`, {
            "Category": category, "Title": title, "Message": message, "AuthorName": authorName, "AuthorRole": authorRole, "Status": "Active"
        }, { headers: HEADERS });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Notification fail" }); }
});

app.get('/api/activity', async (req, res) => {
    try {
        const response = await axios.get(`${NOCO_BASE_URL}/${TABLE_ID_ACTIVITY}`, { headers: HEADERS, params: { limit: 15, sort: '-Id' } });
        res.json(response.data.list || response.data || []);
    } catch (err) { res.status(500).json([]); }
});

app.get('/', (req, res) => res.send("🚀 KULT ENGINE MASTER IS ONLINE"));

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 KULT ENGINE MASTER - ONLINE ON PORT ${PORT}`);
});