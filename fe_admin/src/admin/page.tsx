import { useState, useEffect } from 'react';
import { Send, Users, Settings, Loader2, Home, Palette, Mail, Plus, Trash2, Star, StarOff, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { api } from '../utils/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

interface Session {
  sessionId: string;
  name: string;
  email: string;
  whatsapp: string;
  createdAt: string;
  assignedAdmin?: string;
  status: 'active' | 'finished';
  unreadCount: number;
}

interface Message {
  type: 'user' | 'admin' | 'system';
  text: string;
  timestamp: number;
  adminName?: string;
  adminAvatar?: string;
}

interface AdminProfile {
  name: string;
  email: string;
  avatar: string;
}

interface EmailRecipient {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

const DEFAULT_ADMIN_PROFILES: AdminProfile[] = [
  { name: 'Sarah Johnson', email: 'sarah@company.com', avatar: '👩‍💼' },
  { name: 'Michael Chen', email: 'michael@company.com', avatar: '👨‍💼' },
  { name: 'Emma Rodriguez', email: 'emma@company.com', avatar: '👩‍🔬' },
  { name: 'David Kim', email: 'david@company.com', avatar: '👨‍💻' }
];

export default function AdminPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminProfile>(DEFAULT_ADMIN_PROFILES[0]);
  const [adminProfiles, setAdminProfiles] = useState<AdminProfile[]>(DEFAULT_ADMIN_PROFILES);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', avatar: '👤' });
  const [environment, setEnvironment] = useState('testing-mock');
  const [themeColors, setThemeColors] = useState({
    primary: '#10b981',
    secondary: '#3b82f6',
    accent: '#8b5cf6'
  });
  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: '',
    user: '',
    password: '',
    teamEmails: ''
  });
  const [emailRecipients, setEmailRecipients] = useState<EmailRecipient[]>([]);
  const [newEmailRecipient, setNewEmailRecipient] = useState({
    email: '',
    name: '',
    is_active: true,
    is_primary: false
  });
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [activeTab, setActiveTab] = useState('emails');

  useEffect(() => {
    // Load saved data
    const savedAdmins = localStorage.getItem('admin_profiles');
    if (savedAdmins) {
      setAdminProfiles(JSON.parse(savedAdmins));
    }

    const savedTheme = localStorage.getItem('theme_colors');
    if (savedTheme) {
      setThemeColors(JSON.parse(savedTheme));
    }

    const savedSmtp = localStorage.getItem('smtp_config');
    if (savedSmtp) {
      setSmtpConfig(JSON.parse(savedSmtp));
    }

    const savedEnv = localStorage.getItem('chat_environment') || 'testing-mock';
    setEnvironment(savedEnv);

    loadSessions();
    loadEmailRecipients();
    
    // Poll sessions every 3 seconds for real-time updates
    const interval = setInterval(() => {
      loadSessions();
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedSession) {
      console.log('[DEBUG ADMIN] ========== selectedSession changed to:', selectedSession);
      // Load immediately
      loadMessages(selectedSession);
      
      // Poll messages every 2 seconds for real-time updates
      const interval = setInterval(() => {
        console.log('[DEBUG ADMIN] Polling messages for session:', selectedSession);
        loadMessages(selectedSession);
      }, 2000);
      
      return () => {
        console.log('[DEBUG ADMIN] Cleaning up interval for session:', selectedSession);
        clearInterval(interval);
      };
    } else {
      console.log('[DEBUG ADMIN] No session selected, clearing messages');
      // Clear messages when no session selected
      setMessages([]);
    }
  }, [selectedSession]);

  const loadSessions = async () => {
    try {
      const data = await api.getAdminSessions();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const loadMessages = async (sessionId: string) => {
    if (!sessionId) {
      console.log('[DEBUG ADMIN] No sessionId provided, skipping loadMessages');
      return;
    }
    
    try {
      console.log('[DEBUG ADMIN] ========== Loading messages for session:', sessionId);
      const data = await api.getMessages(sessionId);
      console.log('[DEBUG ADMIN] Raw API response:', JSON.stringify(data, null, 2));
      console.log('[DEBUG ADMIN] Messages array from API:', data.messages);
      console.log('[DEBUG ADMIN] Messages array length:', data.messages?.length || 0);
      
      // Transform messages to match expected format
      const messagesArray = data.messages || [];
      console.log('[DEBUG ADMIN] Messages array before transform:', messagesArray);
      
      const transformedMessages = messagesArray.map((msg: any) => {
        const transformed = {
          type: msg.type || 'user',
          text: msg.text || '',
          timestamp: msg.timestamp || (msg.created_at ? new Date(msg.created_at).getTime() : Date.now()),
          adminName: msg.admin_name || null,
          adminAvatar: msg.admin_avatar || null,
        };
        console.log('[DEBUG ADMIN] Transforming message:', msg, '->', transformed);
        return transformed;
      });
      
      console.log('[DEBUG ADMIN] ========== Transformed messages count:', transformedMessages.length);
      console.log('[DEBUG ADMIN] ========== Transformed messages:', JSON.stringify(transformedMessages, null, 2));
      
      if (transformedMessages.length === 0) {
        console.warn('[DEBUG ADMIN] WARNING: No messages after transformation!');
      }
      
      setMessages(transformedMessages);
      console.log('[DEBUG ADMIN] ========== Messages state updated');
    } catch (error) {
      console.error('[DEBUG ADMIN] ========== Error loading messages:', error);
      console.error('[DEBUG ADMIN] Error details:', JSON.stringify(error, null, 2));
      // Set empty array on error to prevent stale data
      setMessages([]);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyMessage.trim() || !selectedSession) {
      return;
    }

    setIsLoading(true);

    try {
      await api.sendAdminReply({
        sessionId: selectedSession,
        message: replyMessage,
        adminName: selectedAdmin.name,
        adminEmail: selectedAdmin.email,
        adminAvatar: selectedAdmin.avatar,
        environment
      });

      setReplyMessage('');
      toast.success('Reply sent successfully!');
      
      // Immediately refresh messages to show the sent reply
      await loadMessages(selectedSession);
      
      // Also refresh sessions to update unread count
      loadSessions();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send reply');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishSession = async () => {
    if (!selectedSession) return;

    try {
      await api.finishSession(selectedSession);
      toast.success('Session marked as finished!');
      
      // Immediately refresh sessions and messages
      await loadSessions();
      await loadMessages(selectedSession);
    } catch (error) {
      console.error('Error finishing session:', error);
      toast.error('Failed to finish session');
    }
  };

  const handleAddAdmin = () => {
    if (!newAdmin.name || !newAdmin.email) {
      toast.error('Please fill in all admin fields');
      return;
    }

    const updated = [...adminProfiles, newAdmin];
    setAdminProfiles(updated);
    localStorage.setItem('admin_profiles', JSON.stringify(updated));
    setNewAdmin({ name: '', email: '', avatar: '👤' });
    toast.success('Admin added successfully!');
  };

  const handleRemoveAdmin = (index: number) => {
    const updated = adminProfiles.filter((_, i) => i !== index);
    setAdminProfiles(updated);
    localStorage.setItem('admin_profiles', JSON.stringify(updated));
    toast.success('Admin removed');
  };

  const handleSaveTheme = () => {
    localStorage.setItem('theme_colors', JSON.stringify(themeColors));
    toast.success('Theme colors saved!');
  };

  const handleSaveSmtpConfig = () => {
    localStorage.setItem('smtp_config', JSON.stringify(smtpConfig));
    toast.success('SMTP configuration saved!');
  };

  const handleEnvironmentChange = (env: string) => {
    setEnvironment(env);
    localStorage.setItem('chat_environment', env);
    toast.success(`Environment switched to: ${env.replace('-', ' ')}`);
  };

  // Email Recipients Management
  const loadEmailRecipients = async () => {
    try {
      setIsLoadingEmails(true);
      const recipients = await api.getEmailRecipients();
      setEmailRecipients(recipients);
    } catch (error) {
      console.error('Error loading email recipients:', error);
      toast.error('Failed to load email recipients');
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const handleAddEmailRecipient = async () => {
    if (!newEmailRecipient.email) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      setIsLoadingEmails(true);
      await api.createEmailRecipient(newEmailRecipient);
      toast.success('Email recipient added successfully!');
      setNewEmailRecipient({ email: '', name: '', is_active: true, is_primary: false });
      loadEmailRecipients();
    } catch (error) {
      console.error('Error adding email recipient:', error);
      toast.error('Failed to add email recipient');
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const handleDeleteEmailRecipient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this email recipient?')) {
      return;
    }

    try {
      setIsLoadingEmails(true);
      await api.deleteEmailRecipient(id);
      toast.success('Email recipient deleted successfully!');
      loadEmailRecipients();
    } catch (error) {
      console.error('Error deleting email recipient:', error);
      toast.error('Failed to delete email recipient');
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const handleToggleEmailRecipient = async (id: string, isActive: boolean) => {
    try {
      setIsLoadingEmails(true);
      await api.updateEmailRecipient(id, { is_active: !isActive });
      toast.success(`Email recipient ${!isActive ? 'activated' : 'deactivated'}!`);
      loadEmailRecipients();
    } catch (error) {
      console.error('Error updating email recipient:', error);
      toast.error('Failed to update email recipient');
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const handleSetPrimaryEmail = async (id: string) => {
    try {
      setIsLoadingEmails(true);
      await api.setPrimaryEmailRecipient(id);
      toast.success('Primary email recipient updated!');
      loadEmailRecipients();
    } catch (error) {
      console.error('Error setting primary email:', error);
      toast.error('Failed to set primary email recipient');
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const handleNavigateHome = () => {
    (window as any).navigateTo('/');
  };

  const selectedSessionData = sessions.find(s => s.sessionId === selectedSession);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Environment Mode Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Mode:</label>
              <select
                value={environment}
                onChange={(e) => handleEnvironmentChange(e.target.value)}
                className="px-3 py-1.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 text-sm font-medium"
              >
                <option value="testing-mock">Testing (Mock)</option>
                <option value="testing-real">Testing (Real)</option>
                <option value="production-real">Production (Real)</option>
              </select>
            </div>
            <Button
              onClick={handleNavigateHome}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sessions List */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                Conversations ({sessions.length})
              </h2>
            </div>
            
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {sessions.map(session => (
                <div
                  key={session.sessionId}
                  className={`w-full p-3 rounded-lg transition-colors ${
                    selectedSession === session.sessionId
                      ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <button
                    onClick={() => setSelectedSession(session.sessionId)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {session.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {session.email}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {session.whatsapp}
                        </div>
                        {session.status === 'finished' && (
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                            ✅ Finished
                          </div>
                        )}
                      </div>
                      {session.unreadCount > 0 && (
                        <span className="ml-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center flex-shrink-0">
                          {session.unreadCount}
                        </span>
                      )}
                    </div>
                    {session.assignedAdmin && (
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Assigned to: {session.assignedAdmin}
                      </div>
                    )}
                  </button>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.sessionId);
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {sessions.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No conversations yet
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            {selectedSessionData ? (
              <div className="flex flex-col h-[700px]">
                {/* Chat Header */}
                <div className="p-4 border-b dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {selectedSessionData.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedSessionData.email} • {selectedSessionData.whatsapp}
                      </p>
                      {selectedSessionData.assignedAdmin && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Assigned to: {selectedSessionData.assignedAdmin}
                        </p>
                      )}
                    </div>
                    {selectedSessionData.status !== 'finished' && (
                      <Button
                        onClick={handleFinishSession}
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700"
                      >
                        ✓ Finish Session
                      </Button>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                  {(() => {
                    console.log('[DEBUG ADMIN] ========== Rendering messages. Count:', messages.length);
                    console.log('[DEBUG ADMIN] ========== Messages array:', JSON.stringify(messages, null, 2));
                    return null;
                  })()}
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      <p>No messages yet. Start the conversation!</p>
                      <div className="text-xs mt-2">
                        Debug: messages.length = {messages.length}, selectedSession = {selectedSession}
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      console.log('[DEBUG ADMIN] Rendering message', index, ':', msg);
                      return (
                      <div
                        key={index}
                        className={`flex ${msg.type === 'user' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-lg ${
                            msg.type === 'user'
                              ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm'
                              : msg.type === 'system'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700'
                              : 'bg-green-500 dark:bg-green-600 text-white'
                          }`}
                        >
                          {msg.adminName && msg.type === 'admin' && (
                            <div className="text-xs font-semibold mb-1 opacity-75">
                              {msg.adminName}
                            </div>
                          )}
                          {msg.text}
                          <div className="text-xs opacity-75 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      );
                    })
                  )}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="p-4 border-t dark:border-gray-700">
                  <div className="mb-3">
                    <Label className="text-xs dark:text-gray-300">Reply as:</Label>
                    <select
                      value={selectedAdmin.name}
                      onChange={(e) => {
                        const admin = adminProfiles.find(a => a.name === e.target.value);
                        if (admin) setSelectedAdmin(admin);
                      }}
                      className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      disabled={selectedSessionData.assignedAdmin && selectedSessionData.assignedAdmin !== selectedAdmin.name}
                    >
                      {adminProfiles.map(admin => (
                        <option key={admin.email} value={admin.name}>
                          {admin.avatar} {admin.name}
                        </option>
                      ))}
                    </select>
                    {selectedSessionData.assignedAdmin && selectedSessionData.assignedAdmin !== selectedAdmin.name && (
                      <p className="text-xs text-red-500 mt-1">
                        This conversation is assigned to {selectedSessionData.assignedAdmin}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your reply..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      rows={3}
                      disabled={isLoading}
                      className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                    <Button
                      type="submit"
                      disabled={isLoading || !replyMessage.trim()}
                      className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="h-[700px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                Select a conversation to start replying
              </div>
            )}
          </div>

          {/* Settings Panel */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4 h-auto p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <TabsTrigger 
                  value="emails" 
                  className="text-xs sm:text-sm py-2 px-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-sm"
                >
                  Email Recipients
                </TabsTrigger>
                <TabsTrigger 
                  value="admins" 
                  className="text-xs sm:text-sm py-2 px-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-sm"
                >
                  Admins
                </TabsTrigger>
                <TabsTrigger 
                  value="smtp" 
                  className="text-xs sm:text-sm py-2 px-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-sm"
                >
                  SMTP
                </TabsTrigger>
                <TabsTrigger 
                  value="theme" 
                  className="text-xs sm:text-sm py-2 px-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-sm"
                >
                  Theme
                </TabsTrigger>
              </TabsList>

              {/* Email Recipients Management Tab */}
              <TabsContent value="emails" className="space-y-4">
                <div>
                  <Label className="text-xs dark:text-gray-300 mb-2 block">
                    Email Recipients (These emails will receive notifications from chatbox)
                  </Label>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {isLoadingEmails ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                      </div>
                    ) : emailRecipients.length === 0 ? (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                        No email recipients configured. Add one to receive chat notifications.
                      </div>
                    ) : (
                      emailRecipients.map((recipient) => (
                        <div
                          key={recipient.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            recipient.is_primary
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                              : recipient.is_active
                              ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                              : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {recipient.is_primary && (
                              <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {recipient.email}
                                </div>
                                {recipient.is_primary && (
                                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded flex-shrink-0">
                                    Primary
                                  </span>
                                )}
                                {!recipient.is_active && (
                                  <span className="text-xs bg-gray-400 text-white px-2 py-0.5 rounded flex-shrink-0">
                                    Inactive
                                  </span>
                                )}
                              </div>
                              {recipient.name && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {recipient.name}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!recipient.is_primary && (
                              <button
                                onClick={() => handleSetPrimaryEmail(recipient.id)}
                                className="p-1.5 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition-colors"
                                title="Set as primary"
                              >
                                <StarOff className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleEmailRecipient(recipient.id, recipient.is_active)}
                              className={`p-1.5 rounded transition-colors ${
                                recipient.is_active
                                  ? 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600'
                                  : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                              }`}
                              title={recipient.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {recipient.is_active ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4" fill="currentColor" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteEmailRecipient(recipient.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="border-t dark:border-gray-700 pt-4">
                  <Label className="text-xs dark:text-gray-300 mb-2 block">Add New Email Recipient</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Email address (required)"
                      type="email"
                      value={newEmailRecipient.email}
                      onChange={(e) =>
                        setNewEmailRecipient({ ...newEmailRecipient, email: e.target.value })
                      }
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                    <Input
                      placeholder="Name (optional)"
                      value={newEmailRecipient.name}
                      onChange={(e) =>
                        setNewEmailRecipient({ ...newEmailRecipient, name: e.target.value })
                      }
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={newEmailRecipient.is_active}
                          onChange={(e) =>
                            setNewEmailRecipient({ ...newEmailRecipient, is_active: e.target.checked })
                          }
                          className="rounded"
                        />
                        Active
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={newEmailRecipient.is_primary}
                          onChange={(e) =>
                            setNewEmailRecipient({ ...newEmailRecipient, is_primary: e.target.checked })
                          }
                          className="rounded"
                        />
                        Set as Primary
                      </label>
                    </div>
                    <Button
                      onClick={handleAddEmailRecipient}
                      disabled={isLoadingEmails || !newEmailRecipient.email}
                      className="w-full bg-green-500 hover:bg-green-600 flex items-center justify-center gap-2"
                    >
                      {isLoadingEmails ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          Add Email Recipient
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    💡 Email recipients will receive notifications when users send messages through the chatbox.
                    Primary email will be used as the main recipient.
                  </div>
                </div>
              </TabsContent>

              {/* Admin Management Tab */}
              <TabsContent value="admins" className="space-y-4">
                <div>
                  <Label className="text-xs dark:text-gray-300 mb-2 block">Current Admins</Label>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {adminProfiles.map((admin, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{admin.avatar}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{admin.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{admin.email}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveAdmin(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t dark:border-gray-700 pt-4">
                  <Label className="text-xs dark:text-gray-300 mb-2 block">Add New Admin</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Name"
                      value={newAdmin.name}
                      onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                    <Input
                      placeholder="Avatar (emoji)"
                      value={newAdmin.avatar}
                      onChange={(e) => setNewAdmin({ ...newAdmin, avatar: e.target.value })}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                    <Button
                      onClick={handleAddAdmin}
                      className="w-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Admin
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="smtp">
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs dark:text-gray-300">SMTP Host</Label>
                    <Input
                      value={smtpConfig.host}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                      placeholder="smtp.gmail.com"
                      className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <Label className="text-xs dark:text-gray-300">SMTP Port</Label>
                    <Input
                      value={smtpConfig.port}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                      placeholder="587"
                      className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <Label className="text-xs dark:text-gray-300">SMTP User</Label>
                    <Input
                      value={smtpConfig.user}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                      placeholder="your@email.com"
                      className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <Label className="text-xs dark:text-gray-300">SMTP Password</Label>
                    <Input
                      type="password"
                      value={smtpConfig.password}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                      placeholder="••••••••"
                      className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <Label className="text-xs dark:text-gray-300">Team Emails (comma separated)</Label>
                    <Textarea
                      value={smtpConfig.teamEmails}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, teamEmails: e.target.value })}
                      placeholder="admin1@company.com, admin2@company.com"
                      rows={3}
                      className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>

                  <Button
                    onClick={handleSaveSmtpConfig}
                    className="w-full bg-blue-500 hover:bg-blue-600"
                  >
                    Save Configuration
                  </Button>

                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                    ⚠️ For production, set these as environment variables in Supabase Edge Functions.
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="theme">
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs dark:text-gray-300">Primary Color</Label>
                    <Input
                      type="color"
                      value={themeColors.primary}
                      onChange={(e) => setThemeColors({ ...themeColors, primary: e.target.value })}
                      className="mt-1 h-10 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <Label className="text-xs dark:text-gray-300">Secondary Color</Label>
                    <Input
                      type="color"
                      value={themeColors.secondary}
                      onChange={(e) => setThemeColors({ ...themeColors, secondary: e.target.value })}
                      className="mt-1 h-10 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <Label className="text-xs dark:text-gray-300">Accent Color</Label>
                    <Input
                      type="color"
                      value={themeColors.accent}
                      onChange={(e) => setThemeColors({ ...themeColors, accent: e.target.value })}
                      className="mt-1 h-10 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <Button
                    onClick={handleSaveTheme}
                    className="w-full bg-blue-500 hover:bg-blue-600"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Save Theme
                  </Button>

                  <div className="text-xs text-gray-500 dark:text-gray-400 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    💡 Theme colors are saved locally for testing. Apply them to your app's CSS for production.
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
