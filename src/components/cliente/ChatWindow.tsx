import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { X, Send, User, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Message } from '../../types';

interface ChatWindowProps {
  chatId: string;
  onClose: () => void;
  currentUserId: string;
  recipientName: string;
}

export default function ChatWindow({ chatId, onClose, currentUserId, recipientName }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(data);
    });

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const msg = newMessage;
      setNewMessage('');
      
      await addDoc(collection(db, `chats/${chatId}/messages`), {
        chatId,
        senderId: currentUserId,
        text: msg,
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: msg,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 100, scale: 0.9 }}
      className="fixed bottom-24 right-6 w-full max-w-sm bg-white rounded-[2rem] shadow-2xl border border-zinc-100 z-50 overflow-hidden flex flex-col h-[500px]"
    >
      {/* Header */}
      <div className="p-6 bg-zinc-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold">{recipientName}</h4>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest">En línea</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-center p-8">
            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm">Inicia una conversación con {recipientName}</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col max-w-[80%]",
              msg.senderId === currentUserId ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <div
              className={cn(
                "p-4 rounded-2xl text-sm",
                msg.senderId === currentUserId
                  ? "bg-theme-primary text-white rounded-br-none"
                  : "bg-zinc-100 text-zinc-900 rounded-bl-none"
              )}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-zinc-400 mt-1 uppercase font-bold tracking-tighter">
              {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ahora'}
            </span>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-50 bg-zinc-50/50 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary/20 transition-all font-medium"
        />
        <button
          type="submit"
          className="p-3 bg-theme-primary text-white rounded-xl hover:scale-105 active:scale-95 transition-all"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </motion.div>
  );
}
