
import React, { useState, useEffect, useRef } from 'react';
import { getAIAnswer } from '../services/geminiService';
import { LANGUAGES } from '../constants';

const Assistant: React.FC = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState("English");
  
  const recognitionRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleAsk(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }

    // Cleanup speech synthesis on unmount
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleAsk = async (textOverride?: string) => {
    const q = textOverride || query;
    if (!q) return;

    // Cancel any previous activities
    handleStop();

    setIsLoading(true);
    setResponse("");
    
    try {
      const res = await getAIAnswer(q, language);
      setResponse(res);
      
      // Start Text to Speech
      const utterance = new SpeechSynthesisUtterance(res);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error(err);
      setResponse("I encountered an error. Please try asking in a different way.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    // Stop API call (UI side)
    setIsLoading(false);
    
    // Stop Speech Recognition
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    // Stop Speech Synthesis
    if (window.speechSynthesis.speaking || isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    handleStop(); // Stop current speaking before listening
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      alert("Speech recognition is not supported in this browser.");
    }
  };

  const isAnyProcessRunning = isLoading || isListening || isSpeaking;

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex flex-col items-center text-center mb-10 relative">
          <div className={`p-6 rounded-full transition-all duration-500 ${isListening ? 'bg-red-100 text-red-600 scale-110 shadow-lg' : isSpeaking ? 'bg-indigo-100 text-indigo-600 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-6">PrepAI Assistant</h2>
          <p className="text-slate-500 mt-2">Voice-enabled multilingual exam expert.</p>
          
          {isAnyProcessRunning && (
            <button 
              onClick={handleStop}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-bold border border-red-100 hover:bg-red-100 transition-colors"
            >
              <div className="w-2.5 h-2.5 bg-red-600 rounded-sm"></div>
              Stop Processing
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
          >
            {LANGUAGES.map(lang => <option key={lang.code} value={lang.name}>{lang.name}</option>)}
          </select>
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Ask anything about your syllabus..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
              className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none pr-14"
            />
            <button 
              onClick={startListening}
              className={`absolute right-2 top-2 p-2 rounded-lg transition-colors ${isListening ? 'text-red-600' : 'text-slate-400 hover:text-indigo-600'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
            </button>
          </div>
          
          {isAnyProcessRunning ? (
             <button 
              onClick={handleStop}
              className="px-6 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-md flex items-center gap-2"
            >
              <div className="w-3 h-3 bg-white rounded-sm"></div>
              Stop
            </button>
          ) : (
            <button 
              onClick={() => handleAsk()}
              className="px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md"
            >
              Ask
            </button>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center py-10">
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Generating Answer...</p>
            </div>
          </div>
        )}

        {response && !isLoading && (
          <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl animate-slideUp">
             <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ${isSpeaking ? 'bg-indigo-600 animate-pulse' : 'bg-slate-400'}`}>
                  <span className="text-xs font-bold">{isSpeaking ? '♪' : 'AI'}</span>
                </div>
                <div className="prose prose-indigo max-w-none text-slate-700">
                  <p className="whitespace-pre-wrap">{response}</p>
                </div>
             </div>
             {isSpeaking && (
               <div className="mt-4 flex justify-end">
                 <button 
                   onClick={handleStop}
                   className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                 >
                   <div className="w-2 h-2 bg-slate-300 rounded-sm"></div>
                   Stop Reading
                 </button>
               </div>
             )}
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 text-sm cursor-pointer hover:border-indigo-300 transition-all" onClick={() => { setQuery("Explain Big O notation in simple terms"); handleAsk("Explain Big O notation in simple terms"); }}>
          <p className="text-slate-500">Suggested</p>
          <p className="font-bold text-slate-800">"Explain Big O notation in simple terms"</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 text-sm cursor-pointer hover:border-indigo-300 transition-all" onClick={() => { setQuery("What are the most important topics in Computer Networks?"); handleAsk("What are the most important topics in Computer Networks?"); }}>
          <p className="text-slate-500">Suggested</p>
          <p className="font-bold text-slate-800">"What are the most important topics in Computer Networks?"</p>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
