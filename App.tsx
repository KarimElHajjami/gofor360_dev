
import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, 
  Settings, 
  LayoutDashboard, 
  Database, 
  Bell, 
  User,
  X,
  Send,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  LogOut,
  Smartphone,
  Search,
  Menu,
  Sparkles
} from 'lucide-react';
import { Contact, ContactStatus, WhatsAppSession, Message, Page, AppSettings } from './types';
import WhatsAppConnection from './components/WhatsAppConnection';
import ContactForm from './components/ContactForm';
import StatusTable from './components/StatusTable';
import SettingsPage from './components/SettingsPage';
import Login from './components/Login';
import DisconnectedPopup from './components/DisconnectedPopup';
import { processWhatsAppMessage } from './services/geminiService';

const generateRandomKey = () => {
  return [...Array(32)].map(() => (~~(Math.random() * 36)).toString(36)).join('').toUpperCase();
};

const DEFAULT_TEMPLATE = "Hello! We're preparing to ship your order for \"{productName}\". We noticed the delivery address provided (\"{oldAddress}\") seems incorrect. Could you please provide the correct address?";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [session, setSession] = useState<WhatsAppSession>({ isConnected: false, requestsCount: 0 });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mockMessageInput, setMockMessageInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showDisconnectPopup, setShowDisconnectPopup] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings>({
    webhookUrl: '',
    autoDeleteDone: false,
    geminiApiKey: '',
    inboundApiKey: generateRandomKey(),
    initialMessageTemplate: DEFAULT_TEMPLATE
  });

  const [sessionDuration, setSessionDuration] = useState('00:00:00');

  const selectedContact = useMemo(() => 
    contacts.find(c => c.id === selectedContactId) || null
  , [contacts, selectedContactId]);

  useEffect(() => {
    if (!session.isConnected || !session.connectedAt) return;
    const interval = setInterval(() => {
      const start = new Date(session.connectedAt!).getTime();
      const now = new Date().getTime();
      const diff = now - start;
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setSessionDuration(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [session.isConnected, session.connectedAt]);

  const filteredContacts = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return contacts.filter(c => 
      c.phoneNumber.toLowerCase().includes(s) ||
      c.productName.toLowerCase().includes(s) ||
      c.oldAddress.toLowerCase().includes(s) ||
      (c.newAddress && c.newAddress.toLowerCase().includes(s)) ||
      c.conversation.some(m => m.content.toLowerCase().includes(s))
    );
  }, [contacts, searchTerm]);

  const metrics = useMemo(() => {
    const total = contacts.length;
    const pending = contacts.filter(c => c.status === ContactStatus.PENDING).length;
    const done = contacts.filter(c => c.status === ContactStatus.DONE).length;
    const successRate = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, pending, done, successRate };
  }, [contacts]);

  useEffect(() => {
    const saved = localStorage.getItem('gofor360_state_v4');
    if (saved) {
      const data = JSON.parse(saved);
      setContacts(data.contacts || []);
      setSettings(prev => ({ ...prev, ...(data.settings || {}) }));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gofor360_state_v4', JSON.stringify({ contacts, settings }));
  }, [contacts, settings]);

  const handleConnect = () => {
    setSession({
      isConnected: true,
      phoneNumber: '+212 661-001122',
      connectedAt: new Date().toISOString(),
      requestsCount: session.requestsCount
    });
    setShowDisconnectPopup(false);
  };

  const handleDisconnect = () => {
    setSession({ ...session, isConnected: false });
    setShowDisconnectPopup(true);
  };

  const triggerWebhook = async (contact: Contact) => {
    if (!settings.webhookUrl) return;
    console.log(`[Production Webhook] Dispatching verified data for ${contact.phoneNumber} to ${settings.webhookUrl}`);
  };

  const addContact = async (data: { phoneNumber: string; productName: string; oldAddress: string }) => {
    let initialPrompt = settings.initialMessageTemplate || DEFAULT_TEMPLATE;
    initialPrompt = initialPrompt
      .replace(/{productName}/g, data.productName)
      .replace(/{oldAddress}/g, data.oldAddress);
    
    const newContact: Contact = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      status: ContactStatus.PENDING,
      lastUpdated: new Date().toISOString(),
      conversation: [
        { role: 'model', content: initialPrompt, timestamp: new Date().toISOString() }
      ]
    };

    setContacts(prev => [newContact, ...prev]);
    setSession(s => ({ ...s, requestsCount: s.requestsCount + 1 }));
  };

  const handleUserReply = async (contactId: string, text: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact || contact.status === ContactStatus.DONE) return;

    const userMsg: Message = { role: 'user', content: text, timestamp: new Date().toISOString() };
    const updatedHistory = [...contact.conversation, userMsg];
    
    setContacts(prev => prev.map(c => 
      c.id === contactId ? { ...c, conversation: updatedHistory, lastUpdated: new Date().toISOString() } : c
    ));

    setIsAiProcessing(true);
    try {
      const result = await processWhatsAppMessage(updatedHistory, contact.productName, contact.oldAddress);
      
      let aiResponseText = "";
      let foundNewAddress = "";

      if (result.functionCalls?.[0]?.name === 'updateAddress') {
        foundNewAddress = (result.functionCalls[0].args as any).address;
        aiResponseText = `Thank you! I've updated the delivery address for your ${contact.productName} to: ${foundNewAddress}. We'll handle the rest.`;
      } else {
        aiResponseText = result.text || "Could you please clarify your address?";
      }

      const modelMsg: Message = { role: 'model', content: aiResponseText, timestamp: new Date().toISOString() };

      setContacts(prev => prev.map(c => {
        if (c.id === contactId) {
          const updated = { 
            ...c, 
            conversation: [...c.conversation, modelMsg],
            status: foundNewAddress ? ContactStatus.DONE : ContactStatus.PENDING,
            newAddress: foundNewAddress || c.newAddress,
            lastUpdated: new Date().toISOString()
          };
          if (foundNewAddress) triggerWebhook(updated);
          return updated;
        }
        return c;
      }));
    } catch (err) {
      console.error('Gemini Logic Error:', err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleResetInboundKey = () => {
    setSettings(prev => ({ ...prev, inboundApiKey: generateRandomKey() }));
  };

  if (!isAuthenticated) return <Login onLogin={() => setIsAuthenticated(true)} />;

  const Navigation = () => (
    <nav className="flex-1 px-6 py-4 space-y-2">
      <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active={currentPage === 'dashboard'} onClick={() => { setCurrentPage('dashboard'); setIsMobileMenuOpen(false); }} />
      <NavItem icon={<MessageSquare size={20}/>} label="Live Feed" active={currentPage === 'campaigns'} onClick={() => { setCurrentPage('campaigns'); setIsMobileMenuOpen(false); }} />
      <NavItem icon={<Settings size={20}/>} label="Configuration" active={currentPage === 'settings'} onClick={() => { setCurrentPage('settings'); setIsMobileMenuOpen(false); }} />
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc]">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="relative w-72 bg-[#0f172a] text-white flex flex-col h-full animate-in slide-in-from-left duration-300">
            <div className="p-6">
               <div className="w-full bg-white rounded-[2rem] p-6 flex items-center justify-center shadow-2xl">
                <img src="https://gofor360.it/cdn/shop/files/Logo.png" alt="gofor360" className="h-12 object-contain" />
              </div>
            </div>
            <Navigation />
            <div className="p-6 mt-auto">
              <button onClick={() => setIsAuthenticated(false)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-500/10 text-rose-400 font-bold uppercase text-xs">
                <LogOut size={16} /> Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 bg-[#0f172a] text-white flex-col shadow-2xl z-10 sticky top-0 h-screen">
        <div className="p-6">
          <div className="w-full bg-white rounded-[1.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center border border-white/10">
            <img src="https://gofor360.it/cdn/shop/files/Logo.png" alt="gofor360" className="h-10 object-contain" />
          </div>
        </div>

        <Navigation />

        <div className="p-6">
          <div className="bg-slate-800/40 rounded-2xl p-5 border border-white/5 backdrop-blur-sm space-y-4">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Active Number</span>
              <p className="text-sm font-bold text-white truncate">{session.isConnected ? session.phoneNumber : 'No Link'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Uptime</span>
                <p className="text-xs font-bold text-emerald-400">{session.isConnected ? sessionDuration : '00:00'}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Total Hits</span>
                <p className="text-xs font-bold text-emerald-400">{session.requestsCount}</p>
              </div>
            </div>
            <button onClick={() => setIsAuthenticated(false)} className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-700/50 hover:bg-rose-500/20 hover:text-rose-400 transition-all text-xs font-black uppercase tracking-widest text-slate-400">
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 px-6 md:px-10 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-black text-slate-900 capitalize tracking-tight hidden sm:block">{currentPage}</h2>
          </div>
          
          <div className="flex-1 max-w-md mx-4 md:mx-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search database..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!session.isConnected && (
              <button 
                onClick={() => setShowDisconnectPopup(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-[10px] font-black uppercase"
              >
                <Smartphone size={14} /> Offline
              </button>
            )}
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 font-black text-sm">AR</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-[#f8fafc]/50">
          {currentPage === 'dashboard' && (
            <div className="space-y-10">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard icon={<TrendingUp className="text-emerald-600"/>} label="Campaigns" value={metrics.total.toString()} trend="+24h" />
                <StatCard icon={<Clock className="text-amber-600"/>} label="Live Feed" value={metrics.pending.toString()} />
                <StatCard icon={<CheckCircle className="text-emerald-600"/>} label="Verified" value={metrics.done.toString()} />
                <StatCard icon={<AlertCircle className="text-rose-600"/>} label="Success Rate" value={`${metrics.successRate}%`} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-1 space-y-8">
                  <WhatsAppConnection session={session} onConnect={handleConnect} onDisconnect={handleDisconnect} />
                  <ContactForm onAdd={addContact} disabled={!session.isConnected} />
                </div>
                <div className="xl:col-span-2">
                  <StatusTable 
                    contacts={filteredContacts} 
                    onDelete={(id) => setContacts(prev => prev.filter(c => c.id !== id))} 
                    onViewConversation={(c) => setSelectedContactId(c.id)} 
                  />
                </div>
              </div>
            </div>
          )}

          {currentPage === 'campaigns' && (
             <div className="space-y-6">
                <StatusTable 
                  contacts={filteredContacts} 
                  onDelete={(id) => setContacts(prev => prev.filter(c => c.id !== id))} 
                  onViewConversation={(c) => setSelectedContactId(c.id)} 
                />
             </div>
          )}

          {currentPage === 'settings' && (
            <SettingsPage 
              settings={settings} 
              onSave={(s) => { setSettings(s); }} 
              onResetInboundKey={handleResetInboundKey}
            />
          )}
        </div>
      </main>

      <DisconnectedPopup 
        isOpen={showDisconnectPopup} 
        onClose={() => setShowDisconnectPopup(false)} 
        onRelink={() => { setShowDisconnectPopup(false); setCurrentPage('dashboard'); }} 
      />

      {/* Chat Slide-over with Prominent AI Indicator */}
      {selectedContact && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#075e54] text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg border border-white/10">
                  {selectedContact.phoneNumber.slice(-2)}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{selectedContact.phoneNumber}</h3>
                  <p className="text-xs text-emerald-100 font-medium opacity-80">{selectedContact.productName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedContactId(null)} className="p-2 hover:bg-black/10 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 bg-[#e5ddd5] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]">
              {selectedContact.conversation.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] p-3.5 rounded-xl text-sm shadow-sm relative ${msg.role === 'user' ? 'bg-white text-slate-700 rounded-tl-none' : 'bg-[#dcf8c6] text-slate-800 rounded-tr-none'}`}>
                    <p className="leading-relaxed">{msg.content}</p>
                    <p className="text-[10px] text-slate-400 mt-1.5 text-right font-medium">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
              {isAiProcessing && (
                <div className="flex justify-end animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white/95 backdrop-blur-md px-6 py-4 rounded-3xl rounded-tr-none shadow-2xl border border-emerald-100/50 flex flex-col gap-3 min-w-[200px] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 animate-pulse" />
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Sparkles size={18} className="text-emerald-500 animate-spin-slow" />
                        <div className="absolute inset-0 bg-emerald-400 blur-lg opacity-20 animate-pulse" />
                      </div>
                      <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Processing Logic</span>
                    </div>
                    <div className="flex items-center gap-2 pl-1">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-duration:1s]" />
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.4s]" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 animate-pulse">Gemini 3 Flash Pro</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-[#f0f2f5]">
              {selectedContact.status === ContactStatus.DONE ? (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3 text-emerald-800">
                  <CheckCircle size={20} /><p className="text-sm font-bold">Address verified successfully. Webhook triggered.</p>
                </div>
              ) : (
                <form className="flex gap-3" onSubmit={(e) => { e.preventDefault(); if (!mockMessageInput || isAiProcessing) return; handleUserReply(selectedContact.id, mockMessageInput); setMockMessageInput(''); }}>
                  <input autoFocus type="text" value={mockMessageInput} onChange={(e) => setMockMessageInput(e.target.value)} disabled={isAiProcessing} placeholder="Type customer reply..." className="flex-1 px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm" />
                  <button type="submit" disabled={!mockMessageInput || isAiProcessing} className="p-4 bg-[#075e54] text-white rounded-2xl hover:bg-[#054d44] transition-all shadow-lg active:scale-95"><Send size={22} /></button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
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

const NavItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 ${active ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}`}>
    <span className={active ? 'text-white' : 'text-slate-500'}>{icon}</span>{label}
  </button>
);

const StatCard = ({ icon, label, value, trend }: { icon: any, label: string, value: string, trend?: string }) => (
  <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
    <div className="flex items-start justify-between mb-3">
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">{icon}</div>
      {trend && <span className="hidden sm:inline-block text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 uppercase tracking-tighter">{trend}</span>}
    </div>
    <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{value}</p>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
  </div>
);

export default App;
