import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, Send, Archive, Check, X, Search, 
  MoreVertical, Paperclip, Smile, MessageSquare,
  ShieldCheck, Clock, Building2, ChevronLeft,
  User as UserIcon
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useSocket } from '../../contexts/SocketContext';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

interface Conversation {
  id: number;
  property_title: string;
  guest_first_name: string;
  guest_last_name: string;
  host_first_name: string;
  host_last_name: string;
  initiator_id: number;
  recipient_id: number;
  status: 'pending' | 'accepted' | 'declined' | 'archived';
  unread_count: number;
  latest_message: string;
  latest_message_at: string;
}

interface Message {
  id: number;
  sender_id: number;
  message_text: string;
  is_read: boolean;
  created_at: string;
  first_name: string;
  last_name: string;
}

const MessagesPage = () => {
  const { user } = useAuthStore();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('inbox_update', (data) => {
      setConversations(prev => {
        const index = prev.findIndex(c => c.id === data.conversation_id);
        if (index === -1) {
          fetchConversations();
          return prev;
        }
        const updated = [...prev];
        updated[index] = { 
          ...updated[index], 
          latest_message: data.latest_message, 
          latest_message_at: data.latest_message_at,
          unread_count: selectedConv?.id === data.conversation_id ? 0 : updated[index].unread_count + 1
        };
        return updated.sort((a, b) => new Date(b.latest_message_at).getTime() - new Date(a.latest_message_at).getTime());
      });
    });

    socket.on('status_updated', (data) => {
      setConversations(prev => prev.map(c => c.id === data.conversation_id ? { ...c, status: data.status } : c));
      if (selectedConv?.id === data.conversation_id) {
        setSelectedConv(prev => prev ? { ...prev, status: data.status } : null);
      }
    });

    return () => {
      socket.off('inbox_update');
      socket.off('status_updated');
    };
  }, [socket, selectedConv]);

  useEffect(() => {
    if (!selectedConv || !socket) return;

    socket.emit('join_conversation', selectedConv.id);
    fetchMessages(selectedConv.id);
    markAsRead(selectedConv.id);

    socket.on('new_message', (message: Message) => {
      setMessages(prev => {
        if (prev.find(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
      markAsRead(selectedConv.id);
    });

    return () => {
      socket.emit('leave_conversation', selectedConv.id);
      socket.off('new_message');
    };
  }, [selectedConv, socket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/chat/conversations');
      setConversations(data.conversations);
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (id: number) => {
    try {
      const { data } = await api.get(`/chat/conversations/${id}/messages`);
      setMessages(data.messages);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/chat/conversations/${id}/read`);
      setConversations(prev => prev.map(c => c.id === id ? { ...c, unread_count: 0 } : c));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleStatusUpdate = async (id: number, status: 'accepted' | 'declined' | 'archived') => {
    try {
      let endpoint = '';
      if (status === 'accepted') endpoint = 'accept';
      else if (status === 'declined') endpoint = 'decline';
      else if (status === 'archived') endpoint = 'archive';

      await api.put(`/chat/conversations/${id}/${endpoint}`);
    } catch (err) {
      console.error(`Failed to update status to ${status}`, err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv || selectedConv.status !== 'accepted') return;

    try {
      await api.post(`/chat/conversations/${selectedConv.id}/messages`, { message_text: newMessage });
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const filteredConversations = conversations.filter(c => {
    const name = user?.id === c.initiator_id 
      ? `${c.host_first_name} ${c.host_last_name}`
      : `${c.guest_first_name} ${c.guest_last_name}`;
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || c.property_title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading && conversations.length === 0) return <div className="p-8 flex justify-center h-screen items-center bg-white"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  return (
    <div className="flex h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] bg-[#f0f2f5] overflow-hidden font-sans">
      {/* Sidebar - WhatsApp Structure */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`w-full md:w-[30%] lg:w-[400px] flex flex-col bg-white border-r border-slate-200 z-20 ${selectedConv ? 'hidden md:flex' : 'flex'}`}
      >
        <div className="p-4 bg-[#f0f2f5] flex items-center justify-between sticky top-0 z-10">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold overflow-hidden shadow-inner">
             {user?.first_name?.charAt(0)}
          </div>
          <div className="flex gap-5 text-slate-500">
            <MessageSquare className="w-5 h-5 cursor-pointer hover:text-primary transition-colors" />
            <MoreVertical className="w-5 h-5 cursor-pointer hover:text-primary transition-colors" />
          </div>
        </div>

        <div className="p-2 bg-white">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search or start new chat"
              className="pl-12 bg-[#f0f2f5] border-none rounded-xl h-9 focus-visible:ring-0 placeholder:text-slate-500 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                <MessageSquare className="w-12 h-12 mb-3 opacity-10" />
                <p className="text-xs font-medium">No chats available</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isInitiator = user?.id === conv.initiator_id;
                const otherName = isInitiator 
                  ? `${conv.host_first_name} ${conv.host_last_name}`
                  : `${conv.guest_first_name} ${conv.guest_last_name}`;
                
                const isSelected = selectedConv?.id === conv.id;

                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`flex items-center gap-4 p-3.5 cursor-pointer transition-all duration-150 border-b border-slate-100 ${
                      isSelected 
                        ? 'bg-[#f0f2f5]' 
                        : 'hover:bg-[#f5f6f6]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg bg-slate-200 text-slate-500">
                      {otherName.charAt(0)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className="font-medium truncate text-[16px] text-slate-900">{otherName}</h4>
                        {conv.latest_message_at && (
                          <span className={`text-[11px] font-medium ${conv.unread_count > 0 ? 'text-primary' : 'text-slate-400'}`}>
                            {formatDistanceToNow(new Date(conv.latest_message_at), { addSuffix: false })}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs truncate max-w-[200px] text-slate-500 font-medium">
                          {conv.status === 'pending' 
                            ? 'Connection request...' 
                            : conv.latest_message || conv.property_title}
                        </p>
                        {conv.unread_count > 0 && (
                          <span className="flex items-center justify-center text-[10px] font-bold h-5 w-5 rounded-full bg-primary text-white shadow-sm">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main Chat Area - WhatsApp Style */}
      <div className={`flex-1 flex flex-col bg-[#efeae2] relative transition-all duration-300 ${!selectedConv ? 'hidden md:flex' : 'flex'}`}>
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="px-4 py-2.5 bg-[#f0f2f5] flex items-center justify-between sticky top-0 z-30 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden rounded-full h-8 w-8 text-slate-600" 
                  onClick={() => setSelectedConv(null)}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {user?.id === selectedConv.initiator_id 
                    ? selectedConv.host_first_name.charAt(0) 
                    : selectedConv.guest_first_name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 leading-tight">
                    {user?.id === selectedConv.initiator_id 
                      ? `${selectedConv.host_first_name} ${selectedConv.host_last_name}` 
                      : `${selectedConv.guest_first_name} ${selectedConv.guest_last_name}`}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                    {selectedConv.property_title}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-slate-500">
                <Search className="w-5 h-5 cursor-pointer hover:text-primary transition-colors" />
                <MoreVertical className="w-5 h-5 cursor-pointer hover:text-primary transition-colors" />
              </div>
            </div>

            {/* FIXED Status Bar (Pinned at top of chat area) */}
            <AnimatePresence>
              {selectedConv.status === 'pending' && (
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="sticky top-0 left-0 right-0 z-20 px-6 py-4 bg-white/90 backdrop-blur-md border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${user?.id === selectedConv.recipient_id ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-600'}`}>
                      {user?.id === selectedConv.recipient_id ? <ShieldCheck className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">
                        {user?.id === selectedConv.recipient_id ? 'New Connect Request' : 'Awaiting Connection'}
                      </h5>
                      <p className="text-xs text-slate-500">
                        {user?.id === selectedConv.recipient_id 
                          ? 'This user wants to discuss your property listing.' 
                          : 'The owner must approve this request before you can chat.'}
                      </p>
                    </div>
                  </div>
                  
                  {user?.id === selectedConv.recipient_id ? (
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button 
                        size="sm"
                        onClick={() => handleStatusUpdate(selectedConv.id, 'accepted')}
                        className="bg-primary hover:bg-primary/90 h-9 px-6 rounded-xl flex-1 md:flex-none shadow-md shadow-primary/20"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button 
                        variant="secondary"
                        size="sm"
                        onClick={() => handleStatusUpdate(selectedConv.id, 'declined')}
                        className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none h-9 px-6 rounded-xl flex-1 md:flex-none"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  ) : (
                    <div className="text-[11px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full animate-pulse border border-amber-100">
                      Pending Owner Approval
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 custom-scrollbar bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat"
            >
              {messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`relative max-w-[85%] md:max-w-[65%] group`}>
                      <div className={`px-2.5 py-1.5 shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] transition-all ${
                        isMe 
                          ? 'bg-[#d9fdd3] text-slate-900 rounded-lg rounded-tr-none' 
                          : 'bg-white text-slate-900 rounded-lg rounded-tl-none'
                      }`}>
                        <p className="text-[14.2px] leading-[1.4] mb-0.5 pr-14 break-words font-normal">{msg.message_text}</p>
                        <div className="flex items-center justify-end gap-1 absolute right-2 bottom-1.5 h-3">
                          <span className="text-[10px] text-slate-400 font-normal">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && <Check className="w-3 h-3 text-primary" />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Area */}
            <div className="px-4 py-2.5 bg-[#f0f2f5] flex items-center gap-3 sticky bottom-0 z-30">
              {selectedConv.status === 'accepted' ? (
                <>
                  <Smile className="w-6 h-6 text-slate-500 cursor-pointer hover:text-primary transition-colors" />
                  <Paperclip className="w-6 h-6 text-slate-500 cursor-pointer hover:text-primary transition-colors" />
                  <form onSubmit={sendMessage} className="flex-1 flex items-center gap-2">
                    <Input
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Type a message"
                      className="flex-1 bg-white border-none rounded-xl h-11 focus-visible:ring-0 text-[15px] font-normal shadow-sm"
                    />
                    <Button 
                      type="submit" 
                      disabled={!newMessage.trim()} 
                      className="rounded-full w-11 h-11 p-0 bg-primary hover:bg-primary/90 flex items-center justify-center shadow-md shadow-primary/20 transition-transform active:scale-95"
                    >
                      <Send className="w-5 h-5 text-white" />
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex-1 text-center py-2 text-slate-500 font-medium text-sm flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Chat will be unlocked after connection is established.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-12 text-center bg-[#f8f9fa]">
             <div className="w-64 h-64 mb-10 opacity-30 select-none grayscale contrast-125">
               <img src="https://whatsapp-desktop.web.app/assets/intro-connection-light_c98cc75f2aa905314d74375a975d2cf2.jpg" alt="Intro" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-3xl font-light text-slate-500 mb-4">RentSystem Web</h2>
            <p className="text-slate-400 max-w-sm leading-relaxed text-sm">
              Send and receive messages without keeping your phone online.<br />
              Use RentSystem on up to 4 linked devices and 1 phone at the same time.
            </p>
            <div className="mt-auto mb-10 text-[11px] flex items-center gap-1.5 text-slate-400 font-medium">
              <Archive className="w-3.5 h-3.5" /> End-to-end encrypted
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default MessagesPage;
