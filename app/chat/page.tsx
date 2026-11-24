'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  sender: string;
  message: string;
  createdAt: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/chat');
      const data = await res.json();
      if (data.success) setMessages(data.data);
    } catch (error) {
      console.error('Gagal memuat chat:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();
      if (data.success) {
        fetchMessages();
      }
    } catch (error) {
      console.error('Gagal mengirim pesan:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-md flex flex-col h-[80vh]">
        {/* Header Chat */}
        <div className="p-4 border-b bg-blue-600 text-white rounded-t-xl flex items-center justify-between">
          <h1 className="text-lg font-semibold">💬 Asisten Virtual - PT Duta Properti</h1>
          <span className="text-xs bg-blue-500 px-2 py-1 rounded-full">Online</span>
        </div>

        {/* Ruang Pesan */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <p className="text-center text-gray-400 mt-10">Mulai percakapan dengan mengirim pesan di bawah...</p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-lg text-sm ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border shadow-sm rounded-bl-none'
                  }`}
                >
                  <p>{m.message}</p>
                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      m.sender === 'user' ? 'text-blue-200' : 'text-gray-400'
                    }`}
                  >
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-4 border-t bg-white rounded-b-xl flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis pesan atau pertanyaan seputar properti..."
            className="flex-1 border rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? 'Mengirim...' : 'Kirim'}
          </button>
        </form>
      </div>
    </div>
  );
}