
import React from 'react';
import { Reminder } from '../types';

interface DashboardProps {
  reminders: Reminder[];
  onToggleReminder: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ reminders, onToggleReminder }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <p className="text-slate-500 text-sm font-medium">Exam Progress</p>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-4xl font-bold text-indigo-600">65%</span>
            <span className="text-slate-400 mb-1 text-sm font-medium">Syllabus Covered</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-indigo-600 h-full w-[65%] rounded-full"></div>
          </div>
        </div>

        <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg text-white">
          <p className="text-indigo-100 text-sm font-medium">Days Until Final</p>
          <div className="mt-4 text-4xl font-bold">14 Days</div>
          <p className="mt-2 text-indigo-200 text-sm italic">Focus: Mathematics II</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm font-medium">Next Mock Test</p>
          <div className="mt-4 font-bold text-xl">Computer Networks</div>
          <p className="text-slate-400 text-sm mt-1">Tomorrow, 10:00 AM</p>
          <button className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors">
            View Syllabus
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications/Reminders */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Notifications & Alerts</h2>
            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-lg font-bold">4 NEW</span>
          </div>
          <div className="space-y-4">
            {reminders.map(reminder => (
              <div key={reminder.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors group">
                <input 
                  type="checkbox" 
                  checked={reminder.isCompleted} 
                  onChange={() => onToggleReminder(reminder.id)}
                  className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${reminder.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {reminder.text}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{reminder.date}</p>
                </div>
              </div>
            ))}
            {reminders.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-8">No active reminders. You're all caught up!</p>
            )}
          </div>
        </div>

        {/* Quick Access Grid */}
        <div className="bg-slate-900 p-6 rounded-3xl shadow-xl text-white">
          <h2 className="text-lg font-bold mb-6">College Resources</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 p-4 rounded-2xl hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Papers</p>
              <p className="text-sm font-bold mt-1">Previous Years</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-2xl hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Lab</p>
              <p className="text-sm font-bold mt-1">Practical Manuals</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-2xl hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Schedule</p>
              <p className="text-sm font-bold mt-1">Exam Timetable</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-2xl hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Admin</p>
              <p className="text-sm font-bold mt-1">Faculty Portal</p>
            </div>
          </div>
          <div className="mt-8 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl">
            <p className="text-xs font-semibold text-indigo-400 uppercase">Faculty Announcement</p>
            <p className="text-sm mt-2">Dr. Sharma has uploaded New Sample Tests for Data Structures. Check Study Hub!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
