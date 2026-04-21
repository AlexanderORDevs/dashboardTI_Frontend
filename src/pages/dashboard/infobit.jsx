import {
  Card,
  CardHeader,
  CardBody,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Typography,
} from '@material-tailwind/react';
import Label from '@/widgets/forms/label';
import Input from '@/widgets/forms/input';
import { useState, useEffect, useRef } from 'react';
import ScaleWrapper from '@/components/ScaleWrapper';
import CustomSwal from '@/utils/customSwal';
import { useNavigate } from 'react-router-dom';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import { sendMessage } from '@/services/infobit/send.infobit';
import { getAllMessages } from '@/services/infobit/getMessages';
import { getConversationHistory } from '@/services/infobit/getConversationHistory';
import { sendConversationMessage } from '@/services/infobit/sendConversationMessage';

const getStatusClasses = (status) => {
  const normalizedStatus = String(status || '').toUpperCase();

  if (normalizedStatus.startsWith('REJECTED')) {
    return 'bg-red-100 text-red-800';
  }
  if (normalizedStatus.startsWith('FAILED')) {
    return 'bg-red-100 text-red-800';
  }
  if (normalizedStatus.startsWith('UNDELIVERABLE')) {
    return 'bg-red-100 text-red-800';
  }
  if (normalizedStatus.startsWith('PENDING')) {
    return 'bg-yellow-100 text-yellow-800';
  }
  if (normalizedStatus.startsWith('DELIVERED')) {
    return 'bg-green-100 text-green-800';
  }

  if (normalizedStatus === 'EXPIRED') {
    return 'bg-red-100 text-red-800';
  }

  return 'bg-gray-100 text-gray-800';
};

const LOG_AUTO_REFRESH_MS = 5 * 60 * 1000;
const US_PHONE_DIGITS = 10;

const parseBulkNumbers = (phoneValues) => {
  const parts = (Array.isArray(phoneValues) ? phoneValues : [])
    .map((value) => String(value || '').trim())
    .filter(Boolean);

  const seen = new Set();
  const normalized = [];

  parts.forEach((part) => {
    const key = part.replaceAll(/[^\d]/g, '');
    if (!key) return;
    if (seen.has(key)) return;

    seen.add(key);
    normalized.push(part);
  });

  return normalized;
};

export function Infobit() {
  const navigate = useNavigate();
  const [numberPhoneRows, setNumberPhoneRows] = useState([
    { id: 1, value: '' },
  ]);
  const nextPhoneRowId = useRef(2);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openConversation, setOpenConversation] = useState(false);
  const [activePhone, setActivePhone] = useState('');
  const [conversationRows, setConversationRows] = useState([]);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const handlePhoneChange = (rowId, e) => {
    let value = e.target.value.replaceAll(/\D/g, '');
    if (value.length > US_PHONE_DIGITS) {
      value = value.slice(0, US_PHONE_DIGITS);
    }

    setNumberPhoneRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, value } : row))
    );

    if (fieldErrors.numberPhones) {
      setFieldErrors((prev) => ({ ...prev, numberPhones: '' }));
    }
  };

  const handleAddPhoneInput = () => {
    setNumberPhoneRows((prev) => [
      ...prev,
      { id: nextPhoneRowId.current++, value: '' },
    ]);
  };

  const handleRemovePhoneInput = (rowId) => {
    setNumberPhoneRows((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((row) => row.id !== rowId);
    });
  };

  const handleApiError = (error, contextMessage = 'Unexpected error') => {
    const statusCode = error?.response?.status;

    if (statusCode === 401) {
      CustomSwal.fire({
        icon: 'warning',
        title: 'Session expired',
        text: 'Please log in again to continue.',
      }).then(() => {
        navigate('/auth/sign-in');
      });
      return;
    }

    if (statusCode === 404) {
      CustomSwal.fire({
        icon: 'info',
        title: 'Not found',
        text: 'The requested message was not found or you do not have permission.',
      });
      return;
    }

    if (statusCode >= 500) {
      CustomSwal.fire({
        icon: 'error',
        title: 'Temporary server issue',
        text: 'The service is temporarily unavailable. Please try again in a moment.',
      });
      return;
    }

    CustomSwal.fire({
      icon: 'error',
      title: 'Error',
      text: contextMessage,
    });
  };

  const handleSendMessage = async () => {
    if (sending) return;
    const errors = {};
    const parsedNumbers = parseBulkNumbers(
      numberPhoneRows.map((row) => row.value)
    );
    const invalidNumbers = parsedNumbers.filter(
      (phone) => String(phone).length !== US_PHONE_DIGITS
    );

    if (parsedNumbers.length === 0) {
      errors.numberPhones = 'At least one phone number is required';
    } else if (invalidNumbers.length > 0) {
      errors.numberPhones = 'All phone numbers must have exactly 10 digits';
    }

    if (!message || message.trim() === '') {
      errors.message = 'Message is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setSending(true);

    try {
      await sendMessage(parsedNumbers, message.trim());

      setNumberPhoneRows([{ id: nextPhoneRowId.current++, value: '' }]);
      setMessage('');
      setFieldErrors({});

      await fetchMessages();

      CustomSwal.fire({
        icon: 'success',
        title: 'Message sent',
        text: 'Your message was sent successfully.',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      handleApiError(
        error,
        'There was an error sending bulk messages. Please try again.'
      );
    } finally {
      setSending(false);
    }
  };

  const fetchMessages = async ({ silent = false } = {}) => {
    setLoading(true);
    try {
      const data = await getAllMessages();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
      if (!silent) {
        handleApiError(error, 'Could not load messages history.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const autoRefreshId = setInterval(() => {
      fetchMessages({ silent: true });
    }, LOG_AUTO_REFRESH_MS);

    return () => clearInterval(autoRefreshId);
  }, []);

  const normalizeConversationRows = (payload) => {
    if (Array.isArray(payload)) return payload;
    return (
      payload?.history ||
      payload?.messages ||
      payload?.rows ||
      payload?.data ||
      []
    );
  };

  const getDirection = (item) => String(item?.direction || '').toUpperCase();
  const getConversationText = (item) =>
    item?.message || item?.text || item?.content || item?.body || '-';

  const openConversationModal = async (rawNumberPhone) => {
    const numberPhone = String(rawNumberPhone || '').trim();
    if (!numberPhone) return;

    setActivePhone(numberPhone);
    setOpenConversation(true);
    setConversationLoading(true);

    try {
      const history = await getConversationHistory(numberPhone, 200);
      setConversationRows(normalizeConversationRows(history));
    } catch (error) {
      console.error('Error loading conversation history:', error);
      setConversationRows([]);
      handleApiError(error, 'Could not load conversation history.');
    } finally {
      setConversationLoading(false);
    }
  };

  const closeConversationModal = () => {
    setOpenConversation(false);
    setActivePhone('');
    setConversationRows([]);
    setReplyMessage('');
  };

  const handleSendConversationReply = async () => {
    if (sendingReply) return;
    if (!activePhone || !replyMessage.trim()) return;

    setSendingReply(true);
    try {
      await sendConversationMessage(activePhone, replyMessage.trim());
      setReplyMessage('');

      const history = await getConversationHistory(activePhone, 200);
      setConversationRows(normalizeConversationRows(history));
      await fetchMessages({ silent: true });
    } catch (error) {
      console.error('Error sending conversation reply:', error);
      handleApiError(error, 'Could not send message in this conversation.');
    } finally {
      setSendingReply(false);
    }
  };

  const renderConversationBody = () => {
    if (conversationLoading) {
      return (
        <div className="py-8 text-center text-sm text-gray-600">
          Loading conversation...
        </div>
      );
    }

    if (conversationRows.length === 0) {
      return (
        <div className="py-8 text-center text-sm text-gray-600">
          No messages found for this conversation.
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        {conversationRows.map((item, idx) => {
          const direction = getDirection(item);
          const isOutbound = direction === 'OUTBOUND';
          const messageText = getConversationText(item);
          const eventDate =
            item?.created_at || item?.updated_at || item?.createdAt || null;

          return (
            <div
              key={item?.id ?? item?.messageId ?? idx}
              className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  isOutbound
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap break-words">
                  {messageText}
                </div>
                <div
                  className={`mt-1 text-[11px] ${
                    isOutbound ? 'text-blue-100' : 'text-gray-600'
                  }`}
                >
                  {direction || 'UNKNOWN'} - {formatDateTime(eventDate)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '-';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <ScaleWrapper scale={0.6} buffer={40}>
      <div className="mb-8 mt-12 flex flex-col gap-12">
        <Card color="white">
          <CardHeader
            variant="gradient"
            style={{ backgroundColor: '#EEA11E' }}
            className="p-6 shadow-none"
          >
            <Typography variant="h4" color="white">
              Send Messages
            </Typography>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Label htmlFor="numbers" value="Phone Number(s)" />
                  <div className="flex flex-col gap-2">
                    {numberPhoneRows.map((row, index) => (
                      <div key={row.id} className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-3 font-medium text-gray-600">
                            +1
                          </span>
                          <Input
                            id={index === 0 ? 'numbers' : `numbers-${row.id}`}
                            type="text"
                            placeholder="1234567890"
                            value={row.value}
                            onChange={(e) => handlePhoneChange(row.id, e)}
                            maxLength={US_PHONE_DIGITS}
                            className="pl-12"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleAddPhoneInput}
                          className="rounded-md bg-[#EEA11E] px-3 py-2 font-bold text-white transition hover:bg-[#d46f1d]"
                          title="Add another number"
                          aria-label="Add another number"
                        >
                          +
                        </button>

                        {numberPhoneRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePhoneInput(row.id)}
                            className="rounded-md bg-gray-400 px-3 py-2 font-bold text-white transition hover:bg-gray-500"
                            title="Remove number"
                            aria-label="Remove number"
                          >
                            -
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {fieldErrors.numberPhones && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      {fieldErrors.numberPhones}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Unique numbers detected:{' '}
                    {
                      parseBulkNumbers(numberPhoneRows.map((row) => row.value))
                        .length
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    U.S. only: each phone number must have exactly 10 digits.
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="message" value="Message" />
                <textarea
                  id="message"
                  placeholder="Write your message here..."
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (fieldErrors.message) {
                      setFieldErrors({ ...fieldErrors, message: '' });
                    }
                  }}
                  className={`w-full rounded-md border p-3 text-sm focus:outline-none focus:ring-1 ${
                    fieldErrors.message
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                  }`}
                  rows="4"
                />
                {fieldErrors.message && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {fieldErrors.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleSendMessage}
                  disabled={sending}
                  className={`flex items-center justify-center gap-2 rounded-md px-6 py-2 font-medium text-white transition
    ${
      sending
        ? 'cursor-not-allowed bg-gray-400'
        : 'bg-[#EEA11E] hover:bg-[#d46f1d]'
    }
  `}
                >
                  {sending && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  {sending ? 'Sending...' : 'Send Message'}
                </button>

                <button
                  disabled={sending}
                  onClick={() => {
                    setNumberPhoneRows([
                      { id: nextPhoneRowId.current++, value: '' },
                    ]);
                    setMessage('');
                  }}
                  className={`rounded-md px-6 py-2 font-medium text-white transition
    ${sending ? 'cursor-not-allowed bg-gray-300' : 'bg-gray-400 hover:bg-gray-500'}
  `}
                >
                  Clear
                </button>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            variant="gradient"
            color="gray"
            className="flex items-center justify-between p-6"
          >
            <Typography variant="h4" color="white">
              Messages History
            </Typography>
            <div className="flex items-center gap-3">
              <span className="rounded bg-gray-700 px-2 py-1 text-xs text-white">
                Auto-refresh: 5m
              </span>
              <button
                type="button"
                onClick={fetchMessages}
                disabled={loading}
                className={`rounded px-3 py-1 text-white transition ${
                  loading
                    ? 'cursor-not-allowed bg-gray-400'
                    : 'bg-[#1A1A1A] hover:bg-[#000000]'
                }`}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </CardHeader>

          <CardBody className="overflow-x-auto p-6">
            {loading ? (
              <div className="py-8 text-center">Loading messages...</div>
            ) : (
              <table className="w-full min-w-[900px] table-auto border-collapse border-2 border-[#1A1A1A]">
                <thead className="sticky top-0 z-10 bg-[#e07721] text-white">
                  <tr className="text-center">
                    <th
                      className="border border-[#1A1A1A] px-4 py-2"
                      style={{ width: '120px' }}
                    >
                      Phone Number
                    </th>
                    <th
                      className="border border-[#1A1A1A] px-4 py-2"
                      style={{ width: '500px' }}
                    >
                      Message
                    </th>
                    <th className="border border-[#1A1A1A] px-4 py-2">
                      Agent Name
                    </th>
                    <th className="border border-[#1A1A1A] px-4 py-2">
                      Status
                    </th>
                    <th className="border border-[#1A1A1A] px-4 py-2">
                      Description
                    </th>
                    <th className="border border-[#1A1A1A] px-4 py-2">
                      Message Sent At
                    </th>
                    <th className="border border-[#1A1A1A] px-4 py-2">
                      Last Status Update
                    </th>
                    <th className="border border-[#1A1A1A] px-4 py-2">
                      Conversation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {messages.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="border px-4 py-6 text-center text-sm text-gray-500"
                      >
                        No messages found
                      </td>
                    </tr>
                  ) : (
                    messages.map((msg, idx) => (
                      <tr
                        key={msg.id ?? idx}
                        className="text-center align-middle transition-colors odd:bg-white even:bg-gray-50 hover:bg-indigo-50"
                      >
                        <td className="align-center truncate border border-[#1A1A1A] px-4 py-2 text-center">
                          {msg.numberphone ? `+1 ${msg.numberphone}` : '-'}
                        </td>
                        <td className="align-center whitespace-pre-wrap break-words border border-[#1A1A1A] px-4 py-2 text-center">
                          {msg.lastMessage ?? '-'}
                        </td>

                        <td className="align-center border border-[#1A1A1A] px-4 py-2 text-center">
                          {msg.agentName || msg.agent_name || '-'}
                        </td>
                        <td className="align-center border border-[#1A1A1A] px-4 py-2 text-center">
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${getStatusClasses(msg.lastStatus)}`}
                          >
                            {msg.lastStatus || '-'}
                          </span>
                        </td>
                        <td className="align-center whitespace-pre-wrap break-words border border-[#1A1A1A] px-4 py-2 text-center">
                          {msg.lastDescription ?? '-'}
                        </td>

                        <td className="whitespace-nowrap border  border-[#1A1A1A] px-2 py-1 text-center text-sm">
                          {formatDateTime(msg.created_at)}
                        </td>
                        <td className="whitespace-nowrap border border-[#1A1A1A] px-2 py-1 text-center text-sm">
                          {formatDateTime(msg.updated_at)}
                        </td>
                        <td className="border border-[#1A1A1A] px-2 py-1 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              openConversationModal(msg.numberphone)
                            }
                            disabled={!msg.numberphone}
                            title="Open conversation"
                            aria-label="Open conversation"
                            className={`rounded px-2 py-1 text-xs text-white transition ${
                              msg.numberphone
                                ? 'bg-[#1A1A1A] hover:bg-black'
                                : 'cursor-not-allowed bg-gray-400'
                            }`}
                          >
                            <ChatBubbleLeftRightIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>

        <Dialog
          open={openConversation}
          handler={closeConversationModal}
          size="xl"
        >
          <DialogHeader>
            <div className="flex w-full items-center justify-between">
              <span>
                Conversation: {activePhone ? `+1 ${activePhone}` : '-'}
              </span>
            </div>
          </DialogHeader>

          <DialogBody divider className="max-h-[65vh] overflow-y-auto">
            {renderConversationBody()}
          </DialogBody>

          <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your reply..."
              rows={2}
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-orange-500 focus:outline-none"
            />
            <div className="flex w-full justify-end gap-2 sm:w-auto">
              <button
                type="button"
                onClick={closeConversationModal}
                className="rounded bg-gray-400 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-500"
              >
                Close
              </button>
              <button
                type="button"
                disabled={sendingReply || !replyMessage.trim()}
                onClick={handleSendConversationReply}
                className={`rounded px-4 py-2 text-sm font-medium text-white transition ${
                  sendingReply || !replyMessage.trim()
                    ? 'cursor-not-allowed bg-gray-400'
                    : 'bg-[#EEA11E] hover:bg-[#d46f1d]'
                }`}
              >
                {sendingReply ? 'Sending...' : 'Send'}
              </button>
            </div>
          </DialogFooter>
        </Dialog>
      </div>
    </ScaleWrapper>
  );
}

export default Infobit;
