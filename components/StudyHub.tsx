
import React, { useState, useRef } from 'react';
import { Note, Priority, NoteType } from '../types';
import { summarizeNotes } from '../services/geminiService';

interface StudyHubProps {
  notes: Note[];
  onAddNote: (note: Note) => void;
  isAdmin: boolean;
}

const StudyHub: React.FC<StudyHubProps> = ({ notes, onAddNote, isAdmin }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [uploadText, setUploadText] = useState("");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [noteType, setNoteType] = useState<NoteType>(NoteType.LECTURE_NOTE);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleUpload = async () => {
    if (!isAdmin) return;
    if ((!uploadText && !selectedFile) || !title || !subject) {
      alert("Please provide a title, subject, and either text or a file.");
      return;
    }

    setIsUploading(true);
    try {
      let fileData = undefined;
      let extraText = uploadText;

      if (selectedFile) {
        if (selectedFile.type.startsWith('image/')) {
          const base64 = await fileToBase64(selectedFile);
          fileData = { data: base64, mimeType: selectedFile.type };
        } else if (selectedFile.type === 'text/plain' || selectedFile.name.endsWith('.txt') || selectedFile.name.endsWith('.md')) {
          const text = await selectedFile.text();
          extraText += "\n\n--- Content from uploaded file ---\n" + text;
        } else if (selectedFile.type === 'application/pdf') {
           const base64 = await fileToBase64(selectedFile);
           fileData = { data: base64, mimeType: 'application/pdf' };
        } else {
          alert("Direct PPT/Word parsing requires server-side processing. For best results, please save as PDF or copy-paste text here.");
          setIsUploading(false);
          return;
        }
      }

      const aiResult = await summarizeNotes(extraText, fileData);
      const newNote: Note = {
        id: Date.now().toString(),
        title,
        subject,
        type: noteType,
        content: aiResult.summary,
        facultyName: "Faculty Document",
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
      setUploadText("");
      setTitle("");
      setSubject("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      alert("Analysis failed. Try simplifying the content or using clear images.");
    } finally {
      setIsUploading(false);
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.CRITICAL: return 'bg-red-100 text-red-700 border-red-200';
      case Priority.IMPORTANT: return 'bg-orange-100 text-orange-700 border-orange-200';
      case Priority.LESS_IMPORTANT: return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityStar = (priority: Priority) => {
    const count = priority === Priority.CRITICAL ? 3 : priority === Priority.IMPORTANT ? 2 : 1;
    return "★".repeat(count);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Upload Section - Only for Admin */}
      {isAdmin && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-indigo-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Owner Upload: College Materials</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
             <input 
              type="text" 
              placeholder="Subject Name" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
             />
             <input 
              type="text" 
              placeholder="Document Title" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
             />
             <select 
               value={noteType}
               onChange={(e) => setNoteType(e.target.value as NoteType)}
               className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium text-slate-700"
             >
               <option value={NoteType.LECTURE_NOTE}>Lecture Notes</option>
               <option value={NoteType.PREVIOUS_YEAR_PAPER}>Previous Year Paper</option>
               <option value={NoteType.QUICK_REVISE}>Quick Revise (Imp. Only)</option>
             </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paste Text Content</label>
              <textarea 
                placeholder="Paste content from PPT, Word, or your notes here..."
                className="w-full h-40 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
                value={uploadText}
                onChange={(e) => setUploadText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upload File (PDF/Image)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all p-4 text-center"
              >
                {selectedFile ? (
                  <div className="text-indigo-600 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <p className="text-sm truncate max-w-[200px] font-bold">{selectedFile.name}</p>
                    <button className="text-xs text-red-500 mt-2 hover:underline" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>Change file</button>
                  </div>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                    <p className="text-sm text-slate-500">Click to upload documents<br/><span className="text-xs text-slate-400">Owner restricted area</span></p>
                  </>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*,text/plain,.md,.pdf"
              />
            </div>
          </div>

          <button 
            onClick={handleUpload}
            disabled={isUploading}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              isUploading ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
            }`}
          >
            {isUploading ? (
              <>
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                Analyzing Material...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/><path d="m9 10 3-3 3 3"/><path d="M12 3v11"/></svg>
                Upload & Share with Students
              </>
            )}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Notes List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 px-2">Knowledge Repository</h3>
          {notes.map(note => (
            <div 
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                selectedNote?.id === note.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-100 hover:border-indigo-100'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg border uppercase tracking-tighter ${
                      note.type === NoteType.PREVIOUS_YEAR_PAPER ? 'bg-purple-100 text-purple-700 border-purple-200' : 
                      note.type === NoteType.QUICK_REVISE ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                    }`}>
                      {note.type}
                    </span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{note.subject}</p>
                  </div>
                  <h4 className="font-bold text-slate-800 mt-1">{note.title}</h4>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{note.dateUploaded}</span>
              </div>
            </div>
          ))}
          {notes.length === 0 && (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
               <p className="text-slate-400 text-sm">No notes shared by the owner yet.</p>
            </div>
          )}
        </div>

        {/* Note Detail */}
        <div className="lg:col-span-2">
          {selectedNote ? (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-8 animate-fadeIn">
              <div className="flex justify-between items-center pb-6 border-bottom border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-md">{selectedNote.type}</span>
                    <span className="text-xs font-bold text-slate-400">{selectedNote.subject}</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-slate-900">{selectedNote.title}</h2>
                </div>
                <button className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                </button>
              </div>

              <div className="prose prose-slate max-w-none">
                <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                  AI Analysis Summary
                </h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedNote.content}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                   <h4 className="font-bold text-amber-800 mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                      Quick Revise Info
                   </h4>
                   <div className="space-y-4">
                      {selectedNote.formulas.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-amber-600 uppercase mb-1">Formulas</p>
                          <ul className="list-disc list-inside text-sm text-amber-900 space-y-1">
                            {selectedNote.formulas.map((f, i) => <li key={i}>{f}</li>)}
                          </ul>
                        </div>
                      )}
                      {selectedNote.definitions.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-amber-600 uppercase mb-1">Definitions</p>
                          <ul className="list-disc list-inside text-sm text-amber-900 space-y-1">
                            {selectedNote.definitions.map((d, i) => <li key={i}>{d}</li>)}
                          </ul>
                        </div>
                      )}
                   </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-4">Weightage Questions</h4>
                  <div className="space-y-3">
                    {selectedNote.importantQuestions.map((iq) => (
                      <div key={iq.id} className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start gap-3">
                          <p className="text-sm font-medium text-slate-700">{iq.question}</p>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg border flex items-center gap-1 shrink-0 ${getPriorityColor(iq.priority)}`}>
                             {getPriorityStar(iq.priority)} {iq.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200 min-h-[400px]">
              <p className="text-lg font-medium">Select a shared file to view the smart revision content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyHub;
