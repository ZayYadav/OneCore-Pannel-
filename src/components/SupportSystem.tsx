import React, { useState } from 'react';
import { Ticket } from '../types';
import { HelpCircle, AlertCircle, MessageSquare, Send, CheckCircle2, TicketCheck, Tag, PlusCircle } from 'lucide-react';

interface SupportSystemProps {
  tickets: Ticket[];
  onAddMessage: (ticketId: string, message: { sender: 'user' | 'admin'; message: string }) => void;
  onOpenTicket: (ticket: Ticket) => void;
  onCloseTicket: (ticketId: string) => void;
}

export default function SupportSystem({
  tickets,
  onAddMessage,
  onOpenTicket,
  onCloseTicket
}: SupportSystemProps) {
  const [activeTicketId, setActiveTicketId] = useState(tickets[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [mobileActive, setMobileActive] = useState(false);
  
  // States for opening a new ticket
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Ticket['category']>('license_issue');
  const [newPriority, setNewPriority] = useState<Ticket['priority']>('medium');
  const [newBody, setNewBody] = useState('');

  const activeTicket = tickets.find(t => t.id === activeTicketId);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    onAddMessage(activeTicketId, {
      sender: 'admin', // Simulation from perspective of Admin Panel
      message: replyText
    });
    setReplyText('');
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newBody) {
      alert('Title and inquiry description cannot be blank.');
      return;
    }

    const brandTicket: Ticket = {
      id: `tkt_${Date.now()}`,
      userId: 'usr_3',
      username: 'shadow_gamer',
      title: newTitle,
      category: newCategory,
      priority: newPriority,
      status: 'open',
      creationDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      messages: [
        {
          id: `msg_${Date.now()}`,
          sender: 'user',
          senderName: 'shadow_gamer',
          message: newBody,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
        }
      ]
    };

    onOpenTicket(brandTicket);
    setActiveTicketId(brandTicket.id);
    setMobileActive(true);
    setShowOpenModal(false);
    setNewTitle('');
    setNewBody('');
  };

  const priorityColors = {
    low: 'bg-slate-900 border-slate-800 text-slate-400',
    medium: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    high: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    critical: 'bg-red-500/10 border-red-500/20 text-red-400 font-bold animate-pulse'
  };

  return (
    <div id="support-system-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT: Tickets Navigator List */}
      <div className={`bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-6 flex flex-col justify-between ${mobileActive ? 'hidden lg:flex' : 'flex'}`}>
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              Ticket Networks Tracker
            </h3>

            <button
              id="open-ticket-modal-btn"
              onClick={() => setShowOpenModal(true)}
              className="p-1.5 hover:text-white text-indigo-400 hover:bg-slate-800 rounded border border-slate-800 flex items-center gap-1 text-[11px] font-semibold transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Open Ticket
            </button>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {tickets.map((t) => (
              <button
                key={t.id}
                id={`btn-ticket-nav-${t.id}`}
                onClick={() => {
                  setActiveTicketId(t.id);
                  setMobileActive(true);
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                  activeTicketId === t.id
                    ? 'bg-slate-950/80 border-purple-500/40 shadow-lg shadow-purple-500/5'
                    : 'bg-slate-950/20 border-slate-800/60 hover:bg-slate-950/60'
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="font-bold text-slate-200 line-clamp-1 text-xs">{t.title}</span>
                  <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase rounded border ${priorityColors[t.priority]}`}>
                    {t.priority}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 w-full mt-1">
                  <span>Author: {t.username}</span>
                  <span className="font-mono">{t.creationDate.split(' ')[0]}</span>
                </div>

                <div className="flex items-center gap-2.5 mt-0.5">
                  <span className={`px-1.5 py-0.2 text-[8px] rounded uppercase font-bold tracking-wider ${
                    t.status === 'open' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                    t.status === 'replied' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}>
                    {t.status}
                  </span>
                  <span className="text-[10px] text-slate-600 font-medium">
                    {t.category.replace('_', ' ')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/60 mt-4 text-[11px] text-slate-500">
          Typical response latency goal: <span className="text-pink-400 font-semibold">&lt; 15 mins</span>
        </div>
      </div>

      {/* RIGHT: Thread Chat Logs Area */}
      <div className={`bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-6 lg:col-span-2 flex flex-col justify-between min-h-[450px] ${!mobileActive ? 'hidden lg:flex' : 'flex'}`}>
        {activeTicket ? (
          <>
            <div>
              {/* Mobile Back Button */}
              {mobileActive && (
                <button
                  onClick={() => setMobileActive(false)}
                  className="lg:hidden mb-4 text-indigo-400 hover:text-white font-semibold flex items-center gap-1.5 text-xs transition"
                >
                  &larr; Back to Ticket List
                </button>
              )}
              <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-4 font-sans">
                <div>
                  <h4 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                    {activeTicket.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Ticket ID: <span className="font-mono text-slate-400">{activeTicket.id}</span> | Category: <span className="text-indigo-400 font-semibold">{activeTicket.category.replace('_', ' ')}</span>
                  </p>
                </div>

                {activeTicket.status !== 'closed' && (
                  <button
                    id={`close-ticket-btn-${activeTicket.id}`}
                    onClick={() => onCloseTicket(activeTicket.id)}
                    className="px-2 py-1 bg-red-950/40 border border-red-900/30 hover:bg-red-950 text-red-400 rounded-lg text-xs font-semibold"
                  >
                    Close Ticket
                  </button>
                )}
              </div>

              {/* Chat timeline items */}
              <div className="space-y-4 max-h-[290px] overflow-y-auto mb-4 pr-1">
                {activeTicket.messages.map((msg, idx) => {
                  const isAdminStyle = msg.sender === 'admin';
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col max-w-[85%] ${isAdminStyle ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1">
                        <span className="font-bold text-slate-400">{msg.senderName}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-600">{msg.timestamp.split(' ')[1]}</span>
                      </div>
                      <div className={`p-3.5 rounded-2xl text-xs leading-relaxed border ${
                        isAdminStyle
                          ? 'bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900/40 border-purple-500/20 rounded-tr-none text-slate-200'
                          : 'bg-slate-950/60 border-slate-800 rounded-tl-none text-slate-300'
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Response Form */}
            {activeTicket.status !== 'closed' ? (
              <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-800 flex items-center gap-3">
                <input
                  id="ticket-reply-input"
                  type="text"
                  placeholder="Draft system diagnostic recommendation to customer..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-slate-950 text-slate-200 p-2.5 rounded-xl text-xs border border-slate-800 focus:outline-none focus:border-purple-500 placeholder-slate-600"
                />
                <button
                  id="send-reply-btn"
                  type="submit"
                  className="p-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:brightness-110 rounded-xl text-white transition flex items-center justify-center p-3"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="py-4 border-t border-slate-800/60 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
                <TicketCheck className="w-4 h-4 text-green-400" />
                <span>Ticket closed and archived securely by Moderator. Read-Only state.</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2 py-16">
            <AlertCircle className="w-10 h-10 opacity-30 fill-current" />
            <p className="text-xs italic">Select a conversation thread to review diagnostics.</p>
          </div>
        )}
      </div>

      {/* MODAL: OPEN NEW ticket SCREEN */}
      {showOpenModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="font-bold text-slate-200">Open Inquiries Ticket</h4>
              <button
                id="close-ticket-modal-btn"
                onClick={() => setShowOpenModal(false)}
                className="text-slate-500 hover:text-slate-300 font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs text-slate-300">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-2">Ticket Title</label>
                <input
                  id="new-ticket-title"
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
                  placeholder="Need device override for secondary home machine"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-2">Category</label>
                  <select
                    id="new-ticket-category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 text-slate-400 p-2.5 rounded-xl border border-slate-800"
                  >
                    <option value="license_issue">License/Key issue</option>
                    <option value="api_error">REST API Problem</option>
                    <option value="reseller_inquiry">Reseller Help</option>
                    <option value="payment_issue">Billing Question</option>
                    <option value="general">Generic Help</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-2">Inquiry Priority Mode</label>
                  <select
                    id="new-ticket-priority"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-slate-950 text-slate-400 p-2.5 rounded-xl border border-slate-800"
                  >
                    <option value="low">Low Grid</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Care</option>
                    <option value="critical">CRITICAL SHIELD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-2">Description / Payload details</label>
                <textarea
                  id="new-ticket-body"
                  rows={4}
                  required
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 p-2.5 rounded-xl border border-slate-800 focus:outline-none resize-none"
                  placeholder="Please state diagnostic steps or serial hashes..."
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800/80">
                <button
                  id="cancel-ticket-creation"
                  type="button"
                  onClick={() => setShowOpenModal(false)}
                  className="py-2 px-4 bg-slate-950 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  id="submit-ticket-creation"
                  type="submit"
                  className="py-2 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:brightness-110"
                >
                  Publish Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
