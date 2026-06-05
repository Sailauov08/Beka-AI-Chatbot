const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

export const paymentAPI = {
  getPlans: async () => {
    const response = await fetch(`${API_BASE}/payment/plans`);
    return handleResponse(response);
  },

  getStatus: async () => {
    const response = await fetch(`${API_BASE}/payment/status`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createCheckout: async (planId) => {
    const response = await fetch(`${API_BASE}/payment/checkout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ planId }),
    });
    return handleResponse(response);
  },

  createPortal: async () => {
    const response = await fetch(`${API_BASE}/payment/portal`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

export const authAPI = {
  me: async () => {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
  getOAuthProviders: async () => {
    const response = await fetch(`${API_BASE}/auth/oauth/providers`);
    return handleResponse(response);
  },

  register: async ({ name, identifier, password, confirmPassword }) => {
    const response = await fetch(`${API_BASE}/auth/register/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, identifier, password, confirmPassword }),
    });
    return handleResponse(response);
  },

  login: async (identifier, password) => {
    const response = await fetch(`${API_BASE}/auth/login/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    return handleResponse(response);
  },

  oauthToken: async (token) => {
    const response = await fetch(`${API_BASE}/auth/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return handleResponse(response);
  },

  uploadAvatar: async (file) => {
    const token = localStorage.getItem('token');
    const form = new FormData();
    form.append('avatar', file);
    const response = await fetch(`${API_BASE}/auth/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    return handleResponse(response);
  },

  deleteAvatar: async () => {
    const response = await fetch(`${API_BASE}/auth/avatar`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

export const friendsAPI = {
  searchUsers: async (q) => {
    const response = await fetch(
      `${API_BASE}/friends/search?${new URLSearchParams({ q })}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse(response);
  },

  getConversations: async () => {
    const response = await fetch(`${API_BASE}/friends/conversations`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  startConversation: async (userId) => {
    const response = await fetch(`${API_BASE}/friends/conversations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId }),
    });
    return handleResponse(response);
  },

  getConversation: async (conversationId) => {
    const response = await fetch(`${API_BASE}/friends/conversations/${conversationId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  sendMessage: async (conversationId, content) => {
    const response = await fetch(`${API_BASE}/friends/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    return handleResponse(response);
  },

  deleteConversation: async (conversationId) => {
    const response = await fetch(`${API_BASE}/friends/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  deleteMessage: async (conversationId, messageId) => {
    const response = await fetch(
      `${API_BASE}/friends/conversations/${conversationId}/messages/${messageId}`,
      { method: 'DELETE', headers: getAuthHeaders() }
    );
    return handleResponse(response);
  },
};

export const chatAPI = {
  getHistory: async () => {
    const response = await fetch(`${API_BASE}/chat/history`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getChat: async (chatId) => {
    const response = await fetch(`${API_BASE}/chat/${chatId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createChat: async () => {
    const response = await fetch(`${API_BASE}/chat/new`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  deleteChat: async (chatId) => {
    const response = await fetch(`${API_BASE}/chat/${chatId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  sendMessageStream: async ({
    message,
    chatId,
    image,
    language,
    signal,
    onChunk,
    onChatId,
    onDone,
    onError,
    onAborted,
    onStatus,
  }) => {
    const formData = new FormData();
    formData.append('message', message);
    if (language) {
      formData.append('language', language);
    }
    if (chatId) {
      formData.append('chatId', chatId);
    }
    if (image) {
      formData.append('image', image);
    }

    const token = localStorage.getItem('token');

    let response;
    try {
      response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        signal,
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        onAborted?.();
        return { aborted: true };
      }
      throw err;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const err = new Error(errorData.message || 'Failed to send message');
      err.code = errorData.code;
      err.upgradeUrl = errorData.upgradeUrl;
      throw err;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let gotDone = false;
    let lastChatId = chatId;
    let gotError = false;

    try {
      while (true) {
        if (signal?.aborted) {
          await reader.cancel().catch(() => {});
          onAborted?.();
          return { aborted: true };
        }

        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.slice(6));

              if (parsed.type === 'chatId') {
                lastChatId = parsed.chatId;
                onChatId?.(parsed.chatId);
              } else if (parsed.type === 'status' && onStatus) {
                onStatus(parsed.status);
              } else if (parsed.type === 'chunk' && onChunk) {
                onChunk(parsed.content);
              } else if (parsed.type === 'done') {
                gotDone = true;
                lastChatId = parsed.chatId || lastChatId;
                await onDone?.(lastChatId);
              } else if (parsed.type === 'error') {
                gotError = true;
                onError?.(parsed.message);
              }
            } catch {
              // skip malformed SSE lines
            }
          }
        }
      }

      if (!gotDone && !gotError) {
        await onDone?.(lastChatId);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        onAborted?.();
        return { aborted: true };
      }
      throw err;
    }

    return { aborted: false, gotError };
  },
};
