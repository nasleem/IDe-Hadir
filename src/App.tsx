/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'motion/react';

// Types & Hooks
import { User, AttendanceRecord } from './types';
import { useGeolocation } from './hooks/useGeolocation';

// Components & Pages
import { Layout } from './components/Layout';
import { LoginPage } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { HistoryPage } from './pages/History';

// Constants
const OFFICE_LOCATION = {
  lat: parseFloat(process.env.OFFICE_LAT || '-6.200000'),
  lng: parseFloat(process.env.OFFICE_LNG || '106.816666')
};
const GEOFENCE_RADIUS = parseFloat(process.env.GEOFENCE_RADIUS_METERS || '100');

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'dashboard' | 'history'>('dashboard');
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);

  const { location, distance } = useGeolocation(OFFICE_LOCATION);
  const isWithinRange = distance !== null && distance <= GEOFENCE_RADIUS;

  useEffect(() => {
    if (token) {
      fetchUser();
      fetchAttendance();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch (err) {
      handleLogout();
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await axios.get('/api/attendance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendanceLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch attendance');
    }
  };

  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/login', { username, password });
      const { token: newToken, user: userData } = res.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
    } catch (err) {
      alert('Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const handleClock = async (type: 'IN' | 'OUT') => {
    if (!isWithinRange) return;
    setLoading(true);
    try {
      await axios.post('/api/attendance', {
        type,
        lat: location?.lat,
        lng: location?.lng,
        bpartnerId: user?.bpartnerId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAttendance();
      alert(`Success: Recorded Clock ${type}`);
    } catch (err) {
      alert('Error recording transaction to iDempiere');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <LoginPage onLogin={handleLogin} loading={loading} />;
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setView('dashboard')}
          className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest border transition-all ${view === 'dashboard' ? 'bg-[#141414] text-white' : 'bg-white border-[#141414] opacity-50'}`}
        >
          Operations
        </button>
        <button 
          onClick={() => setView('history')}
          className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest border transition-all ${view === 'history' ? 'bg-[#141414] text-white' : 'bg-white border-[#141414] opacity-50'}`}
        >
          Audit Log
        </button>
      </div>

      <AnimatePresence mode="wait">
        {view === 'dashboard' ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Dashboard 
              user={user}
              distance={distance}
              isWithinRange={isWithinRange}
              accuracy={location?.accuracy}
              radius={GEOFENCE_RADIUS}
              loading={loading}
              onClock={handleClock}
            />
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <HistoryPage logs={attendanceLogs} onRefresh={fetchAttendance} />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
