
import React, { useState, useRef } from 'react';
import { Note, NoteType, Priority } from '../types';
import { summarizeNotes } from '../services/geminiService';

interface PreviousPapersViewProps {
  notes: Note[];
  onAddNote: (note: Note) => void;
  isAdmin: boolean;
}

const PreviousPapersView: React.FC<PreviousPapersViewProps> = ({ notes, onAddNote, isAdmin }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const paperNotes = notes.filter(n => n.type === NoteType.PREVIOUS_YEAR_PAPER);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleUpload = async () => {
    if (!isAdmin) return;
    if (!subject || !year || !selectedFile) {
      alert("Please provide subject, year, and a file.");
      return;
    }

    setIsUploading(true);
    try {
      let fileData = undefined;
      if (selectedFile.type.startsWith('image/')) {
        const base64 = await fileToBase64(selectedFile);
        fileData = { data: base64, mimeType: selectedFile.type };
      } else if (selectedFile.type === 'application/pdf') {
        const base64 = await fileToBase64(selectedFile);
        fileData = { data: base64, mimeType: 'application/pdf' };
      } else {
        alert("Please upload an image or PDF for automated paper analysis.");
        setIsUploading(false);
        return;
      }

      const aiResult = await summarizeNotes(`This is a previous year question paper for ${subject} year ${year}. Identify key recurring questions and structure them.`, fileData);
      
      const newNote: Note = {
        id: Date.now().toString(),
        title: `${subject} - Year ${year}`,
        subject,
        type: NoteType.PREVIOUS_YEAR_PAPER,
        content: aiResult.summary,
        facultyName: "University Archive",
        dateUploaded: new Date().toLocaleDateString(),
        importantQuestions: aiResult.importantQuestions.map((q: any) => ({
          id: Math.random().toString(),
          question: q.question,
          priority: q.priority
        })),
        formulas: aiResult.formulas,
        definitions: aiResult.definitions
      };

      onAddNote(newNote);
      setSubject("");
      setYear("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      alert("Failed to process the question paper. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Dedicated Paper Upload Card - Only for Admin */}
      {isAdmin && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-indigo-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Owner Archive: Question Papers</h2>
              <p className="text-slate-500 text-sm">Upload university papers for student revision analysis.</p>
            </div>
            <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Owner Access Only
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Subject</label>
              <input 
                type="text" 
                placeholder="e.g., OS"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Year</label>
              <input 
                type="text" 
                placeholder="e.g., 2024"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 lg:col-span-1">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">File</label>
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className={`w-full px-4 py-3 rounded-xl border border-dashed text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                   selectedFile ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                 }`}
               >
                 {selectedFile ? (
                   <span className="truncate max-w-[150px]">{selectedFile.name}</span>
                 ) : (
                   "Select PDF/Image"
                 )}
               </button>
               <input 
                 type="file" 
                 className="hidden" 
                 ref={fileInputRef} 
                 onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                 accept=".pdf,image/*"
               />
            </div>
            <button 
              disabled={isUploading}
              onClick={handleUpload}
              className={`w-full py-3 rounded-xl font-bold transition-all shadow-md ${
                isUploading ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isUploading ? 'Uploading...' : 'Publish to Student App'}
            </button>
          </div>
        </div>
      )}

      {/* Shared Papers Grid - Visible to All */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paperNotes.map(paper => (
          <div key={paper.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col group">
            <div className="flex justify-between items-start mb-4">
               <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
               </div>
               <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg uppercase tracking-wider">Pattern Verified</span>
            </div>
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-tighter mb-1">{paper.subject}</p>
            <h4 className="text-lg font-bold text-slate-900 mb-4">{paper.title}</h4>
            
            <div className="space-y-2 mb-6 flex-1">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Topic Weightage</p>
               <div className="space-y-2">
                 {paper.importantQuestions.slice(0, 3).map((q, i) => (
                   <div key={i} className="text-xs text-slate-600 line-clamp-2 p-2 bg-slate-50 rounded-lg border border-slate-100 italic">
                     "{q.question}"
                   </div>
                 ))}
               </div>
            </div>

            <button className="w-full py-2 bg-slate-50 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
              View AI Analysis
            </button>
          </div>
        ))}

        {paperNotes.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400">
             <p className="text-lg font-medium">No previous papers archived yet.</p>
             <p className="text-sm">Papers uploaded by Baddam Vaishnavi will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviousPapersView;
