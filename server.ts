import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper for iDempiere requests
const idempiereRequest = async (method: string, endpoint: string, data?: any, token?: string) => {
  const url = `${process.env.IDEMPIERE_URL}${endpoint}`;
  try {
    const config: any = {
      method,
      url,
      headers: {
        'Accept': 'application/json',
      },
    };
    if (data) config.data = data;
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    
    const response = await axios(config);
    return response.data;
  } catch (error: any) {
    console.error(`iDempiere Error (${endpoint}):`, error.response?.data || error.message);
    throw error;
  }
};

// API: Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!process.env.IDEMPIERE_URL || process.env.IDEMPIERE_URL.includes('your-idempiere-url')) {
     // Mock login for demo if not configured
     if (username && password) {
       return res.json({
         token: 'mock-token-' + Date.now(),
         user: {
           id: 1000001,
           name: 'Demo Employee',
           bpartnerId: 1000005
         }
       });
     }
  }

  try {
    const loginData = {
      userName: username,
      password: password,
      clientId: parseInt(process.env.IDEMPIERE_CLIENT_ID || '0'),
      roleId: parseInt(process.env.IDEMPIERE_ROLE_ID || '0'),
      orgId: parseInt(process.env.IDEMPIERE_ORG_ID || '0'),
    };
    
    // iDempiere standard auth endpoint
    const authResponse = await idempiereRequest('POST', '/auth/login', loginData);
    res.json(authResponse);
  } catch (error: any) {
    res.status(401).json({ error: 'Login failed', details: error.response?.data });
  }
});

// API: Get Employee Data (C_BPartner)
app.get('/api/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  if (token.startsWith('mock-token')) {
    return res.json({
      C_BPartner_ID: 1000005,
      Name: 'Demo Employee',
      EmployeeValue: 'EMP001',
      Shift: 'Morning Shift'
    });
  }

  try {
    // Usually we get AD_User first then C_BPartner
    const partners = await idempiereRequest('GET', '/models/C_BPartner?$filter=IsEmployee eq \'Y\'', null, token);
    res.json(partners.records?.[0] || {});
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch employee data' });
  }
});

// API: Attendance
app.get('/api/attendance', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  if (token.startsWith('mock-token')) {
    return res.json([
      { id: 1, type: 'IN', time: new Date(Date.now() - 3600000 * 4).toISOString(), status: 'Success' },
      { id: 2, type: 'OUT', time: new Date(Date.now() - 3600000 * 2).toISOString(), status: 'Success' },
    ]);
  }

  try {
    // Fetch from custom table XX_Attendance
    const attendance = await idempiereRequest('GET', '/models/XX_Attendance?$orderby=Created desc', null, token);
    res.json(attendance.records || []);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch attendance history' });
  }
});

app.post('/api/attendance', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { type, lat, lng, bpartnerId } = req.body;

  if (token.startsWith('mock-token')) {
    return res.json({ success: true, id: Date.now() });
  }

  try {
    const data = {
      C_BPartner_ID: bpartnerId,
      AttendanceType: type, // 'IN' or 'OUT'
      Latitude: lat,
      Longitude: lng,
      Status: 'Verified',
      CheckTime: new Date().toISOString()
    };
    const response = await idempiereRequest('POST', '/models/XX_Attendance', data, token);
    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to record attendance' });
  }
});

async function startServer() {
  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
