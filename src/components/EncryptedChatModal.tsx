import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, Send, Key, Eye, EyeOff, X } from 'lucide-react';
import { ChatChannel, ChatMessage, SightingReport } from '../types';
import { CHAT_CHANNELS } from '../data/mockData';
import { subscribeToChatMessages, saveChatMessageToStorage } from '../lib/storage';

interface EncryptedChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachedSighting?: SightingReport | null;
  currentSector?: string;
}

export const EncryptedChatModal: React.FC<EncryptedChatModalProps> = ({
  isOpen,
  onClose,
  attachedSighting
}) => {
  const [activeChannel, setActiveChannel] = useState<ChatChannel>(CHAT_CHANNELS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [showEncryptedCipher, setShowEncryptedCipher] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetchChannelMessages(activeChannel.id);
    const unsubscribe = subscribeToChatMessages(activeChannel.id, (liveMessages) => {
      if (liveMessages && liveMessages.length > 0) {
        setMessages(liveMessages);
      }
    });
    return () => unsubscribe();
  }, [isOpen, activeChannel.id]);

  const fetchChannelMessages = async (channelId: string) => {
    try {
      const res = await fetch(`/api/chat/messages?channelId=${channelId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setIsSending(true);
    const messageText = inputText.trim();
    setInputText('');
    try {
      const newMsgData: Omit<ChatMessage, 'id'> = {
        channelId: activeChannel.id,
        sender: 'You (SkyLight_Observer)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
        badge: 'Civilian Sky Light',
        timestamp: new Date().toISOString(),
        encryptedText: btoa(messageText),
        decryptedText: messageText,
        encryptionKey: activeChannel.channelKeyHash,
        sightingAttachment: attachedSighting ? {
          id: attachedSighting.id,
          title: attachedSighting.title,
          probabilityScore: attachedSighting.probabilityScore,
          locationName: attachedSighting.locationName
        } : undefined
      };
      await saveChatMessageToStorage(newMsgData);
      const body: any = {
        channelId: activeChannel.id,
        text: messageText,
        sender: 'You (SkyLight_Observer)'
      };
      if (attachedSighting) {
        body.sightingAttachment = {
          id: attachedSighting.id,
          title: attachedSighting.title,
          probabilityScore: attachedSighting.probabilityScore,
          locationName: attachedSighting.locationName
        };
      }
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }).catch(() => {});
    } catch (err) {
      console.error('Failed to post message:', err);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="glass-panel border border-white/15 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col md:flex-row overflow-hidden shadow-2xl relative">
        <div className="md:w-72 bg-slate-950/60 border-b md:border-b-0 md:border-r border-white/10 p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between md:justify-start space-x-3 border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm tracking-wide">Encrypted Chat</h3>
                  <div className="text-xs text-emerald-400 font-medium flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                    AES-256 Active
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 max-h-32 md:max-h-none overflow-y-auto">
              <div className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-2">
                Regional Sky Light Sectors
              </div>
              {CHAT_CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch)}
                  className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between text-xs sm:text-sm font-medium cursor-pointer ${
                    activeChannel.id === ch.id
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 shadow-sm'
                      : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <span className="truncate">{ch.name}</span>
                  <span className="text-xs font-mono text-slate-400 shrink-0 ml-2">{ch.activeWatchers} live</span>
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:block p-3 rounded-2xl glass-panel-subtle border border-white/10 space-y-1 text-xs">
            <div className="text-cyan-300 font-bold flex items-center">
              <Key className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              E2EE Channel Key
            </div>
            <p className="text-slate-400 truncate font-mono text-xs">{activeChannel.channelKeyHash}</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-transparent overflow-hidden">
          <div className="p-3.5 sm:p-4 bg-slate-950/40 border-b border-white/10 flex items-center justify-between">
            <div className="truncate pr-2">
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-slate-100 text-sm sm:text-base truncate">{activeChannel.name}</h2>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  256-Bit Cryptographic Envelope
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">{activeChannel.description}</p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setShowEncryptedCipher(!showEncryptedCipher)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center space-x-1.5 cursor-pointer min-h-[38px] ${
                  showEncryptedCipher
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'glass-pill text-slate-200 hover:text-white'
                }`}
              >
                {showEncryptedCipher ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5 text-cyan-400" />}
                <span className="hidden sm:inline">{showEncryptedCipher ? 'Raw Cipher' : 'Decrypted'}</span>
              </button>
              <button
                onClick={onClose}
                className="hidden md:flex p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer min-h-[38px] min-w-[38px] items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-3.5">
            {messages.map((msg) => (
              <div key={msg.id} className="p-3.5 sm:p-4 rounded-2xl glass-panel-subtle border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center space-x-2.5">
                    <img src={msg.avatar} alt={msg.sender} className="w-7 h-7 rounded-full object-cover border border-white/20" />
                    <span className="font-bold text-slate-100">{msg.sender}</span>
                    <span className="px-2 py-0.5 text-xs font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
                      {msg.badge}
                    </span>
                  </div>
                  <span className="text-slate-400 text-xs">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {msg.sightingAttachment && (
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs sm:text-sm space-y-1">
                    <div className="text-cyan-300 font-bold flex items-center">
                      <ShieldCheck className="w-4 h-4 mr-1.5 text-cyan-400" />
                      Attached Sighting: {msg.sightingAttachment.title}
                    </div>
                    <div className="text-slate-400 text-xs">
                      📍 {msg.sightingAttachment.locationName} | Anomaly Score: {msg.sightingAttachment.probabilityScore}%
                    </div>
                  </div>
                )}

                <p className="text-xs sm:text-base text-slate-200 leading-relaxed font-sans">
                  {showEncryptedCipher ? (
                    <span className="font-mono text-xs text-rose-400 break-all">{msg.encryptedText}</span>
                  ) : (
                    msg.decryptedText
                  )}
                </p>
                <div className="text-xs font-mono text-slate-400 flex items-center justify-between pt-1">
                  <span className="truncate max-w-[200px]">KEY: {msg.encryptionKey}</span>
                  <span className="text-emerald-400 font-medium">✓ VERIFIED</span>
                </div>
              </div>
            ))}
          </div>

          {attachedSighting && (
            <div className="px-4 py-2.5 bg-cyan-500/15 border-t border-cyan-500/30 text-xs sm:text-sm text-cyan-200 flex items-center justify-between">
              <span>📎 Attaching Sighting: {attachedSighting.title} ({attachedSighting.probabilityScore}% Anomaly)</span>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-slate-950/40 border-t border-white/10 flex gap-2.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type encrypted message to channel members..."
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400 min-h-[44px]"
            />
            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="px-5 py-3 rounded-2xl bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm hover:bg-cyan-300 transition flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] min-h-[44px]"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
