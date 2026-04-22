import ReactMarkdown from 'react-markdown';
import { useEffect, useState, useRef } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { talkChatbot, getReportChatbot } from '@/services/chatbot';

const normalizeMarkdownText = (value) => {
  if (typeof value !== 'string') return '';

  const normalized = value
    .replaceAll('\r\n', '\n')
    .replaceAll(/^\n+|\n+$/g, '');
  const lines = normalized.split('\n');
  const nonEmpty = lines.filter((line) => line.trim().length > 0);

  if (!nonEmpty.length) return normalized;

  const minIndent = nonEmpty.reduce((min, line) => {
    const indentMatch = /^\s*/.exec(line);
    const indent = (indentMatch ? indentMatch[0] : '').length;
    return Math.min(min, indent);
  }, Number.POSITIVE_INFINITY);

  if (!Number.isFinite(minIndent) || minIndent === 0) return normalized;

  return lines.map((line) => line.slice(minIndent)).join('\n');
};

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, messages]);

  // Typing animation on open
  useEffect(() => {
    if (!open) return;

    if (messages.length === 0) {
      const fullText =
        'Hello, I am your operational assistant. How can I help you today?';

      let index = 0;

      const typingInterval = setInterval(() => {
        index++;

        setMessages([
          {
            id: 1,
            sender: 'bot',
            text: normalizeMarkdownText(fullText.slice(0, index)),
          },
        ]);

        if (index >= fullText.length) {
          clearInterval(typingInterval);
        }
      }, 20);

      return () => clearInterval(typingInterval);
    }
  }, [open]);

  const downloadExcel = async (fileName) => {
    try {
      setLoading(true);
      const blob = await getReportChatbot(fileName);
      const url = globalThis.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      globalThis.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download Excel error:', error);
      setError('Unable to download the Excel file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const payload = { message: userMessage.text };
      const response = await talkChatbot(payload);

      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: '',
        excelFile: null,
      };

      setMessages((prev) => [...prev, botMessage]);

      let index = 0;
      const fullReply = normalizeMarkdownText(
        response?.reply ||
          response?.answer ||
          response?.message ||
          'No response received.'
      );

      const typingInterval = setInterval(() => {
        index++;

        setMessages((prev) => {
          const updated = [...prev];
          const lastMessage = updated.at(-1);

          if (lastMessage?.sender === 'bot') {
            updated[updated.length - 1] = {
              ...lastMessage,
              text: fullReply.slice(0, index),
            };
          }

          return updated;
        });

        if (index >= fullReply.length) {
          clearInterval(typingInterval);

          setMessages((prev) => {
            const updated = [...prev];
            const lastMessage = updated.at(-1);

            if (lastMessage?.sender === 'bot') {
              updated[updated.length - 1] = {
                ...lastMessage,
                excelFile: response?.excelFile || null,
              };
            }

            return updated;
          });
        }
      }, 15);
    } catch (e) {
      console.error('Chatbot error:', e);
      setError('Connection error. Please try again.');

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          sender: 'bot',
          text: 'Sorry, I am unable to respond at the moment.',
          excelFile: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    const bottomEl = document.getElementById('chatbot-message-list');
    if (bottomEl) {
      bottomEl.scrollTop = bottomEl.scrollHeight;
    }
  }, [messages, open]);

  return (
    <div className="fixed bottom-6 right-8 z-[9999] w-[360px]">
      {open ? (
        <div className="border-slate-700 flex h-[540px] flex-col rounded-2xl border bg-[#0F172A] shadow-2xl">
          {/* HEADER */}
          <div className="border-slate-700 flex items-center justify-between rounded-t-2xl border-b bg-[#111827] px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-white">
                Operational Assistant
              </p>
              <p className="text-xs text-green-400">● Online</p>
            </div>

            {/* Red circle close button */}
            <button
              onClick={() => setOpen(false)}
              className="h-4 w-4 rounded-full bg-red-500 transition hover:bg-red-400"
            ></button>
          </div>

          {/* MESSAGE AREA */}
          <div
            id="chatbot-message-list"
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] whitespace-pre-wrap break-words rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  message.sender === 'bot'
                    ? 'bg-[#1E293B] text-white'
                    : 'ml-auto bg-[#2563EB] text-white'
                }`}
              >
                <ReactMarkdown>{message.text}</ReactMarkdown>
                {message.excelFile && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => downloadExcel(message.excelFile.fileName)}
                      className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-500"
                    >
                      📥 Download {message.excelFile.fileName}
                    </button>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="text-slate-400 text-xs text-white">
                Thinking...
              </div>
            )}
          </div>

          {error && <div className="text-rose-400 px-4 text-xs">{error}</div>}

          {/* INPUT AREA */}
          <div className="border-slate-700 flex items-center gap-2 border-t bg-[#111827] px-4 py-4">
            <textarea
              ref={inputRef}
              rows={1}
              className="border-slate-600 placeholder:text-slate-400 flex-1 resize-none overflow-hidden rounded-xl border bg-[#1E293B] px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);

                // Auto-grow
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              placeholder="Type your message..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={loading}
            />

            {/* Icon send button */}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
            >
              <PaperAirplaneIcon className="h-5 w-5 rotate-45 text-white" />
            </button>
          </div>
        </div>
      ) : (
        <button
          className="border-slate-700 flex items-center gap-2 rounded-full border bg-[#0F172A] px-5 py-3 text-sm font-semibold text-white shadow-xl hover:bg-[#1E293B]"
          onClick={() => setOpen(true)}
        >
          <span className="bg-emerald-400 h-3 w-3 rounded-full" />
          <span>Assistant</span>
        </button>
      )}
    </div>
  );
}
