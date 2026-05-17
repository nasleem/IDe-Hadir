import React from 'react';
import { LogOut } from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans">
      <header className="border-b border-[#141414] p-6 flex justify-between items-center bg-white sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tighter uppercase italic leading-none">iAttendance</h1>
          <p className="text-[10px] font-mono opacity-50 uppercase mt-1">
            Status: System Online // {user?.name || 'Authorized Access Only'}
          </p>
        </div>
        {user && (
          <button 
            onClick={onLogout}
            className="p-2 border border-[#141414] hover:bg-[#141414] hover:text-white transition-colors"
          >
            <LogOut size={20} />
          </button>
        )}
      </header>
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        {children}
      </main>
      <footer className="p-8 border-t border-[#141414] mt-12 bg-white text-[10px] font-mono opacity-40 uppercase tracking-widest text-center">
        © 2026 iAttendance Security. Built for Web, Android & iOS
      </footer>
    </div>
  );
};
