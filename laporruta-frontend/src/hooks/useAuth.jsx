import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api, setAccessToken, clearAccessToken } from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      const userData = res.data.result;
      setUser(userData);
      connectSocket(api.defaults.headers.common['Authorization']?.replace('Bearer ', ''));
      return userData;
    } catch {
      setUser(null);
      clearAccessToken();
      return null;
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const savedToken = localStorage.getItem('laporruta_at');
      if (savedToken) {
        setAccessToken(savedToken);
        await fetchMe();
      }
      setIsLoading(false);
    };
    init();
  }, [fetchMe]);

  const setSession = useCallback((accessToken, userData) => {
    setAccessToken(accessToken);
    localStorage.setItem('laporruta_at', accessToken);
    setUser(userData);
    connectSocket(accessToken);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const res = await api.post('/auth/login', {
        email,
        password,
      });

      const { access_token, user: userData } = res.data.result;

      setSession(access_token, userData);

      return userData;
    },
    [setSession]
  );

  const register = useCallback(
    async (fullName, email, password, confirmPassword) => {
      const res = await api.post('/auth/register', {
        full_name: fullName,
        email,
        password,
        confirm_password: confirmPassword,
      });

      const { access_token, user: userData } = res.data.result;

      setSession(access_token, userData);

      return userData;
    },
    [setSession]
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
    } finally {
      setUser(null);
      clearAccessToken();
      localStorage.removeItem('laporruta_at');
      disconnectSocket();
    }
  }, []);

  const updateLastSeen = useCallback(async () => {
    try {
      await api.patch('/users/last-seen');

      setUser((prev) =>
        prev
          ? {
              ...prev,
              last_seen_at: new Date().toISOString(),
            }
          : prev
      );
    } catch {}
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        setSession,
        logout,
        updateLastSeen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
