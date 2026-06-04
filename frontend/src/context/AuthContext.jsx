import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, paymentAPI } from '../services/api';

const AuthContext = createContext(null);

const buildUserData = (data) => ({
  _id: data._id,
  name: data.name,
  email: data.email,
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

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    applyAuth(response.data);
    return response;
  };

  const register = async (name, email, password) => {
    const response = await authAPI.register(name, email, password);
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

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        subscription,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshSubscription,
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
