import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<void>;
  loading: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, loading }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onLogin(formData.get('username') as string, formData.get('password') as string);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white border border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]"
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tighter uppercase italic leading-none">iAttendance</h1>
          <p className="text-[11px] opacity-50 font-mono mt-2 tracking-widest bg-[#141414] text-white inline-block px-2">AUTH REQUIRED</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-mono opacity-50 mb-1">Access ID</label>
            <input 
              name="username"
              type="text" 
              required
              className="w-full bg-[#f9f9f9] border border-[#141414] p-3 focus:outline-none focus:ring-1 focus:ring-[#141414] font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-mono opacity-50 mb-1">Security Key</label>
            <input 
              name="password"
              type="password" 
              required
              className="w-full bg-[#f9f9f9] border border-[#141414] p-3 focus:outline-none focus:ring-1 focus:ring-[#141414] font-mono"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#141414] text-white py-4 uppercase font-bold tracking-[0.2em] hover:bg-[#333] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <LogIn size={18} />
            {loading ? 'Authenticating...' : 'Authorize'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
