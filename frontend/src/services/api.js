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

  createCheckout: async () => {
    const response = await fetch(`${API_BASE}/payment/checkout`, {
      method: 'POST',
      headers: getAuthHeaders(),
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
  register: async (name, email, password) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse(response);
  },

  login: async (email, password) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
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

  sendMessageStream: async ({ message, chatId, image, onChunk, onChatId, onDone, onError }) => {
    const formData = new FormData();
    formData.append('message', message);
    if (chatId) {
      formData.append('chatId', chatId);
    }
    if (image) {
      formData.append('image', image);
    }

    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

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

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(line.slice(6));

            if (parsed.type === 'chatId' && onChatId) {
              onChatId(parsed.chatId);
            } else if (parsed.type === 'chunk' && onChunk) {
              onChunk(parsed.content);
            } else if (parsed.type === 'done' && onDone) {
              onDone(parsed.chatId);
            } else if (parsed.type === 'error' && onError) {
              onError(parsed.message);
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }
    }
  },
};
