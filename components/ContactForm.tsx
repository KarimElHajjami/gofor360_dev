
import React, { useState } from 'react';
import { Send, User, Package, MapPin } from 'lucide-react';

interface Props {
  onAdd: (contact: { phoneNumber: string; productName: string; oldAddress: string }) => void;
  disabled: boolean;
}

const ContactForm: React.FC<Props> = ({ onAdd, disabled }) => {
  const [phone, setPhone] = useState('');
  const [product, setProduct] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !product || !address) return;
    onAdd({ phoneNumber: phone, productName: product, oldAddress: address });
    setPhone('');
    setProduct('');
    setAddress('');
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-8">
        <h3 className="font-black text-slate-900 mb-8 flex items-center gap-3">
          <Send size={20} className="text-emerald-600" />
          New Campaign
        </h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Phone Destination</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+212 600-000000"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all text-sm outline-none font-medium"
                disabled={disabled}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Order Details</label>
            <div className="relative">
              <Package size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="Product Identifier"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all text-sm outline-none font-medium"
                disabled={disabled}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Source Address</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-4 top-4 text-slate-400" />
              <textarea
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                placeholder="Full delivery address to verify..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all text-sm outline-none resize-none font-medium"
                disabled={disabled}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={disabled}
            className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            <Send size={18} />
            Initialize AI Feed
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
