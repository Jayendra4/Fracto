import { useState, type JSX } from 'react';

interface MessagesTabProps {}

export default function MessagesTab({}: MessagesTabProps): JSX.Element {
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'You',
      text: 'Encumbrance certificate re-uploaded — please re-check.',
      time: '10:30 AM',
    },
    {
      id: 2,
      sender: 'Admin',
      text: 'Received, forwarded to Legal for re-verification.',
      time: '11:15 AM',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { id: prev.length + 1, sender: 'You', text: chatInput, time: 'Just now' },
    ]);
    setChatInput('');
  };

  return (
    <div className="space-y-6">
      <div className="pagehead">
        <h1 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
          Messages
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-14 mt-1">
          Direct conversation with Admin about your assets under review.
        </p>
      </div>

      <div className="bg-white dark:bg-[#132436] rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm overflow-hidden flex flex-col h-[480px]">
        <div className="bg-[#0B2545] text-white px-5 py-3 font-semibold font-12 md:font-14 flex items-center justify-between">
          <span>Admin — Heritage Court, Udaipur</span>
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>

        {/* Chat Message Window */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-[#FAFBFD] dark:bg-[#0f1d2c] flex flex-col">
          {chatMessages.map((msg) => {
            const isSelf = msg.sender === 'You';
            return (
              <div
                key={msg.id}
                className={`max-w-[75%] rounded-xl p-3 font-12 leading-normal shadow-sm ${
                  isSelf
                    ? 'bg-[#E8EEFC] text-[#0B2545] self-end'
                    : 'bg-white dark:bg-[#132436] text-gray-700 dark:text-white self-start'
                }`}
              >
                <div className="text-[10px] text-gray-500 font-bold mb-0.5">
                  {isSelf ? 'Young Attitude Group' : msg.sender}
                </div>
                <div>{msg.text}</div>
                <div className="text-[9px] text-gray-400 text-right mt-1">
                  {msg.time}
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat input box */}
        <div className="bg-white dark:bg-[#132436] p-3 border-t border-[#E3E7EE] dark:border-white/10 flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && sendMessage(new Event('submit') as any)
            }
            placeholder="Type a message…"
            className="flex-1 px-3 py-2 border border-[#E3E7EE] dark:border-white/10 rounded-lg font-12 md:font-14 bg-transparent"
          />
          <button
            onClick={sendMessage}
            className="bg-[#1F4FE0] text-white px-4 py-2 rounded-lg font-12 font-semibold hover:bg-[#153eb2]"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
