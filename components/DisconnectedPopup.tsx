
import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRelink: () => void;
}

const DisconnectedPopup: React.FC<Props> = ({ isOpen, onClose, onRelink }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-amber-100">
            <AlertTriangle size={40} className="text-amber-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Connection Lost</h3>
          <p className="text-slate-500 font-medium leading-relaxed mb-8">
            The WhatsApp session has been disconnected. Automated address validation is currently paused. Please relink your device to continue.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={onRelink}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-600/20 transition-all active:scale-95"
            >
              <RefreshCw size={18} />
              Relink WhatsApp Now
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisconnectedPopup;
