
import React, { useState } from 'react';
import { ExamSchedule } from '../types';
import { generateSchedule } from '../services/geminiService';

const Timetable: React.FC = () => {
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [subjects, setSubjects] = useState("Data Structures, Discrete Mathematics, Computer Networks, DBMS");

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const subjectList = subjects.split(",").map(s => s.trim());
      const result = await generateSchedule(subjectList, "2024-05-15");
      setSchedules(result.map((r: any, i: number) => ({
        id: i.toString(),
        ...r
      })));
    } catch (err) {
      console.error(err);
      alert("Scheduling error. Check network.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Automated Exam Scheduler</h2>
          <p className="text-slate-500 mb-6 text-sm">Our AI calculates the optimal schedule based on course complexity and room availability.</p>
          
          <div className="flex flex-col gap-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subjects to Schedule (Comma separated)</label>
            <input 
              type="text" 
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`py-3 rounded-xl font-bold transition-all ${
                isGenerating ? 'bg-slate-200 text-slate-500 cursor-wait' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
              }`}
            >
              {isGenerating ? 'Computing Optimal Schedule...' : 'Generate New Timetable'}
            </button>
          </div>
        </div>

        {schedules.length > 0 && (
          <div className="mt-10 overflow-hidden border border-slate-100 rounded-2xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-600">Subject</th>
                  <th className="px-6 py-4 font-bold text-slate-600">Date</th>
                  <th className="px-6 py-4 font-bold text-slate-600">Time Slot</th>
                  <th className="px-6 py-4 font-bold text-slate-600">Examination Hall</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {schedules.map(exam => (
                  <tr key={exam.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{exam.subject}</td>
                    <td className="px-6 py-4 text-slate-600">{exam.date}</td>
                    <td className="px-6 py-4 font-medium text-indigo-600 bg-indigo-50/50">{exam.timeSlot}</td>
                    <td className="px-6 py-4 text-slate-600">{exam.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 flex items-start gap-4">
        <div className="p-3 bg-amber-100 rounded-2xl text-amber-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
        </div>
        <div>
          <h4 className="font-bold text-amber-900">Important Note on Scheduling</h4>
          <p className="text-amber-800 text-sm mt-1">This schedule is optimized for academic institution efficiency. Personal requests can be submitted through the Admin portal for real-time adjustments.</p>
        </div>
      </div>
    </div>
  );
};

export default Timetable;
