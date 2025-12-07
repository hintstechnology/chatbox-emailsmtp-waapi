import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:5000/graphql';

const httpLink = createHttpLink({
  uri: GRAPHQL_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
    query: {
      fetchPolicy: 'network-only',
    },
  },
});

// GraphQL Queries
export const GET_SESSIONS = `
  query GetSessions {
    sessions {
      id
      session_id
      name
      email
      whatsapp
      environment
      assigned_admin
      status
      created_at
      unread_count
    }
  }
`;

export const GET_SESSION = `
  query GetSession($sessionId: String!) {
    session(sessionId: $sessionId) {
      id
      session_id
      name
      email
      whatsapp
      environment
      assigned_admin
      status
      created_at
      messages {
        id
        type
        text
        admin_name
        admin_email
        admin_avatar
        timestamp
        created_at
      }
      unread_count
    }
  }
`;

export const GET_MESSAGES = `
  query GetMessages($sessionId: String!) {
    messages(sessionId: $sessionId) {
      id
      session_id
      type
      text
      admin_name
      admin_email
      admin_avatar
      timestamp
      created_at
    }
  }
`;

export const GET_ADMIN_SESSIONS = `
  query GetAdminSessions {
    adminSessions {
      id
      session_id
      name
      email
      whatsapp
      environment
      assigned_admin
      status
      created_at
      unread_count
    }
  }
`;

// GraphQL Mutations
export const CREATE_SESSION = `
  mutation CreateSession($input: CreateSessionInput!) {
    createSession(input: $input) {
      id
      session_id
      name
      email
      whatsapp
      environment
      status
      created_at
    }
  }
`;

export const SEND_MESSAGE = `
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      session_id
      type
      text
      timestamp
      created_at
    }
  }
`;

export const ADMIN_REPLY = `
  mutation AdminReply($input: AdminReplyInput!) {
    adminReply(input: $input) {
      id
      session_id
      type
      text
      admin_name
      admin_email
      admin_avatar
      timestamp
      created_at
    }
  }
`;

export const FINISH_SESSION = `
  mutation FinishSession($sessionId: String!) {
    finishSession(sessionId: $sessionId) {
      id
      session_id
      status
    }
  }
`;

export const DELETE_SESSION = `
  mutation DeleteSession($sessionId: String!) {
    deleteSession(sessionId: $sessionId)
  }
`;

// Email Recipients Queries
export const GET_EMAIL_RECIPIENTS = `
  query GetEmailRecipients {
    emailRecipients {
      id
      email
      name
      is_active
      is_primary
      created_at
      updated_at
    }
  }
`;

export const GET_ACTIVE_EMAIL_RECIPIENTS = `
  query GetActiveEmailRecipients {
    activeEmailRecipients {
      id
      email
      name
      is_active
      is_primary
      created_at
      updated_at
    }
  }
`;

// Email Recipients Mutations
export const CREATE_EMAIL_RECIPIENT = `
  mutation CreateEmailRecipient($input: CreateEmailRecipientInput!) {
    createEmailRecipient(input: $input) {
      id
      email
      name
      is_active
      is_primary
      created_at
    }
  }
`;

export const UPDATE_EMAIL_RECIPIENT = `
  mutation UpdateEmailRecipient($id: ID!, $input: UpdateEmailRecipientInput!) {
    updateEmailRecipient(id: $id, input: $input) {
      id
      email
      name
      is_active
      is_primary
      updated_at
    }
  }
`;

export const DELETE_EMAIL_RECIPIENT = `
  mutation DeleteEmailRecipient($id: ID!) {
    deleteEmailRecipient(id: $id) {
      id
      email
    }
  }
`;

export const SET_PRIMARY_EMAIL_RECIPIENT = `
  mutation SetPrimaryEmailRecipient($id: ID!) {
    setPrimaryEmailRecipient(id: $id) {
      id
      email
      name
      is_active
      is_primary
      updated_at
    }
  }
`;

