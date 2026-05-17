import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LogIn, 
  MapPin, 
  Clock, 
  History, 
  User as UserIcon, 
  CheckCircle2, 
  XCircle,
  RefreshCcw,
  LogOut,
  Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useGeolocation } from './hooks/useGeolocation';
import { User, AttendanceRecord } from './types';

// Constants from environment
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

  const { location, error: geoError, distance } = useGeolocation(OFFICE_LOCATION);

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

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      const res = await axios.post('/api/login', { username, password });
      const { token: newToken, user: userData } = res.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
    } catch (err: any) {
      alert('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const handleClockIn = async (type: 'IN' | 'OUT') => {
    if (!isWithinRange) {
      alert('You are outside the required area!');
      return;
    }
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
      alert(`Clock ${type} successful!`);
    } catch (err) {
      alert('Failed to record attendance');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center p-4 font-sans text-[#141414]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white border border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]"
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tighter uppercase italic">iAttendance</h1>
            <p className="text-sm opacity-50 font-mono">IDEMPIERE INTEGRATED SYSTEM</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-mono opacity-50 mb-1">Username</label>
              <input 
                name="username"
                type="text" 
                required
                className="w-full bg-transparent border-b border-[#141414] py-2 focus:outline-none focus:border-b-2 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-mono opacity-50 mb-1">Password</label>
              <input 
                name="password"
                type="password" 
                required
                className="w-full bg-transparent border-b border-[#141414] py-2 focus:outline-none focus:border-b-2 font-mono"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#141414] text-[#E4E3E0] py-4 uppercase font-bold tracking-widest hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              {loading ? 'Authenticating...' : 'System Login'}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-[#141414] border-dashed">
            <p className="text-[10px] uppercase font-mono opacity-40 leading-relaxed text-center">
              Internal access only. Geolocation verification required for all operations.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-white">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 flex justify-between items-center bg-white sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tighter uppercase italic leading-none">iAttendance</h1>
          <p className="text-[10px] font-mono opacity-50 uppercase mt-1">Status: System Online // {user?.name}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 border border-[#141414] hover:bg-[#141414] hover:text-white transition-colors"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setView('dashboard')}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest border transition-all ${view === 'dashboard' ? 'bg-[#141414] text-white border-[#141414] shadow-[4px_4px_0px_rgba(20,20,20,0.2)]' : 'bg-white border-[#141414] opacity-50'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setView('history')}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest border transition-all ${view === 'history' ? 'bg-[#141414] text-white border-[#141414] shadow-[4px_4px_0px_rgba(20,20,20,0.2)]' : 'bg-white border-[#141414] opacity-50'}`}
          >
            History
          </button>
        </div>

        <AnimatePresence mode="wait">
          {view === 'dashboard' ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Profile Card */}
              <div className="bg-white border border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-4 items-center">
                    <div className="bg-[#141414] text-white p-3">
                      <UserIcon size={32} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold uppercase italic">{user?.name}</h2>
                      <p className="text-[11px] font-mono opacity-50 uppercase">ID: {user?.bpartnerId} // {user?.employeeValue || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-[#141414] text-white text-[10px] px-2 py-1 font-mono uppercase">
                      {user?.shift || 'Flexible Shift'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Action Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Geolocation Info */}
                <div className="bg-white border border-[#141414] p-6 shadow-[4px_4px_0px_rgba(20,20,20,0.1)]">
                  <div className="flex items-center gap-2 mb-4">
                    <Navigation size={18} className="opacity-50" />
                    <h3 className="text-xs font-bold uppercase tracking-widest opacity-50">Local Scanning</h3>
                  </div>
                  
                  {geoError ? (
                    <div className="text-red-500 text-xs font-mono bg-red-50 p-3 border border-red-200">
                      Error: {geoError}. Please enable GPS.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-end border-b border-[#141414] border-dotted pb-2">
                        <div>
                          <p className="text-[10px] uppercase font-mono opacity-50">Distance to Office</p>
                          <p className="text-2xl font-mono">{distance !== null ? `${Math.round(distance)}m` : 'Scanning...'}</p>
                        </div>
                        <div className={`p-1 mb-1 rounded-full ${isWithinRange ? 'bg-green-500' : 'bg-red-500'}`}>
                          {isWithinRange ? <CheckCircle2 size={16} className="text-white" /> : <XCircle size={16} className="text-white" />}
                        </div>
                      </div>
                      <div className="flex justify-between text-[10px] font-mono opacity-50">
                        <span>Min Range: {GEOFENCE_RADIUS}m</span>
                        <span>Precision: {location?.accuracy ? `${Math.round(location.accuracy)}m` : '-'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Clock Actions */}
                <div className="space-y-4">
                  <button 
                    onClick={() => handleClockIn('IN')}
                    disabled={!isWithinRange || loading}
                    className={`w-full py-6 flex items-center justify-center gap-4 text-xl font-bold uppercase tracking-[0.2em] transition-all border-[#141414] border-2 shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] disabled:opacity-30 disabled:cursor-not-allowed disabled:grayscale
                      ${isWithinRange ? 'bg-white text-[#141414] hover:bg-[#141414] hover:text-white' : 'bg-[#E4E3E0] text-[#141414]'}`}
                  >
                    <Clock size={28} />
                    Clock In
                  </button>
                  <button 
                    onClick={() => handleClockIn('OUT')}
                    disabled={!isWithinRange || loading}
                    className="w-full py-6 flex items-center justify-center gap-4 text-xl font-bold uppercase tracking-[0.2em] transition-all bg-[#141414] text-white border-2 border-[#141414] shadow-[6px_6px_0px_0px_rgba(228,227,224,0.5)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] disabled:opacity-30 disabled:cursor-not-allowed disabled:grayscale"
                  >
                    <LogOut size={28} />
                    Clock Out
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white border border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] overflow-hidden"
            >
              <div className="p-4 border-b border-[#141414] flex justify-between items-center bg-[#141414] text-white">
                <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <History size={14} /> Attendance Logs
                </h3>
                <button onClick={fetchAttendance} className="hover:rotate-180 transition-transform duration-500">
                  <RefreshCcw size={14} />
                </button>
              </div>
              <div className="divide-y divide-[#141414]">
                {attendanceLogs.length > 0 ? (
                  attendanceLogs.map((log) => (
                    <div key={log.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 ${log.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {log.type === 'IN' ? <Clock size={16} /> : <LogOut size={16} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold uppercase italic">Clock {log.type}</p>
                          <p className="text-[10px] font-mono opacity-50">{new Date(log.time).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 border border-blue-200 uppercase">
                          {log.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-[#141414] opacity-30 italic">
                    No logs recorded in system.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <footer className="mt-auto p-8 border-t border-[#141414] mt-12 bg-white">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono opacity-40 uppercase tracking-widest">
          <p>© 2026 iAttendance Security. v1.0.4 r21</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><MapPin size={10} /> Lat: {location?.lat.toFixed(4) || '--'}</span>
            <span className="flex items-center gap-1"><MapPin size={10} /> Lng: {location?.lng.toFixed(4) || '--'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
