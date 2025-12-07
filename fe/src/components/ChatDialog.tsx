import { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Send, Loader2, X, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../utils/api';
import { motion, AnimatePresence } from 'motion/react';

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onNewMessage: () => void;
  onStatusChange: (status: 'idle' | 'active' | 'finished') => void;
}

interface Message {
  type: 'user' | 'admin' | 'system';
  text: string;
  timestamp: number;
  adminName?: string;
  adminAvatar?: string;
}

export default function ChatDialog({ isOpen, onClose, onNewMessage, onStatusChange }: ChatDialogProps) {
  const [step, setStep] = useState<'form' | 'chat'>('form');
  const [userInfo, setUserInfo] = useState({
    name: '',
    whatsapp: '',
    email: ''
  });
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [assignedAdmin, setAssignedAdmin] = useState<string | null>(null);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [sessionNotFound, setSessionNotFound] = useState(false); // Track if session is not found
  const [resetKey, setResetKey] = useState(0); // Key untuk force reset form
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Restore chat state from localStorage (only on mount, skip if explicitly cleared)
  useEffect(() => {
    // Check if we should skip restore (after starting new session)
    const skipRestore = sessionStorage.getItem('skip_restore_chat');
    if (skipRestore === 'true') {
      sessionStorage.removeItem('skip_restore_chat');
      // Force clear all state
      setStep('form');
      setUserInfo({ name: '', whatsapp: '', email: '' });
      setMessage('');
      setChatMessages([]);
      setSessionId('');
      setAssignedAdmin(null);
      setSessionFinished(false);
      setResetKey(prev => prev + 1); // Force form reset
      return; // Skip restore
    }

    const savedStep = localStorage.getItem('chat_step');
    const savedUserInfo = localStorage.getItem('chat_user_info');
    const savedSessionId = localStorage.getItem('chat_session_id');
    const savedMessages = localStorage.getItem('chat_messages');
    const savedAssignedAdmin = localStorage.getItem('chat_assigned_admin');
    const savedSessionFinished = localStorage.getItem('chat_session_finished');

    // Only restore if session is not finished
    if (savedSessionFinished !== 'true') {
      if (savedStep) setStep(savedStep as 'form' | 'chat');
      if (savedUserInfo) {
        try {
          const parsed = JSON.parse(savedUserInfo);
          setUserInfo(parsed);
        } catch (e) {
          setUserInfo({ name: '', whatsapp: '', email: '' });
        }
      }
      if (savedSessionId) setSessionId(savedSessionId);
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          setChatMessages(parsed);
        } catch (e) {
          setChatMessages([]);
        }
      }
      if (savedAssignedAdmin) setAssignedAdmin(savedAssignedAdmin);
    } else {
      // If session is finished, reset to form
      setStep('form');
      setUserInfo({ name: '', whatsapp: '', email: '' });
      setChatMessages([]);
      setSessionId('');
      setAssignedAdmin(null);
      setResetKey(prev => prev + 1);
    }
  }, []);

  // Save chat state to localStorage (only if not finished and has valid data)
  useEffect(() => {
    if (sessionFinished) {
      // Don't save if session is finished
      return;
    }
    
    localStorage.setItem('chat_step', step);
    localStorage.setItem('chat_user_info', JSON.stringify(userInfo));
    localStorage.setItem('chat_session_id', sessionId);
    localStorage.setItem('chat_messages', JSON.stringify(chatMessages));
    if (assignedAdmin) {
      localStorage.setItem('chat_assigned_admin', assignedAdmin);
    } else {
      localStorage.removeItem('chat_assigned_admin');
    }
    localStorage.setItem('chat_session_finished', sessionFinished ? 'true' : 'false');
  }, [step, userInfo, sessionId, chatMessages, assignedAdmin, sessionFinished]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Poll for new messages and session status
  useEffect(() => {
    if (step === 'chat' && sessionId) {
      // Clear any existing interval
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }

      const pollMessages = async () => {
        try {
          console.log('[DEBUG] Polling messages for session:', sessionId);
          const data = await api.getMessages(sessionId);
          const newMessages = data.messages || [];
          
          console.log('[DEBUG] Polled messages count:', newMessages.length);
          console.log('[DEBUG] Polled messages:', JSON.stringify(newMessages, null, 2));
          
          // Reset sessionNotFound if we successfully get messages
          if (sessionNotFound) {
            setSessionNotFound(false);
          }
          
          // Always update messages regardless of admin status or activity
          // This ensures chat stays in sync even when admin is not active
          setChatMessages(prev => {
            console.log('[DEBUG] Previous messages count:', prev.length);
            console.log('[DEBUG] New messages count:', newMessages.length);
            // Check for new admin messages specifically for notification
            const lastAdminMessage = newMessages.filter((m: Message) => m.type === 'admin').pop();
            const currentLastAdminMessage = prev.filter(m => m.type === 'admin').pop();
            
            if (lastAdminMessage && (!currentLastAdminMessage || lastAdminMessage.timestamp > currentLastAdminMessage.timestamp)) {
              // New admin message received - play notification
              if (!isOpen) {
                playNotificationSound();
                onNewMessage();
              }
            }
            
            // Always return new messages to update the chat (regardless of admin status)
            // This ensures messages are always synced, not just when admin is active
            return newMessages;
          });
          
          // Update assigned admin if available
          setAssignedAdmin(prev => {
            if (data.assignedAdmin && !prev) {
              return data.assignedAdmin;
            }
            return prev;
          });

          // Check if session is finished
          if (data.status === 'finished') {
            setSessionFinished(true);
            // Stop polling when session is finished
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            // Add system message about session completion
            const systemMessage: Message = {
              type: 'system',
              text: 'Your conversation has been completed by our team. You can start a new session or review your chat history.',
              timestamp: Date.now()
            };
            setChatMessages(prev => {
              // Check if system message already exists
              const hasSystemMessage = prev.some(m => m.type === 'system' && m.text.includes('completed'));
              if (!hasSystemMessage) {
                return [...prev, systemMessage];
              }
              return prev;
            });
          }
        } catch (error: any) {
          console.error('[DEBUG] Error polling messages:', error);
          
          // Check if error is "Session not found"
          const errorMessage = error?.message || '';
          const graphQLErrors = error?.graphQLErrors || [];
          const hasSessionNotFound = 
            errorMessage.toLowerCase().includes('session not found') ||
            errorMessage.toLowerCase().includes('not found') ||
            graphQLErrors.some((e: any) => 
              e?.message?.toLowerCase().includes('session not found') ||
              e?.message?.toLowerCase().includes('not found')
            );
          
          if (hasSessionNotFound) {
            console.log('[DEBUG] Session not found detected in polling, setting sessionNotFound flag');
            setSessionNotFound(true);
            // Stop polling if session not found
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          }
        }
      };

      // Poll immediately, then every 2 seconds
      pollMessages();
      pollIntervalRef.current = setInterval(pollMessages, 2000);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      };
    } else {
      // Clear interval if not in chat mode or session finished
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  }, [step, sessionId, isOpen, sessionFinished, onNewMessage]);

  // Update chat status
  useEffect(() => {
    if (step === 'chat' && chatMessages.length > 0) {
      const hasAdminReply = chatMessages.some(m => m.type === 'admin');
      onStatusChange(sessionFinished ? 'finished' : hasAdminReply ? 'finished' : 'active');
    } else {
      onStatusChange('idle');
    }
  }, [step, chatMessages, sessionFinished, onStatusChange]);

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('[DEBUG] handleInfoSubmit - Start');
    console.log('[DEBUG] User info:', userInfo);
    
    // Trim all inputs
    const trimmedUserInfo = {
      name: userInfo.name.trim(),
      whatsapp: userInfo.whatsapp.trim(),
      email: userInfo.email.trim()
    };

    console.log('[DEBUG] Trimmed user info:', trimmedUserInfo);

    // Validation
    if (!trimmedUserInfo.name || !trimmedUserInfo.whatsapp || !trimmedUserInfo.email) {
      console.log('[DEBUG] Validation failed: missing fields');
      toast.error('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedUserInfo.email)) {
      console.log('[DEBUG] Validation failed: invalid email');
      toast.error('Please enter a valid email address');
      return;
    }

    // WhatsApp validation (basic)
    const whatsappRegex = /^\+?[1-9]\d{1,14}$/;
    if (!whatsappRegex.test(trimmedUserInfo.whatsapp)) {
      console.log('[DEBUG] Validation failed: invalid WhatsApp');
      toast.error('Please enter a valid WhatsApp number (e.g., +1234567890)');
      return;
    }

    // Update state with trimmed values
    setUserInfo(trimmedUserInfo);
    setIsSubmitting(true);

    // Create session
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    
    console.log('[DEBUG] Created session ID:', newSessionId);

    try {
      const env = localStorage.getItem('chat_environment') || 'testing-mock';
      console.log('[DEBUG] Environment:', env);
      
      const sessionData = {
        sessionId: newSessionId,
        ...trimmedUserInfo,
        environment: env
      };
      console.log('[DEBUG] Sending createSession request:', sessionData);
      
      // Save session to backend
      const result = await api.createSession(sessionData);
      console.log('[DEBUG] CreateSession response:', result);
      
      // IMPORTANT: Use the session_id returned from backend (in case backend modifies it)
      const actualSessionId = result.session?.session_id || newSessionId;
      console.log('[DEBUG] Actual session ID from backend:', actualSessionId);
      console.log('[DEBUG] Original session ID:', newSessionId);
      
      // ALWAYS update sessionId state with the actual session ID from backend
      // This ensures we use the exact session ID that backend created/stored
      setSessionId(actualSessionId);
      console.log('[DEBUG] Updated sessionId state to:', actualSessionId);
      
      // Also update localStorage immediately to ensure consistency
      localStorage.setItem('chat_session_id', actualSessionId);
      console.log('[DEBUG] Updated localStorage chat_session_id to:', actualSessionId);

      // Clear skip restore flag since we're starting fresh
      sessionStorage.removeItem('skip_restore_chat');
      
      setStep('chat');
      setChatMessages([
        { type: 'admin', text: `Hi ${trimmedUserInfo.name}! How can we help you today?`, timestamp: Date.now() }
      ]);
      setSessionFinished(false);
      setSessionNotFound(false); // Reset session not found flag
      console.log('[DEBUG] Session created successfully, moved to chat step');
    } catch (error) {
      console.error('[DEBUG] Error creating session:', error);
      console.error('[DEBUG] Error details:', JSON.stringify(error, null, 2));
      toast.error('Failed to start chat. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('[DEBUG] handleSendMessage - Start');
    console.log('[DEBUG] Current sessionId:', sessionId);
    console.log('[DEBUG] Message:', message);
    console.log('[DEBUG] Session finished:', sessionFinished);
    
    if (!message.trim() || sessionFinished) {
      console.log('[DEBUG] Message send blocked - empty message or session finished');
      return;
    }

    const userMessage = message.trim();
    setMessage('');
    
    // Add user message to chat immediately
    const newMessage: Message = { 
      type: 'user', 
      text: userMessage, 
      timestamp: Date.now() 
    };
    setChatMessages(prev => [...prev, newMessage]);
    
    setIsSubmitting(true);

    try {
      const env = localStorage.getItem('chat_environment') || 'testing-mock';
      
      // Double-check sessionId before sending
      const currentSessionId = sessionId || localStorage.getItem('chat_session_id') || '';
      console.log('[DEBUG] Current sessionId from state:', sessionId);
      console.log('[DEBUG] Current sessionId from localStorage:', localStorage.getItem('chat_session_id'));
      console.log('[DEBUG] Using sessionId for message:', currentSessionId);
      
      if (!currentSessionId) {
        console.error('[DEBUG] No session ID available! Cannot send message.');
        toast.error('Session ID not found. Please start a new session.');
        setIsSubmitting(false);
        return;
      }
      
      const messageData = {
        sessionId: currentSessionId,
        message: userMessage,
        environment: env
      };
      
      console.log('[DEBUG] Sending message request:', messageData);
      
      // Save message to backend
      const result = await api.sendMessage(messageData);
      
      console.log('[DEBUG] Message sent successfully:', result);

      // Immediately refresh messages to get latest from server
      try {
        console.log('[DEBUG] Refreshing messages for session:', currentSessionId);
        const data = await api.getMessages(currentSessionId);
        console.log('[DEBUG] Refreshed messages:', data);
        setChatMessages(data.messages || []);
      } catch (refreshError) {
        console.error('[DEBUG] Error refreshing messages:', refreshError);
      }

    } catch (error: any) {
      console.error('[DEBUG] Error submitting message:', error);
      console.error('[DEBUG] Error message:', error?.message);
      console.error('[DEBUG] Error stack:', error?.stack);
      console.error('[DEBUG] Full error object:', JSON.stringify(error, null, 2));
      
      // Check if error is "Session not found"
      const errorMessage = error?.message || '';
      const graphQLErrors = error?.graphQLErrors || [];
      const hasSessionNotFound = 
        errorMessage.toLowerCase().includes('session not found') ||
        errorMessage.toLowerCase().includes('not found') ||
        graphQLErrors.some((e: any) => 
          e?.message?.toLowerCase().includes('session not found') ||
          e?.message?.toLowerCase().includes('not found')
        );
      
      if (hasSessionNotFound) {
        console.log('[DEBUG] Session not found detected, setting sessionNotFound flag');
        setSessionNotFound(true);
        // Remove the message we just added since it failed
        setChatMessages(prev => prev.slice(0, -1));
        toast.error('Session not found. Please start a new session to continue chatting.');
      } else {
        if (error?.graphQLErrors) {
          console.error('[DEBUG] GraphQL errors:', error.graphQLErrors);
        }
        if (error?.networkError) {
          console.error('[DEBUG] Network error:', error.networkError);
        }
        toast.error('Failed to send message. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartNewSession = () => {
    // Stop polling
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    
    // Clear all chat state FIRST
    setStep('form');
    setUserInfo({ name: '', whatsapp: '', email: '' });
    setMessage('');
    setChatMessages([]);
    setSessionId('');
    setAssignedAdmin(null);
    setSessionFinished(false);
    setSessionNotFound(false); // Reset session not found flag
    setIsSubmitting(false);
    setResetKey(prev => prev + 1); // Force form reset
    
    // Clear localStorage AFTER state is cleared
    setTimeout(() => {
      localStorage.removeItem('chat_step');
      localStorage.removeItem('chat_user_info');
      localStorage.removeItem('chat_session_id');
      localStorage.removeItem('chat_messages');
      localStorage.removeItem('chat_assigned_admin');
      localStorage.removeItem('chat_session_finished');
    }, 0);
    
    // Set flag to skip restore on next render
    sessionStorage.setItem('skip_restore_chat', 'true');
    
    // Force re-render to show form
    onStatusChange('idle');
  };

  const handleMinimize = () => {
    // Just minimize, don't clear data - state is preserved in localStorage
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-24 right-6 w-[380px] max-w-[calc(100vw-3rem)] sm:max-w-[380px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
      >
        {/* Chat Header */}
        <div className="bg-green-500 dark:bg-green-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-500 dark:text-green-600">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Customer Support</h3>
                <p className="text-xs text-green-100">
                  {assignedAdmin ? `Chatting with ${assignedAdmin}` : "We'll reply via email"}
                </p>
              </div>
            </div>
            <button 
              onClick={handleMinimize}
              className="text-white hover:bg-green-600 dark:hover:bg-green-700 p-1.5 rounded transition-colors"
              aria-label="Minimize chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {step === 'form' ? (
          /* Contact Information Form */
          <div className="p-6">
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Start a conversation</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please provide your contact information to begin
              </p>
            </div>
            
            <form key={`form-${resetKey}`} onSubmit={handleInfoSubmit} className="space-y-4">
              <div>
                <Label htmlFor={`name-${resetKey}`} className="text-xs dark:text-gray-300">Name *</Label>
                <Input
                  key={`name-input-${resetKey}`}
                  id={`name-${resetKey}`}
                  type="text"
                  placeholder="Your full name"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                  className="mt-1 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  autoComplete="off"
                />
              </div>

              <div>
                <Label htmlFor={`whatsapp-${resetKey}`} className="text-xs dark:text-gray-300">WhatsApp Number *</Label>
                <Input
                  key={`whatsapp-input-${resetKey}`}
                  id={`whatsapp-${resetKey}`}
                  type="tel"
                  placeholder="+1234567890"
                  value={userInfo.whatsapp}
                  onChange={(e) => setUserInfo({ ...userInfo, whatsapp: e.target.value })}
                  className="mt-1 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  autoComplete="off"
                />
              </div>

              <div>
                <Label htmlFor={`email-${resetKey}`} className="text-xs dark:text-gray-300">Email *</Label>
                <Input
                  key={`email-input-${resetKey}`}
                  id={`email-${resetKey}`}
                  type="email"
                  placeholder="your.email@example.com"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                  className="mt-1 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  autoComplete="off"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
              >
                Start Chat
              </Button>
            </form>
          </div>
        ) : (
          /* Chat Interface */
          <div className="flex flex-col">
            {/* Session Not Found Banner */}
            {sessionNotFound && (
              <div className="bg-red-50 dark:bg-red-900/20 border-b dark:border-red-800 p-4">
                <div className="flex items-start gap-2 mb-3">
                  <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                      Session Not Found
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300">
                      Your previous session may have been deleted or expired. Please start a new session to continue chatting.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleStartNewSession}
                  className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-semibold py-2"
                >
                  Start New Session
                </Button>
              </div>
            )}

            {/* Session Finished Banner */}
            {sessionFinished && !sessionNotFound && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b dark:border-yellow-800 p-4">
                <div className="flex items-start gap-2 mb-3">
                  <span className="text-yellow-600 dark:text-yellow-400 text-xl">✅</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                      Session Completed
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      Your conversation has been completed by our team. You can review your chat or start a new conversation.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleStartNewSession}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800 text-white font-semibold py-2"
                >
                  Start New Session
                </Button>
              </div>
            )}

            {/* Messages Area */}
            <div className="h-[400px] overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
              {chatMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.type === 'admin' && msg.adminAvatar && (
                      <div className="w-8 h-8 rounded-full mr-2 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-lg">
                        {msg.adminAvatar}
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${
                        msg.type === 'user'
                          ? 'bg-green-500 dark:bg-green-600 text-white rounded-br-none'
                          : msg.type === 'system'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg border border-blue-300 dark:border-blue-700'
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {msg.adminName && msg.type === 'admin' && (
                        <div className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">
                          {msg.adminName}
                        </div>
                      )}
                      {msg.text}
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
              {sessionNotFound && (
                <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-800 dark:text-red-200">
                  ⚠️ Session not found. Please start a new session to continue chatting.
                </div>
              )}
              {sessionFinished && !sessionNotFound && (
                <div className="mb-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-800 dark:text-yellow-200">
                  ⚠️ This session has been completed. Please start a new session to continue chatting.
                </div>
              )}
              <div className="flex gap-2 mb-2">
                <Input
                  type="text"
                  placeholder={
                    sessionNotFound 
                      ? "Session not found - Start new session to continue" 
                      : sessionFinished 
                        ? "Session completed - Start new session to continue" 
                        : "Type your message..."
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSubmitting || sessionFinished || sessionNotFound}
                  className="flex-1 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                />
                <Button 
                  type="submit" 
                  size="icon"
                  className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || !message.trim() || sessionFinished || sessionNotFound}
                  title={
                    sessionNotFound 
                      ? "Session not found. Please start a new session." 
                      : sessionFinished 
                        ? "Session completed. Please start a new session." 
                        : ""
                  }
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {sessionNotFound 
                  ? 'Session not found. Please start a new session to continue.' 
                  : sessionFinished 
                    ? 'Session has been completed. Please start a new session to continue.' 
                    : `Our team will reply to: ${userInfo.email}`}
              </p>
              
              {/* Start New Session Button - Always visible when session not found or finished */}
              {(sessionNotFound || sessionFinished) && (
                <Button
                  onClick={handleStartNewSession}
                  className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold py-2"
                >
                  Start New Session
                </Button>
              )}
            </form>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
