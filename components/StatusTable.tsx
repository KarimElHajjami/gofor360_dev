
import React, { useState } from 'react';
import { Contact, ContactStatus } from '../types';
import { MessageSquare, CheckCircle, Clock, Trash2, MapPin, Package, Phone, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  contacts: Contact[];
  onDelete: (id: string) => void;
  onViewConversation: (contact: Contact) => void;
}

const StatusTable: React.FC<Props> = ({ contacts, onDelete, onViewConversation }) => {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  const getStatusBadge = (status: ContactStatus) => {
    switch (status) {
      case ContactStatus.DONE:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-100">
            <CheckCircle size={12} strokeWidth={3} />
            Verified
          </span>
        );
      case ContactStatus.PENDING:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider border border-amber-100">
            <Clock size={12} strokeWidth={3} className="animate-spin-slow" />
            Active
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-wider border border-slate-200">
            Queued
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden h-full">
      <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-emerald-50/10">
        <div>
          <h3 className="font-black text-slate-900 text-lg tracking-tight">Active Corrections</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Real-time Data Stream</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Contact</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Details</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Address History</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">State</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-24 text-center">
                  <div className="max-w-xs mx-auto">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-300">
                      <MessageSquare size={32} />
                    </div>
                    <p className="text-sm font-bold text-slate-600">No campaigns found</p>
                    <p className="text-xs font-medium text-slate-400 mt-2">Adjust search or add a new entry.</p>
                  </div>
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <React.Fragment key={contact.id}>
                  <tr 
                    onClick={() => toggleRow(contact.id)}
                    className={`hover:bg-slate-50/80 transition-all group cursor-pointer ${expandedRowId === contact.id ? 'bg-emerald-50/30' : ''}`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 text-emerald-600 font-black text-xs">
                          {expandedRowId === contact.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                        <div>
                          <div className="font-black text-slate-900 tracking-tight">{contact.phoneNumber}</div>
                          <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">
                            Live Session
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-700">{contact.productName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1.5 max-w-[200px]">
                        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                          <MapPin size={10} className="text-rose-400" />
                          <span className="truncate line-through opacity-60">{contact.oldAddress}</span>
                        </div>
                        {contact.newAddress && (
                          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 bg-emerald-50/50 px-2.5 py-1.5 rounded-xl border border-emerald-100/50">
                            <MapPin size={10} />
                            <span className="truncate">{contact.newAddress}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {getStatusBadge(contact.status)}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); onViewConversation(contact); }}
                          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10 active:scale-95"
                        >
                          <MessageSquare size={14} />
                          Open Chat
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete(contact.id); }}
                          className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRowId === contact.id && (
                    <tr className="bg-emerald-50/10">
                      <td colSpan={5} className="px-8 py-8 border-b border-slate-100">
                        <div className="max-w-4xl space-y-4">
                           <div className="flex items-center justify-between mb-4">
                              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Conversation History</h4>
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 uppercase tracking-tighter">
                                Last updated: {new Date(contact.lastUpdated).toLocaleTimeString()}
                              </span>
                           </div>
                           <div className="space-y-4 bg-white/50 p-6 rounded-[1.5rem] border border-slate-100">
                             {contact.conversation.map((msg, i) => (
                               <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                                 <div className={`max-w-[80%] p-3 rounded-2xl text-xs shadow-sm ${msg.role === 'user' ? 'bg-slate-100 text-slate-700 rounded-tl-none' : 'bg-emerald-600 text-white rounded-tr-none'}`}>
                                    <p className="leading-relaxed">{msg.content}</p>
                                    <div className={`text-[9px] mt-1.5 font-bold uppercase tracking-widest ${msg.role === 'user' ? 'text-slate-400' : 'text-emerald-100'}`}>
                                      {new Date(msg.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                 </div>
                               </div>
                             ))}
                           </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      <style>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default StatusTable;
