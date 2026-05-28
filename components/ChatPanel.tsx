'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Globe, Bot, ChevronDown, Trash2 } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

const MODELS = [
  { id: 'openai/gpt-4o',              name: 'GPT-4o',              badge: 'GPT',      color: 'bg-green-100 text-green-700' },
  { id: 'openai/gpt-4o-mini',         name: 'GPT-4o Mini',         badge: 'GPT',      color: 'bg-green-100 text-green-700' },
  { id: 'anthropic/claude-sonnet-4-5',name: 'Claude Sonnet 4.5',   badge: 'Claude',   color: 'bg-orange-100 text-orange-700' },
  { id: 'anthropic/claude-haiku-4-5', name: 'Claude Haiku 4.5',    badge: 'Claude',   color: 'bg-orange-100 text-orange-700' },
  { id: 'google/gemini-2.0-flash-001',name: 'Gemini 2.0 Flash',    badge: 'Gemini',   color: 'bg-blue-100 text-blue-700' },
  { id: 'perplexity/sonar',           name: 'Perplexity Sonar',    badge: 'Web ✦',    color: 'bg-purple-100 text-purple-700' },
  { id: 'x-ai/grok-3-mini',          name: 'Grok 3 Mini',         badge: 'Grok',     color: 'bg-gray-100 text-gray-700' },
  { id: 'qwen/qwen3-235b-a22b',      name: 'Qwen3 235B',          badge: 'Qwen',     color: 'bg-red-100 text-red-700' },
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', badge: 'Meta',  color: 'bg-indigo-100 text-indigo-700' },
];

const SUGGESTIONS = [
  'หา HR email ของบริษัท SCB Tech',
  'ช่วยเขียน Cover Letter ตำแหน่ง Senior Developer',
  'เบอร์ติดต่อ HR บริษัท Agoda Thailand',
  'วิเคราะห์ JD นี้ให้หน่อย และแนะนำ skills ที่ต้องเตรียม',
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
  loading?: boolean;
}

export function ChatPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [model, setModel]       = useState(MODELS[0].id);
  const [webSearch, setWebSearch] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);
  const pickerRef      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  // Close picker on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  async function send(overrideInput?: string) {
    const text = (overrideInput ?? input).trim();
    if (!text || loading) return;
    setInput('');

    const history: Message[] = [
      ...messages,
      { role: 'user', content: text },
      { role: 'assistant', content: '', loading: true },
    ];
    setMessages(history);
    setLoading(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    try {
      const res = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: history.slice(0, -1).map(({ role, content }) => ({ role, content })),
          model,
          webSearch,
        }),
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value, { stream: true }).split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.content) {
              assistantText += parsed.content;
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { role: 'assistant', content: assistantText, loading: false };
                return next;
              });
            }
          } catch (parseErr: any) {
            if (parseErr.message !== 'JSON parse error') throw parseErr;
          }
        }
      }
    } catch (err: any) {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: 'assistant',
          content: `เกิดข้อผิดพลาด: ${err.message}`,
          loading: false,
        };
        return next;
      });
    } finally {
      setLoading(false);
    }
  }

  const selectedModel = MODELS.find((m) => m.id === model) ?? MODELS[0];

  if (!open) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div className="fixed inset-0 z-40 bg-black/20 xl:hidden" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-white border-l border-gray-200 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">AI Assistant</p>
              <p className="text-[10px] text-gray-400 leading-none">SmartMatch Chat</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                title="ล้างการสนทนา"
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Model selector + web search toggle */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50 shrink-0">
          <div className="relative flex-1" ref={pickerRef}>
            <button
              onClick={() => setShowPicker(!showPicker)}
              className="w-full flex items-center justify-between gap-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`text-[9px] font-bold px-1 py-0.5 rounded shrink-0 ${selectedModel.color}`}>
                  {selectedModel.badge}
                </span>
                <span className="font-medium text-gray-700 truncate">{selectedModel.name}</span>
              </div>
              <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
            </button>

            {showPicker && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-1 max-h-72 overflow-y-auto">
                {MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setModel(m.id); setShowPicker(false); }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left transition-colors ${
                      model === m.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}>
                    <span className={`text-xs font-medium ${model === m.id ? 'text-blue-700' : 'text-gray-700'}`}>
                      {m.name}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${m.color}`}>{m.badge}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-10 space-y-4">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
                <Bot className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">ถามอะไรก็ได้</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  เปิด <span className="text-blue-500 font-medium">Web</span> เพื่อให้ AI ค้นข้อมูลจากเน็ต
                </p>
              </div>
              <div className="space-y-1.5 text-left">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="w-full text-left text-xs text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-200 px-3 py-2 rounded-xl transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shrink-0 mb-0.5">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                {msg.loading ? (
                  <div className="flex items-center gap-1 py-0.5">
                    {[0, 150, 300].map((delay) => (
                      <div
                        key={delay}
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-100 bg-white shrink-0">
          <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 focus-within:border-blue-300 focus-within:bg-white transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              placeholder="พิมพ์ข้อความ…"
              rows={1}
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none"
              style={{ minHeight: '24px', maxHeight: '120px' }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center shrink-0 transition-colors">
              {loading
                ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                : <Send className="w-3.5 h-3.5 text-white" />}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 text-center">
            Enter ส่ง · Shift+Enter ขึ้นบรรทัด · {selectedModel.name}
            {webSearch && ' · Web Search ON'}
          </p>
        </div>
      </div>
    </>
  );
}
