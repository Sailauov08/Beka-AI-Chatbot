import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, paymentAPI } from '../services/api';

const AuthContext = createContext(null);

const buildUserData = (data) => ({
  _id: data._id,
  name: data.name,
  email: data.email ?? null,
  phone: data.phone ?? null,
  avatarUrl: data.avatarUrl ?? null,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const refreshSubscription = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const res = await paymentAPI.getStatus();
      setSubscription(res.data);
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.subscription = res.data;
        localStorage.setItem('user', JSON.stringify(parsed));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    const init = async () => {
      if (storedUser && storedToken) {
        const parsed = JSON.parse(storedUser);
        setUser(buildUserData(parsed));
        setSubscription(parsed.subscription || null);
        try {
          const me = await authAPI.me();
          setUser(buildUserData(me.data));
          setSubscription(me.data.subscription);
          localStorage.setItem(
            'user',
            JSON.stringify({ ...me.data, token: storedToken })
          );
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    init();
  }, []);

  const applyAuth = (data) => {
    const userData = buildUserData(data);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ ...userData, subscription: data.subscription }));
    setToken(data.token);
    setUser(userData);
    setSubscription(data.subscription || null);
  };

  const loginSendCode = async (identifier, password) => {
    const response = await authAPI.loginSendCode(identifier, password);
    if (response.data?.direct) {
      applyAuth(response.data);
    }
    return response;
  };

  const loginVerify = async (target, code) => {
    const response = await authAPI.loginVerify(target, code);
    applyAuth(response.data);
    return response;
  };

  const registerSendCode = async (payload) => {
    const response = await authAPI.registerSendCode(payload);
    if (response.data?.direct) {
      applyAuth(response.data);
    }
    return response;
  };

  const registerVerify = async (target, code) => {
    const response = await authAPI.registerVerify(target, code);
    applyAuth(response.data);
    return response;
  };

  const forgotPasswordSendCode = async (email) =>
    authAPI.forgotPasswordSendCode(email);

  const forgotPasswordReset = async (payload) => {
    const response = await authAPI.forgotPasswordReset(payload);
    applyAuth(response.data);
    return response;
  };

  const applyOAuthToken = async (token) => {
    const response = await authAPI.oauthToken(token);
    applyAuth(response.data);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setSubscription(null);
  };

  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          localStorage.setItem('user', JSON.stringify({ ...parsed, ...patch }));
        } catch {
          /* ignore */
        }
      }
      return next;
    });
  }, []);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        subscription,
        loading,
        isAuthenticated,
        loginSendCode,
        loginVerify,
        registerSendCode,
        registerVerify,
        forgotPasswordSendCode,
        forgotPasswordReset,
        applyOAuthToken,
        logout,
        refreshSubscription,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
