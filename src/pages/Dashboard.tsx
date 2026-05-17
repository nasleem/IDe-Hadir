import React from 'react';
import { User as UserIcon, Clock, LogOut } from 'lucide-react';
import { GeofenceIndicator } from '../components/GeofenceIndicator';
import { User } from '../types';

interface DashboardProps {
  user: User | null;
  distance: number | null;
  isWithinRange: boolean;
  accuracy?: number;
  radius: number;
  loading: boolean;
  onClock: (type: 'IN' | 'OUT') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  distance, 
  isWithinRange, 
  accuracy, 
  radius, 
  loading, 
  onClock 
}) => {
  return (
    <div className="space-y-6">
      {/* Profile Summary */}
      <div className="bg-white border border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
        <div className="flex items-start justify-between">
          <div className="flex gap-4 items-center">
            <div className="bg-[#141414] text-white p-3 rotate-3 shadow-[4px_4px_0px_rgba(20,20,20,0.2)]">
              <UserIcon size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase italic">{user?.name}</h2>
              <p className="text-[10px] font-mono opacity-50 uppercase mt-1">
                Ref: {user?.employeeValue || 'N/A'} // Loc: Remote Access
              </p>
            </div>
          </div>
          <div className="bg-[#141414] text-white text-[10px] px-3 py-1 font-mono uppercase font-bold">
            {user?.shift || 'No active shift'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Geofence Status */}
        <GeofenceIndicator 
          distance={distance} 
          isWithinRange={isWithinRange} 
          accuracy={accuracy} 
          radius={radius} 
        />

        {/* Action Buttons */}
        <div className="space-y-3">
          <button 
            onClick={() => onClock('IN')}
            disabled={!isWithinRange || loading}
            className={`w-full py-6 flex items-center justify-center gap-4 text-xl font-bold uppercase tracking-[0.2em] transition-all border-2 border-[#141414] shadow-[6px_6px_0px_rgba(20,20,20,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-30 disabled:grayscale
              ${isWithinRange ? 'bg-white text-[#141414] hover:bg-gray-50' : 'bg-[#E4E3E0]'}`}
          >
            <Clock size={24} /> Clock In
          </button>
          
          <button 
            onClick={() => onClock('OUT')}
            disabled={!isWithinRange || loading}
            className="w-full py-6 flex items-center justify-center gap-4 text-xl font-bold uppercase tracking-[0.2em] transition-all bg-[#141414] text-white border-2 border-[#141414] shadow-[6px_6px_0px_rgba(20,20,20,0.3)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-30 disabled:grayscale"
          >
            <LogOut size={24} /> Clock Out
          </button>
          
          {!isWithinRange && !loading && (
            <p className="text-[10px] font-mono text-red-600 uppercase text-center font-bold animate-pulse">
              [ ACCESS DENIED: Outside Permitted Perimeter ]
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
