
import React from 'react';
import { Note, NoteType } from '../types';

interface QuickReviseViewProps {
  notes: Note[];
  onAddNote: (note: Note) => void;
  onNavigateToHub: () => void;
}

const QuickReviseView: React.FC<QuickReviseViewProps> = ({ notes, onAddNote, onNavigateToHub }) => {
  // Aggregate all quick revise materials
  const allFormulas = notes.flatMap(n => n.formulas);
  const allDefinitions = notes.flatMap(n => n.definitions);
  const quickReviseNotes = notes.filter(n => n.type === NoteType.QUICK_REVISE);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-indigo-900 text-white p-10 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            Last Minute Quick Revise
          </h2>
          <p className="text-indigo-200 text-lg">Your automated focus board. Formulas, definitions, and critical concepts from all your materials, distilled for exam eve.</p>
          <div className="mt-8 flex gap-4">
             <button 
               onClick={onNavigateToHub}
               className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors"
             >
               Upload Imp. Material
             </button>
             <button className="bg-indigo-800 text-indigo-100 px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors border border-indigo-700">
               Generate Flashcards
             </button>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" className="h-full w-full"><circle cx="100" cy="50" r="50" fill="white" /></svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulas Wall */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
              Essential Formulas
            </h3>
            <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-lg text-slate-500">{allFormulas.length} TOTAL</span>
          </div>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {allFormulas.length > 0 ? (
              allFormulas.map((f, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-800 font-mono text-center shadow-sm hover:shadow-md transition-shadow">
                  {f}
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-10">Upload notes in the Study Hub to extract formulas automatically.</p>
            )}
          </div>
        </div>

        {/* Definitions Bank */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              Key Definitions
            </h3>
            <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-lg text-slate-500">{allDefinitions.length} ENTRIES</span>
          </div>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {allDefinitions.length > 0 ? (
              allDefinitions.map((d, i) => (
                <div key={i} className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-slate-800 text-sm leading-relaxed border-l-4 border-l-amber-400">
                  {d}
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-10">Key definitions will appear here once you upload lecture materials.</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Revise Specific Uploads */}
      {quickReviseNotes.length > 0 && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Important Notes (Marked ★)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
             {quickReviseNotes.map(note => (
               <div key={note.id} className="p-5 border border-slate-100 rounded-2xl bg-white shadow-sm hover:border-indigo-300 transition-colors">
                  <p className="text-[10px] font-bold text-indigo-500 uppercase">{note.subject}</p>
                  <h4 className="font-bold text-slate-800 mt-1 mb-2">{note.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-3">{note.content}</p>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickReviseView;
