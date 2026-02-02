import {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  useEffect,
} from 'react';
import { getCurrentUser } from '@/services/users/validateUser';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  useLayoutEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    const token = localStorage.getItem('token');
    if (token && !user) {
      getCurrentUser().then(setUser).catch(logout);
    }

    setLoading(false);
  }, []);

  // Version check: if deployed version changes, force logout and clear cache
  useEffect(() => {
    let mounted = true;

    const checkVersion = async () => {
      try {
        const res = await fetch('/version.txt', { cache: 'no-store' });
        if (!res.ok) return;
        const serverVersion = (await res.text()).trim();
        const storedVersion = localStorage.getItem('app_version');

        if (!storedVersion) {
          localStorage.setItem('app_version', serverVersion);
          return;
        }

        if (storedVersion !== serverVersion) {
          // version changed: clear user cache and force logout
          localStorage.setItem('app_version', serverVersion);
          // preserve nothing related to auth
          if (mounted) {
            try {
              logout();
            } catch (e) {
              // ignore
            }
            // clear other storages if needed
            // localStorage.clear(); // avoid clearing app_version
          }
        }
      } catch (error) {
        // ignore network errors
      }
    };

    // Initial check
    checkVersion();

    // Poll every 60 seconds to detect updates automatically
    const id = setInterval(checkVersion, 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ HOOK SEGURO
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
