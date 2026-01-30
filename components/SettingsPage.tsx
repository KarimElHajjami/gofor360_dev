
import React from 'react';
import { Globe, Shield, Save, Key, Code, Terminal, Copy, Check, RefreshCw, MessageSquare } from 'lucide-react';
import { AppSettings } from '../types';

interface Props {
  settings: AppSettings;
  onSave: (s: AppSettings) => void;
  onResetInboundKey: () => void;
}

const SettingsPage: React.FC<Props> = ({ settings, onSave, onResetInboundKey }) => {
  const [localSettings, setLocalSettings] = React.useState(settings);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const apiDoc = `
curl -X POST https://api.gofor360.com/v1/initiate \\
  -H "Content-Type: application/json" \\
  -H "X-API-KEY: ${settings.inboundApiKey}" \\
  -d '{
    "phone": "+212600000000",
    "product": "iPhone 15 Pro",
    "address": "123 Incorrect St"
  }'
  `;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm h-fit">
          <div className="p-8 border-b border-slate-100 flex items-center gap-4 bg-emerald-50/30">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
              <Globe size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">System Configuration</h3>
              <p className="text-sm font-medium text-slate-500">Manage integrations and AI parameters</p>
            </div>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Shield size={16} className="text-emerald-500" />
                Inbound API Access Key
              </label>
              <div className="flex gap-2">
                <input
                  readOnly
                  type="text"
                  value={settings.inboundApiKey}
                  className="flex-1 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:outline-none"
                />
                <button
                  onClick={onResetInboundKey}
                  className="p-4 bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-600 rounded-2xl transition-all"
                  title="Generate New Random Key"
                >
                  <RefreshCw size={20} />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Randomly generated. Required for Inbound API calls.</p>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Key size={16} className="text-emerald-500" />
                Gemini Pro API Key
              </label>
              <input
                type="password"
                value={localSettings.geminiApiKey}
                onChange={(e) => setLocalSettings({...localSettings, geminiApiKey: e.target.value})}
                placeholder="••••••••••••••••••••••••••••••"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Globe size={16} className="text-emerald-500" />
                Webhook Endpoint URL
              </label>
              <input
                type="url"
                value={localSettings.webhookUrl}
                onChange={(e) => setLocalSettings({...localSettings, webhookUrl: e.target.value})}
                placeholder="https://api.yourcompany.com/callback"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <p className="text-sm font-bold text-slate-700">Auto-Archive Corrections</p>
                <p className="text-[11px] text-slate-500">Clear from active view once verified</p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.autoDeleteDone}
                onChange={(e) => setLocalSettings({...localSettings, autoDeleteDone: e.target.checked})}
                className="w-6 h-6 accent-emerald-600 cursor-pointer"
              />
            </div>

            <button
              onClick={() => onSave(localSettings)}
              className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95"
            >
              <Save size={18} />
              Update Configuration
            </button>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm h-fit">
              <div className="p-8 border-b border-slate-100 flex items-center gap-4 bg-emerald-50/30">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Message Templates</h3>
                  <p className="text-sm font-medium text-slate-500">Customize outgoing user interactions</p>
                </div>
              </div>
              <div className="p-8 space-y-4">
                <label className="block text-sm font-bold text-slate-700">Initiate Correction Message</label>
                <textarea
                  value={localSettings.initialMessageTemplate}
                  onChange={(e) => setLocalSettings({...localSettings, initialMessageTemplate: e.target.value})}
                  rows={4}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none font-medium leading-relaxed"
                  placeholder="Type your template..."
                />
                <div className="flex flex-wrap gap-2">
                   <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200">
                     {'{productName}'}
                   </div>
                   <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200">
                     {'{oldAddress}'}
                   </div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-2">
                  Placeholders will be automatically replaced with live order details.
                </p>
              </div>
           </div>

           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Code size={120} />
            </div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                  <Terminal size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black tracking-tight">API Documentation</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Inbound Route: /api/v1/initiate</p>
                </div>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-2xl p-6 font-mono text-[11px] leading-loose relative">
                <button 
                  onClick={() => copyToClipboard(apiDoc)}
                  className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-slate-400" />}
                </button>
                <pre className="text-emerald-500 whitespace-pre-wrap">{apiDoc}</pre>
              </div>

              <div className="p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Required Auth Header</p>
                <p className="text-[11px] text-slate-400 font-mono">
                  X-API-KEY: {settings.inboundApiKey}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
