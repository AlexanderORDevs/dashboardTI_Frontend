import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { useEffect, useState, useRef } from 'react';
import { PaperAirplaneIcon, StopIcon } from '@heroicons/react/24/solid';
import { FaRobot } from 'react-icons/fa';
import {
  talkChatbot,
  getReportChatbot,
  getChatbotHistory,
} from '@/services/chatbot';

const normalizeMarkdownText = (value) => {
  if (typeof value !== 'string') return '';

  const normalized = value
    .replaceAll('\r\n', '\n')
    .replaceAll(/^\n+|\n+$/g, '');
  const lines = normalized.split('\n');

  // Backend replies may include accidental indentation that turns markdown
  // into code blocks; trim left spaces per line to preserve bold/lists.
  return lines.map((line) => line.trimStart()).join('\n');
};

const removeExcelLineFromReply = (text, excelFile) => {
  if (!excelFile?.fileName || typeof text !== 'string') return text;

  const cleanedLines = text.split('\n').filter((line) => {
    // Remove any line that mentions the excel filename (regardless of label wording)
    return !line.includes(excelFile.fileName);
  });

  return cleanedLines
    .join('\n')
    .replaceAll(/\n{3,}/g, '\n\n')
    .trim();
};

const normalizeExcelMetadata = (excelFile) => {
  if (!excelFile || typeof excelFile !== 'object') return null;

  const fileUrl = excelFile.fileUrl || null;
  let fileName = excelFile.fileName || null;

  if (!fileName && fileUrl) {
    const fromUrl = decodeURIComponent(fileUrl.split('/').pop() || '').trim();
    fileName = fromUrl || null;
  }

  if (!fileName && !fileUrl) return null;

  return {
    ...excelFile,
    fileName: fileName || 'chatbot-report.xlsx',
    fileUrl,
  };
};

const getExcelMetadataFromCandidate = (candidate) => {
  if (!candidate) return null;

  if (typeof candidate === 'string') {
    const maybeUrl = candidate.includes('/download-excel/') ? candidate : null;
    const fileNameMatch = /([\w.-]+\.xlsx)\b/i.exec(candidate);
    const fileName = fileNameMatch?.[1] || null;

    return normalizeExcelMetadata({
      fileUrl: maybeUrl,
      fileName,
    });
  }

  if (typeof candidate !== 'object') return null;

  const fileUrl =
    candidate.fileUrl ||
    candidate.fileURL ||
    candidate.downloadUrl ||
    candidate.download_url ||
    candidate.excelUrl ||
    candidate.excel_url ||
    (typeof candidate.url === 'string' && candidate.url.includes('excel')
      ? candidate.url
      : null);

  const fileName =
    candidate.fileName ||
    candidate.filename ||
    (typeof candidate.name === 'string' && candidate.name.endsWith('.xlsx')
      ? candidate.name
      : null);

  const filePath = candidate.filePath || candidate.path || null;

  const normalized = normalizeExcelMetadata({
    fileUrl,
    fileName,
    filePath,
  });

  if (normalized) return normalized;

  const values = Object.values(candidate);
  for (const value of values) {
    const nested = getExcelMetadataFromCandidate(value);
    if (nested) return nested;
  }

  return null;
};

const extractExcelMetadata = (response, replyText) => {
  const source = getExcelMetadataFromCandidate(response?.excelFile);
  if (source?.fileName || source?.fileUrl) {
    return source;
  }

  const sourceFromResponse = getExcelMetadataFromCandidate(response);
  if (sourceFromResponse?.fileName || sourceFromResponse?.fileUrl) {
    return sourceFromResponse;
  }

  if (typeof replyText !== 'string') return null;

  const fileNameMatch = /([\w.-]+\.xlsx)\b/i.exec(replyText);
  if (!fileNameMatch?.[1]) return null;

  const fileName = fileNameMatch[1];
  return {
    fileName,
    fileUrl: `/chatbot/download-excel/${encodeURIComponent(fileName)}`,
  };
};

const markdownComponents = {
  p: ({ ...props }) => <p className="m-0 text-inherit" {...props} />,
  strong: ({ ...props }) => (
    <strong className="font-semibold text-inherit" {...props} />
  ),
  em: ({ ...props }) => <em className="text-inherit" {...props} />,
  ul: ({ ...props }) => (
    <ul className="my-1 list-disc pl-4 text-inherit" {...props} />
  ),
  ol: ({ ...props }) => (
    <ol className="my-1 list-decimal pl-4 text-inherit" {...props} />
  ),
  li: ({ ...props }) => <li className="text-inherit" {...props} />,
  pre: ({ ...props }) => (
    <pre
      className="bg-slate-900/60 my-2 max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-lg p-2 text-inherit"
      {...props}
    />
  ),
  code: ({ ...props }) => (
    <code className="bg-slate-900/70 rounded px-1 text-inherit" {...props} />
  ),
};

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTypingResponse, setIsTypingResponse] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [error, setError] = useState('');

  const inputRef = useRef(null);
  const messageListRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const pendingExcelRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, messages]);

  const buildMessageFromHistory = (message, index) => {
    const role = message?.role === 'assistant' ? 'bot' : 'user';
    const normalizedText = normalizeMarkdownText(message?.content || '');
    const excelMetadata = extractExcelMetadata(message, normalizedText);
    const text = removeExcelLineFromReply(normalizedText, excelMetadata);
    const timestamp = message?.timestamp || null;
    const messageId = timestamp
      ? `${role}-${timestamp}-${index}`
      : `${role}-${Date.now()}-${index}`;

    return {
      id: messageId,
      sender: role,
      text,
      timestamp,
      excelFile: normalizeExcelMetadata(excelMetadata),
    };
  };

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      setError('');
      const response = await getChatbotHistory();

      let rawMessages = [];
      if (Array.isArray(response?.messages)) {
        rawMessages = response.messages;
      } else if (Array.isArray(response)) {
        rawMessages = response;
      }

      const sortedMessages = [...rawMessages].sort((a, b) => {
        const left = new Date(a?.timestamp || 0).getTime();
        const right = new Date(b?.timestamp || 0).getTime();
        return left - right;
      });

      setMessages(
        sortedMessages.map((message, index) =>
          buildMessageFromHistory(message, index)
        )
      );
    } catch (historyError) {
      console.error('Chatbot history error:', historyError);
      setError('Unable to load previous chat history.');
    } finally {
      setHistoryLoading(false);
      setHistoryLoaded(true);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open || !historyLoaded || historyLoading) return;

    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-message',
          sender: 'bot',
          text: 'Hello, I am your operational assistant. How can I help you today?',
          excelFile: null,
          timestamp: null,
        },
      ]);
    }
  }, [open, historyLoaded, historyLoading, messages.length]);

  const finalizeTypingAnimation = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    setIsTypingResponse(false);

    setMessages((prev) => {
      const updated = [...prev];
      const lastMessage = updated.at(-1);

      if (lastMessage?.sender === 'bot') {
        const preservedExcel = normalizeExcelMetadata(lastMessage.excelFile);
        const pendingExcel = normalizeExcelMetadata(pendingExcelRef.current);

        updated[updated.length - 1] = {
          ...lastMessage,
          excelFile: preservedExcel || pendingExcel,
        };
      }

      return updated;
    });

    pendingExcelRef.current = null;
  };

  const downloadExcel = async (excelFile) => {
    try {
      const finalFileName =
        (typeof excelFile === 'string' ? excelFile : excelFile?.fileName) ||
        'chatbot-report.xlsx';

      setLoading(true);
      let blob;

      try {
        blob = await getReportChatbot(excelFile);
      } catch {
        const fallbackName =
          typeof excelFile === 'string'
            ? excelFile
            : excelFile?.fileName ||
              (excelFile?.fileUrl
                ? decodeURIComponent(
                    String(excelFile.fileUrl).split('/').pop() || ''
                  )
                : null);

        if (!fallbackName) throw new Error('Missing file name fallback');

        blob = await getReportChatbot(fallbackName);
      }

      const url = globalThis.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      globalThis.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download Excel error:', error);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || isTypingResponse) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const payload = { message: userMessage.text };
      const response = await talkChatbot(payload);

      const rawReply =
        response?.reply ||
        response?.answer ||
        response?.message ||
        'No response received.';
      const excelMetadata = normalizeExcelMetadata(
        extractExcelMetadata(response, rawReply)
      );
      const fullReply = removeExcelLineFromReply(
        normalizeMarkdownText(rawReply),
        excelMetadata
      );

      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: '',
        excelFile: excelMetadata,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);

      let index = 0;

      pendingExcelRef.current = excelMetadata;
      setIsTypingResponse(true);

      typingIntervalRef.current = setInterval(() => {
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
          finalizeTypingAnimation();
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

  const stopCurrentResponse = () => {
    if (!isTypingResponse) return;
    finalizeTypingAnimation();
  };

  useEffect(() => {
    if (!open) return;

    const bottomEl = messageListRef.current;
    if (bottomEl) {
      bottomEl.scrollTop = bottomEl.scrollHeight;
    }
  }, [messages, open, loading, isTypingResponse, historyLoading]);

  return (
    <div className="fixed bottom-5 right-4 z-[9999] w-[min(92vw,390px)] sm:bottom-6 sm:right-8">
      <div
        className={`absolute bottom-0 right-0 flex h-[560px] w-full flex-col overflow-hidden rounded-3xl bg-[linear-gradient(165deg,#0d0a1a_0%,#130d27_45%,#0f0a1e_100%)] shadow-[0_18px_50px_rgba(6,2,20,0.75)] backdrop-blur-xl transition-all duration-300 ${
          open
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-5 scale-95 opacity-0'
        }`}
      >
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-3 border-b bg-gradient-to-r from-[#0d0a1a] via-[#1a0d38] to-[#0d0a1a] px-4 py-3 transition hover:brightness-110"
          style={{ borderColor: 'rgba(139,92,246,0.3)' }}
          onClick={() => setOpen(false)}
          aria-label="Minimize chatbot"
          title="Click to minimize"
        >
          {/* Avatar bot */}
          <div className="bg-violet-600/30 ring-violet-400/50 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ring-1">
            <FaRobot size={18} style={{ color: '#DDD6FE' }} />
          </div>

          {/* Texto */}
          <div className="flex-1 text-left">
            <p
              className="text-sm font-semibold leading-none"
              style={{ color: '#F5F3FF' }}
            >
              AI Assistant
            </p>
            <p className="mt-1 text-[11px]" style={{ color: '#C4B5FD' }}>
              Tap to minimize
            </p>
          </div>

          {/* Estado online */}
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="bg-emerald-400/70 absolute inline-flex h-full w-full animate-ping rounded-full" />
            <span className="bg-emerald-400 relative inline-flex h-2.5 w-2.5 rounded-full" />
          </span>
        </button>

        <div
          ref={messageListRef}
          className="relative flex-1 space-y-3 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(109,40,217,0.12),transparent_44%),linear-gradient(180deg,rgba(13,10,26,0.6),rgba(13,10,26,0.3))] px-4 py-4 text-sm"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
            >
              {/* Avatar bot */}
              {message.sender === 'bot' && (
                <div className="bg-violet-700/40 ring-violet-500/40 mr-2 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ring-1">
                  <FaRobot size={13} style={{ color: '#DDD6FE' }} />
                </div>
              )}

              <div
                className={`max-w-[78%] break-words text-sm leading-relaxed ${
                  message.sender === 'bot'
                    ? 'rounded-bl-2xl rounded-br-2xl rounded-tl-sm rounded-tr-2xl'
                    : 'rounded-bl-2xl rounded-br-2xl rounded-tl-2xl rounded-tr-sm'
                }`}
                style={
                  message.sender === 'bot'
                    ? {
                        color: '#E8E0FF',
                        background:
                          'linear-gradient(145deg, #1e1535 0%, #16102b 100%)',
                        border: '1px solid rgba(139,92,246,0.25)',
                        boxShadow:
                          '0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
                        padding: '10px 14px',
                      }
                    : {
                        color: '#FFFFFF',
                        background:
                          'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)',
                        border: '1px solid rgba(167,139,250,0.3)',
                        boxShadow:
                          '0 4px 16px rgba(109,40,217,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
                        padding: '10px 14px',
                      }
                }
              >
                <div style={{ color: 'inherit' }}>
                  <ReactMarkdown
                    components={markdownComponents}
                    remarkPlugins={[remarkBreaks]}
                  >
                    {message.text}
                  </ReactMarkdown>
                </div>

                {(message.excelFile?.fileUrl ||
                  message.excelFile?.fileName) && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => downloadExcel(message.excelFile)}
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold !text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                      style={{
                        background:
                          'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        border: '1px solid rgba(52,211,153,0.4)',
                        boxShadow:
                          '0 4px 14px rgba(5,150,105,0.45), inset 0 1px 0 rgba(255,255,255,0.1)',
                      }}
                    >
                      {/* ícono xlsx */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3.5 w-3.5"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download {message.excelFile.fileName || 'Excel file'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {historyLoading && (
            <div className="space-y-2 pt-1">
              <div className="bg-slate-600/70 h-3 w-36 animate-pulse rounded" />
              <div className="bg-slate-700/70 h-3 w-56 animate-pulse rounded" />
              <div className="bg-slate-600/70 h-3 w-44 animate-pulse rounded" />
            </div>
          )}

          {loading && !isTypingResponse && (
            <div
              className="max-w-[78%] rounded-2xl px-4 py-3 text-xs shadow-lg"
              style={{
                color: '#E2E8F0',
                backgroundColor: '#1E293B',
                boxShadow: '0 8px 20px rgba(15, 23, 42, 0.5)',
              }}
            >
              <div
                className="flex items-center gap-2"
                style={{ color: '#E2E8F0' }}
              >
                <span className="font-medium" style={{ color: '#F8FAFC' }}>
                  Assistant is thinking
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 animate-bounce rounded-full"
                    style={{
                      backgroundColor: '#a78bfa',
                      animationDelay: '0ms',
                    }}
                  />
                  <span
                    className="h-2 w-2 animate-bounce rounded-full"
                    style={{
                      backgroundColor: '#c4b5fd',
                      animationDelay: '140ms',
                    }}
                  />
                  <span
                    className="h-2 w-2 animate-bounce rounded-full"
                    style={{
                      backgroundColor: '#ddd6fe',
                      animationDelay: '280ms',
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="border-rose-500/30 bg-rose-950/40 text-rose-300 border-t px-4 py-2 text-xs">
            {error}
          </div>
        )}

        <div className="border-violet-900/50 border-t bg-[#0d0a1a]/90 px-4 py-3">
          {isTypingResponse && (
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={stopCurrentResponse}
                className="bg-amber-500/15 flex h-8 w-8 items-center justify-center rounded-full border border-amber-300 text-amber-200 transition hover:bg-amber-500/30"
                aria-label="Stop response"
                title="Stop response"
              >
                <StopIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              rows={1}
              className="max-h-32 flex-1 resize-none overflow-hidden rounded-2xl border px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-2"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder="Write a message…"
              style={{
                color: '#F5F3FF',
                backgroundColor: '#1a1033',
                borderColor: 'rgba(139,92,246,0.55)',
                caretColor: '#a78bfa',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(167,139,250,0.85)';
                e.target.style.boxShadow =
                  'inset 0 1px 3px rgba(0,0,0,0.4), 0 0 0 3px rgba(139,92,246,0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(139,92,246,0.55)';
                e.target.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.4)';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={loading || historyLoading || isTypingResponse}
            />

            <button
              type="button"
              className="from-violet-500 hover:from-violet-400 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br to-purple-700 !text-white shadow-[0_10px_26px_rgba(139,92,246,0.45)] transition-all hover:-translate-y-0.5 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={sendMessage}
              disabled={
                !input.trim() || loading || historyLoading || isTypingResponse
              }
              aria-label="Send message"
            >
              <PaperAirplaneIcon className="h-5 w-5 -rotate-45 text-white" />
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        className={`border-violet-500/50 hover:border-violet-400 group relative ml-auto flex h-14 w-14 items-center justify-center rounded-2xl border bg-[linear-gradient(165deg,#0d0a1a_0%,#130d27_45%,#0f0a1e_100%)] text-white shadow-[0_8px_24px_rgba(13,10,26,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:text-white hover:shadow-[0_12px_28px_rgba(139,92,246,0.35)] ${
          open ? 'pointer-events-none translate-y-4 opacity-0' : 'opacity-100'
        }`}
        onClick={() => setOpen(true)}
        aria-label="Open assistant"
        title="Open assistant"
      >
        <FaRobot className="h-7 w-7 text-white" size={28} />
      </button>
    </div>
  );
}
