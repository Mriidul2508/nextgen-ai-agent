'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, PlayCircle, Square, ArrowLeft } from 'lucide-react';

export default function SinglePageApp() {
  const [currentView, setCurrentView] = useState<'landing' | 'chat'>('landing');

  // 1. The Purist Approach: Pull exactly what we need from the SDK
  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading, error } = useChat(); 
  
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentView === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentView]);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
        
      // 2. Feed voice directly into the SDK's native input handler
      handleInputChange({ target: { value: transcript } } as any); 
    };
    
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const toggleSpeech = (text: string, messageId: string) => {
    if (speakingId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeakingId(null);
    setSpeakingId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  if (currentView === 'chat') {
    return (
      <div className="flex flex-col h-screen bg-slate-50">
        <header className="p-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentView('landing')}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
              title="Back to home"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="font-bold text-lg text-slate-800">NextGen AI Agent</div>
          </div>
          <div className="text-xs font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full">Online</div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="text-center text-slate-500 mt-20">
                <h2 className="text-2xl font-semibold text-slate-700 mb-2">How can I help you today?</h2>
                <p>Type a message or click the microphone to start speaking.</p>
              </div>
            )}
            
            {messages.map((m: any) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                  m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                }`}>
                  <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                  {m.role === 'assistant' && (
                    <div className="mt-3 flex justify-end">
                      <button onClick={() => toggleSpeech(m.content, m.id)} className="text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1 text-xs font-medium">
                        {speakingId === m.id ? <Square size={16} /> : <PlayCircle size={16} />}
                        {speakingId === m.id ? 'Stop' : 'Listen'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-bl-none p-4 shadow-sm flex space-x-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-center my-4">
                <div className="bg-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-200 shadow-sm">
                  ⚠️ Backend Error: {error.message || "Failed to fetch. Check Vercel Runtime Logs."}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        <footer className="p-4 bg-white border-t border-slate-200">
          <div className="max-w-3xl mx-auto">
            {/* 3. Wire up the native handleSubmit */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-slate-100 p-2 rounded-full border border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <button type="button" onClick={toggleListening} className={`p-3 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}>
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              
              {/* 4. Wire up the native input and handleInputChange */}
              <input 
                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800 placeholder-slate-400 px-2" 
                value={input || ''} 
                onChange={handleInputChange} 
                placeholder={isListening ? "Listening..." : "Message NextGen AI..."} 
                disabled={isLoading || isListening} 
              />
              
              <button type="submit" disabled={isLoading || !input?.trim()} className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
                <Send size={20} />
              </button>
            </form>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight text-blue-600">NextGen AI</div>
          <button 
            onClick={() => setCurrentView('chat')}
            className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      </header>

      <main className="flex-1">
        <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-4 text-center">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
              Stop Losing Customers to <span className="text-blue-600">Slow Responses.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Deploy a conversational AI agent that resolves support tickets, qualifies leads, and engages customers 24/7. True AI automation that drives measurable ROI.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => setCurrentView('chat')}
                className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
              >
                Build Your AI Chatbot
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}