import React from 'react';
import { History as HistoryIcon, Clock, LogOut, RefreshCcw } from 'lucide-react';
import { AttendanceRecord } from '../types';

interface HistoryPageProps {
  logs: AttendanceRecord[];
  onRefresh: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ logs, onRefresh }) => {
  return (
    <div className="bg-white border border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
      <div className="p-4 border-b border-[#141414] bg-[#141414] text-white flex justify-between items-center">
        <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <HistoryIcon size={14} /> Transaction History
        </h3>
        <button onClick={onRefresh} className="hover:rotate-180 transition-transform duration-500">
          <RefreshCcw size={16} />
        </button>
      </div>
      
      <div className="divide-y divide-[#141414]">
        {logs.length > 0 ? (
          logs.map((log) => (
            <div key={log.id} className="p-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-2 border border-[#141414] ${log.type === 'IN' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {log.type === 'IN' ? <Clock size={16} /> : <LogOut size={16} />}
                </div>
                <div>
                  <p className="text-sm font-bold uppercase italic tracking-tight">Clock {log.type}</p>
                  <p className="text-[10px] font-mono opacity-50 uppercase">{new Date(log.time).toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono border border-[#141414] px-2 py-0.5 uppercase tracking-tighter">
                  {log.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-16 text-center text-[#141414] opacity-30 italic font-serif">
            No secure transactions found in iDempiere repository.
          </div>
        )}
      </div>
    </div>
  );
};
