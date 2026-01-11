
import React, { useState } from 'react';

interface AuthProps {
  onLogin: (user: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  // OWNER CONSTANTS
  const OWNER_ROLL = '24R01A05K9';
  const OWNER_PASS = 'V8074234386';
  const OWNER_EMAIL = 'Vaishnavibaddam8074@gmail.com';
  const OWNER_NAME = 'Baddam Vaishnavi';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, rollNo, email, password } = formData;
    
    if (!name || !rollNo || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Protect the Owner's Roll Number
    if (rollNo.toUpperCase() === OWNER_ROLL) {
      setError('This roll number is managed by the App Owner. Please login or use a different roll number.');
      return;
    }
    
    const users = JSON.parse(localStorage.getItem('prepmaster_users') || '[]');
    if (users.find((u: any) => u.rollNo.toUpperCase() === rollNo.toUpperCase())) {
      setError('Roll number already registered. Please login.');
      return;
    }

    users.push({ ...formData, rollNo: rollNo.toUpperCase(), isAdmin: false });
    localStorage.setItem('prepmaster_users', JSON.stringify(users));
    alert('Registration successful! Use your roll number to login.');
    setIsRegistering(false);
    setError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const { rollNo, password } = formData;
    const normalizedRoll = rollNo.toUpperCase();

    // 1. OWNER AUTHENTICATION
    if (normalizedRoll === OWNER_ROLL && password === OWNER_PASS) {
      onLogin({
        name: OWNER_NAME,
        rollNo: OWNER_ROLL,
        email: OWNER_EMAIL,
        isAdmin: true // This property unlocks the Upload buttons
      });
      return;
    }

    // 2. SAMPLE STUDENT AUTHENTICATION (as requested)
    if (normalizedRoll === OWNER_ROLL && password === OWNER_ROLL) {
      onLogin({
        name: OWNER_NAME,
        rollNo: OWNER_ROLL,
        email: "24R01A05K9@gmail.com",
        isAdmin: false // This restricts upload access
      });
      return;
    }

    // 3. REGULAR REGISTERED USERS
    const users = JSON.parse(localStorage.getItem('prepmaster_users') || '[]');
    const user = users.find((u: any) => u.rollNo.toUpperCase() === normalizedRoll && u.password === password);
    
    if (user) {
      onLogin({ ...user, isAdmin: false });
    } else {
      setError('Invalid Roll Number or Password. If you are the owner, use your secret password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 overflow-hidden animate-fadeIn">
        <div className="bg-indigo-950 p-10 text-white text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30">
             <span className="text-2xl font-black">PM</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">PrepMaster</h1>
          <p className="text-indigo-300 mt-2 font-medium opacity-80">
            {isRegistering ? 'New Student Onboarding' : 'Student & Owner Login'}
          </p>
        </div>
        
        <div className="p-10">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-bold flex items-center gap-2 animate-slideUp">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-5">
            {isRegistering && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Baddam Vaishnavi"
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Roll Number</label>
              <input
                type="text"
                name="rollNo"
                placeholder="24R01A05K9"
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300"
                value={formData.rollNo}
                onChange={handleChange}
              />
            </div>

            {isRegistering && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="24R01A05K9@gmail.com"
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.password}
                onChange={handleChange}
              />
              {!isRegistering && (
                 <p className="text-[10px] text-slate-400 mt-2 ml-1 italic">Sample password: 24R01A05K9</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all transform active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
            >
              {isRegistering ? 'Register & Join' : 'Dashboard Access'}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm font-medium">
              {isRegistering ? 'Back to login?' : "Need an account?"}
              <button
                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                className="ml-2 text-indigo-600 font-extrabold hover:text-indigo-800 transition-colors"
              >
                {isRegistering ? 'Login here' : 'Register now'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
