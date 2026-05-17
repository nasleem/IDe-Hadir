import React from 'react';
import { Navigation, CheckCircle2, XCircle } from 'lucide-react';

interface GeofenceIndicatorProps {
  distance: number | null;
  isWithinRange: boolean;
  accuracy?: number;
  radius: number;
}

export const GeofenceIndicator: React.FC<GeofenceIndicatorProps> = ({ distance, isWithinRange, accuracy, radius }) => {
  return (
    <div className="bg-white border border-[#141414] p-6 shadow-[4px_4px_0px_rgba(20,20,20,0.1)]">
      <div className="flex items-center gap-2 mb-4">
        <Navigation size={18} className="opacity-50" />
        <h3 className="text-xs font-bold uppercase tracking-widest opacity-50">Local Scanning</h3>
      </div>
      
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
          <span>Target Radius: {radius}m</span>
          <span>Accur: {accuracy ? `${Math.round(accuracy)}m` : '-'}</span>
        </div>
      </div>
    </div>
  );
};
