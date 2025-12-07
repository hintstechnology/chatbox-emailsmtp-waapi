// GraphQL API Service
import { 
  apolloClient, 
  CREATE_SESSION, 
  SEND_MESSAGE, 
  GET_MESSAGES,
  GET_SESSION,
  GET_ADMIN_SESSIONS, 
  ADMIN_REPLY, 
  FINISH_SESSION,
  DELETE_SESSION,
  GET_EMAIL_RECIPIENTS,
  GET_ACTIVE_EMAIL_RECIPIENTS,
  CREATE_EMAIL_RECIPIENT,
  UPDATE_EMAIL_RECIPIENT,
  DELETE_EMAIL_RECIPIENT,
  SET_PRIMARY_EMAIL_RECIPIENT
} from './graphql';
import { gql } from '@apollo/client';

// API Service using GraphQL
export const api = {
  // Session endpoints
  createSession: async (data: {
    sessionId: string;
    name: string;
    email: string;
    whatsapp: string;
    environment?: string;
  }) => {
    console.log('[DEBUG API] createSession - Input:', data);
    
    const input = {
      session_id: data.sessionId,
      name: data.name,
      email: data.email,
      whatsapp: data.whatsapp,
      environment: data.environment || 'testing-mock',
      status: 'active',
    };
    
    console.log('[DEBUG API] createSession - GraphQL input:', input);
    
    try {
      const result = await apolloClient.mutate({
        mutation: gql(CREATE_SESSION),
        variables: {
          input: input,
        },
      });

      console.log('[DEBUG API] createSession - Success response:', result);
      console.log('[DEBUG API] createSession - Created session ID:', result.data.createSession?.session_id);
      
      return {
        success: true,
        session: result.data.createSession,
      };
    } catch (error: any) {
      console.error('[DEBUG API] createSession - Error:', error);
      console.error('[DEBUG API] createSession - Error message:', error?.message);
      console.error('[DEBUG API] createSession - GraphQL errors:', error?.graphQLErrors);
      console.error('[DEBUG API] createSession - Network error:', error?.networkError);
      throw error;
    }
  },

  // Message endpoints
  sendMessage: async (data: {
    sessionId: string;
    message: string;
    environment?: string;
  }) => {
    console.log('[DEBUG API] sendMessage - Input:', data);
    
    const input = {
      session_id: data.sessionId,
      type: 'user',
      text: data.message,
      environment: data.environment || 'testing-mock',
    };
    
    console.log('[DEBUG API] sendMessage - GraphQL input:', input);
    
    try {
      const result = await apolloClient.mutate({
        mutation: gql(SEND_MESSAGE),
        variables: {
          input: input,
        },
      });

      console.log('[DEBUG API] sendMessage - Success response:', result);
      
      return {
        success: true,
        message: result.data.sendMessage,
      };
    } catch (error: any) {
      console.error('[DEBUG API] sendMessage - Error:', error);
      console.error('[DEBUG API] sendMessage - Error message:', error?.message);
      console.error('[DEBUG API] sendMessage - GraphQL errors:', error?.graphQLErrors);
      console.error('[DEBUG API] sendMessage - Network error:', error?.networkError);
      throw error;
    }
  },

  getMessages: async (sessionId: string) => {
    console.log('[DEBUG API] getMessages - Session ID:', sessionId);
    
    try {
      // Get both messages and session status
      const [messagesResult, sessionResult] = await Promise.all([
        apolloClient.query({
          query: gql(GET_MESSAGES),
          variables: { sessionId },
          fetchPolicy: 'network-only',
        }).catch((error: any) => {
          console.error('[DEBUG API] getMessages - Error fetching messages:', error);
          // Check if it's a "Session not found" error
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
            // Re-throw with a clear message
            throw new Error('Session not found');
          }
          throw error;
        }),
        apolloClient.query({
          query: gql(GET_SESSION),
          variables: { sessionId },
          fetchPolicy: 'network-only',
        }).catch((error: any) => {
          console.error('[DEBUG API] getMessages - Error fetching session:', error);
          // Return null session if not found
          return { data: { session: null } };
        }),
      ]);

      const messages = messagesResult.data.messages || [];
      const session = sessionResult.data.session;
      
      console.log('[DEBUG API] ========== getMessages - Raw messagesResult.data:', JSON.stringify(messagesResult.data, null, 2));
      console.log('[DEBUG API] ========== getMessages - Messages array:', messages);
      console.log('[DEBUG API] ========== getMessages - Messages count:', messages.length);
      console.log('[DEBUG API] ========== getMessages - Session:', session ? 'Found' : 'Not found');
      console.log('[DEBUG API] ========== getMessages - Session data:', session);
      
      // If session is null, it means session not found
      if (!session) {
        console.log('[DEBUG API] getMessages - Session not found, throwing error');
        throw new Error('Session not found');
      }
    
      // Transform to match expected format
      return {
        messages: messages.map((msg: any) => ({
          type: msg.type,
          text: msg.text,
          timestamp: msg.timestamp || (msg.created_at ? new Date(msg.created_at).getTime() : Date.now()),
          adminName: msg.admin_name || null,
          adminAvatar: msg.admin_avatar || null,
        })),
        assignedAdmin: session?.assigned_admin || null,
        status: session?.status || 'active',
      };
    } catch (error: any) {
      console.error('[DEBUG API] getMessages - Error:', error);
      console.error('[DEBUG API] getMessages - Error message:', error?.message);
      
      // Re-throw the error so it can be caught by the caller
      throw error;
    }
  },

  // Admin endpoints
  getAdminSessions: async () => {
    const result = await apolloClient.query({
      query: gql(GET_ADMIN_SESSIONS),
      fetchPolicy: 'network-only',
    });

    const sessions = result.data.adminSessions || [];
    
    // Transform to match expected format
    return {
      sessions: sessions.map((session: any) => ({
        sessionId: session.session_id,
        name: session.name,
        email: session.email,
        whatsapp: session.whatsapp,
        createdAt: session.created_at,
        assignedAdmin: session.assigned_admin,
        status: session.status,
        unreadCount: session.unread_count || 0,
      })),
    };
  },

  sendAdminReply: async (data: {
    sessionId: string;
    message: string;
    adminName: string;
    adminEmail: string;
    adminAvatar?: string;
    environment?: string;
  }) => {
    const result = await apolloClient.mutate({
      mutation: gql(ADMIN_REPLY),
      variables: {
        input: {
          session_id: data.sessionId,
          message: data.message,
          admin_name: data.adminName,
          admin_email: data.adminEmail,
          admin_avatar: data.adminAvatar || null,
          environment: data.environment || 'testing-mock',
        },
      },
    });

    return {
      success: true,
      message: result.data.adminReply,
    };
  },

  finishSession: async (sessionId: string) => {
    const result = await apolloClient.mutate({
      mutation: gql(FINISH_SESSION),
      variables: { sessionId },
    });

    return {
      success: true,
      session: result.data.finishSession,
    };
  },

  deleteSession: async (sessionId: string) => {
    const result = await apolloClient.mutate({
      mutation: gql(DELETE_SESSION),
      variables: { sessionId },
    });

    return {
      success: true,
      deleted: result.data.deleteSession,
    };
  },

  // Email Recipients
  getEmailRecipients: async () => {
    const result = await apolloClient.query({
      query: gql(GET_EMAIL_RECIPIENTS),
      fetchPolicy: 'network-only',
    });

    return result.data.emailRecipients || [];
  },

  getActiveEmailRecipients: async () => {
    const result = await apolloClient.query({
      query: gql(GET_ACTIVE_EMAIL_RECIPIENTS),
      fetchPolicy: 'network-only',
    });

    return result.data.activeEmailRecipients || [];
  },

  createEmailRecipient: async (data: {
    email: string;
    name?: string;
    is_active?: boolean;
    is_primary?: boolean;
  }) => {
    const result = await apolloClient.mutate({
      mutation: gql(CREATE_EMAIL_RECIPIENT),
      variables: { input: data },
    });

    return result.data.createEmailRecipient;
  },

  updateEmailRecipient: async (id: string, data: {
    email?: string;
    name?: string;
    is_active?: boolean;
    is_primary?: boolean;
  }) => {
    const result = await apolloClient.mutate({
      mutation: gql(UPDATE_EMAIL_RECIPIENT),
      variables: { id, input: data },
    });

    return result.data.updateEmailRecipient;
  },

  deleteEmailRecipient: async (id: string) => {
    const result = await apolloClient.mutate({
      mutation: gql(DELETE_EMAIL_RECIPIENT),
      variables: { id },
    });

    return result.data.deleteEmailRecipient;
  },

  setPrimaryEmailRecipient: async (id: string) => {
    const result = await apolloClient.mutate({
      mutation: gql(SET_PRIMARY_EMAIL_RECIPIENT),
      variables: { id },
    });

    return result.data.setPrimaryEmailRecipient;
  },
};
