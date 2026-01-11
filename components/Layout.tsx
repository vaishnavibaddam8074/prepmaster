
import React from 'react';
import { ICONS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: ICONS.Dashboard },
    { id: 'notes', name: 'Study Hub', icon: ICONS.Notes },
    { id: 'previous-papers', name: 'Previous Papers', icon: ICONS.Paper },
    { id: 'schedule', name: 'Exam Schedule', icon: ICONS.Calendar },
    { id: 'last-minute', name: 'Quick Revise', icon: ICONS.LastMinute },
    { id: 'assistant', name: 'AI Assistant', icon: ICONS.Assistant },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-indigo-950 text-white hidden md:flex flex-col z-50">
        <div className="p-8">
          <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-2">
            <span className="bg-indigo-500 p-1.5 rounded-lg text-sm">PM</span>
            PrepMaster
          </h1>
          <p className="text-indigo-400 text-[10px] mt-2 uppercase tracking-[0.2em] font-bold">University Portal</p>
        </div>

        <nav className="mt-6 flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/20' 
                  : 'text-indigo-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                <item.icon />
              </span>
              <span className="font-bold text-sm">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Designed & Managed By</p>
            <p className="text-xs font-bold text-white mt-1">Baddam Vaishnavi</p>
            <p className="text-[9px] text-indigo-500 font-medium">Roll: 24R01A05K9</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-10 min-h-screen flex flex-col">
        <header className="mb-8 flex justify-between items-center bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 md:hidden">
           <div className="flex items-center gap-2">
              <span className="bg-indigo-600 p-1.5 rounded-lg text-white font-black text-xs">PM</span>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">PrepMaster</h1>
           </div>
           <button className="p-2 bg-slate-50 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
           </button>
        </header>
        
        <div className="flex-1">
          {children}
        </div>

        <footer className="mt-20 pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-[11px] font-bold uppercase tracking-widest pb-10">
          <p>© 2024 PrepMaster Portal — 24R01A05K9</p>
          <div className="flex gap-6">
            <span className="text-slate-300">Developed by Baddam Vaishnavi</span>
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Faculty Support</a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Layout;
