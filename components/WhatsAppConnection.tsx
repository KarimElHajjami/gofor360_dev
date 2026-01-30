
import React, { useState } from 'react';
import { WhatsAppSession } from '../types';
import { Smartphone, RefreshCw, LogOut, QrCode } from 'lucide-react';

interface Props {
  session: WhatsAppSession;
  onConnect: () => void;
  onDisconnect: () => void;
}

const WhatsAppConnection: React.FC<Props> = ({ session, onConnect, onDisconnect }) => {
  const [isLinking, setIsLinking] = useState(false);

  const handleLink = () => {
    setIsLinking(true);
    setTimeout(() => {
      onConnect();
      setIsLinking(false);
    }, 3000);
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${session.isConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
              <Smartphone size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 tracking-tight">System Link</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {session.isConnected ? `Active: ${session.phoneNumber}` : 'Device Not Synced'}
              </p>
            </div>
          </div>
        </div>

        {!session.isConnected ? (
          <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-[1.5rem] bg-slate-50">
            {isLinking ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-40 h-40 bg-white p-4 rounded-2xl shadow-sm flex items-center justify-center">
                  <QrCode size={120} className="text-slate-300 animate-pulse" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Session...</p>
              </div>
            ) : (
              <div className="text-center px-6">
                <QrCode size={40} className="mx-auto text-slate-200 mb-6" />
                <button
                  onClick={handleLink}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                  <RefreshCw size={18} />
                  Authorize Link
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-3">
                <span className="text-slate-400">Status</span>
                <span className="text-emerald-600">Excellent</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                <span className="text-slate-400">Node Sync</span>
                <span className="text-slate-900">Synchronized</span>
              </div>
            </div>
            <button
              onClick={onDisconnect}
              className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-100 px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <LogOut size={16} />
              Terminate Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppConnection;
