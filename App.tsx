
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StudyHub from './components/StudyHub';
import Timetable from './components/Timetable';
import Assistant from './components/Assistant';
import QuickReviseView from './components/QuickReviseView';
import PreviousPapersView from './components/PreviousPapersView';
import Auth from './components/Auth';
import { Note, Reminder } from './types';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notes, setNotes] = useState<Note[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: '1', text: 'Math II Assignment Due', date: 'Today, 5 PM', isCompleted: false },
    { id: '2', text: 'Review Data Structures Notes', date: 'Tomorrow, 9 AM', isCompleted: false },
    { id: '3', text: 'Download Hall Ticket', date: 'In 3 days', isCompleted: true },
  ]);

  // OWNER CHECK: Strictly restricted to Baddam Vaishnavi's roll number AND the isAdmin flag from login
  const isAdmin = currentUser?.rollNo?.toUpperCase() === '24R01A05K9' && currentUser?.isAdmin === true;

  useEffect(() => {
    const savedUser = localStorage.getItem('prepmaster_session');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }

    const savedNotes = localStorage.getItem('prepmaster_notes');
    if (savedNotes) setNotes(JSON.parse(savedNotes));
  }, []);

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('prepmaster_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('prepmaster_session');
  };

  const handleAddNote = (newNote: Note) => {
    if (!isAdmin) {
      alert("Unauthorized: Only Baddam Vaishnavi (Owner) has permission to publish study materials.");
      return;
    }
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    localStorage.setItem('prepmaster_notes', JSON.stringify(updatedNotes));
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, isCompleted: !r.isCompleted } : r));
  };

  if (!isLoggedIn) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard reminders={reminders} onToggleReminder={toggleReminder} />;
      case 'notes':
        return <StudyHub notes={notes} onAddNote={handleAddNote} isAdmin={isAdmin} />;
      case 'previous-papers':
        return <PreviousPapersView notes={notes} onAddNote={handleAddNote} isAdmin={isAdmin} />;
      case 'schedule':
        return <Timetable />;
      case 'assistant':
        return <Assistant />;
      case 'last-minute':
        return (
          <QuickReviseView 
            notes={notes} 
            onAddNote={handleAddNote} 
            onNavigateToHub={() => setActiveTab('notes')} 
          />
        );
      default:
        return <Dashboard reminders={reminders} onToggleReminder={toggleReminder} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 capitalize tracking-tight flex items-center gap-3">
            {activeTab === 'notes' ? 'Study Hub' : 
             activeTab === 'last-minute' ? 'Quick Revise' : 
             activeTab === 'previous-papers' ? 'Previous Papers' :
             activeTab.replace('-', ' ')}
            {activeTab === 'assistant' && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg">BETA</span>}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {activeTab === 'last-minute' ? 'High-weightage concepts for last-minute cramming.' : 
             activeTab === 'previous-papers' ? 'Pattern-verified university question bank.' :
             'Empowering your academic growth with AI.'}
          </p>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={handleLogout}
             title="Logout"
             className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 shadow-sm transition-all"
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
           </button>
           <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-2xl border border-slate-200 shadow-sm">
             <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-inner">
               {currentUser?.name?.substring(0, 1).toUpperCase() || 'S'}
             </div>
             <div className="hidden sm:block text-right">
               <p className="text-sm font-bold text-slate-800 leading-tight flex items-center justify-end gap-2">
                {currentUser?.name}
                {isAdmin && <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest shadow-sm">OWNER</span>}
               </p>
               <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">{currentUser?.rollNo}</p>
             </div>
           </div>
        </div>
      </div>
      <div className="animate-slideUp">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;
