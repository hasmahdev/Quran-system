import { createContext, useContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';

interface DecodedToken {
  id: number;
  role: string;
  exp: number;
}

interface AuthContextType {
  token: string | null;
  user: DecodedToken | null;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  setToken: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<DecodedToken | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(storedToken);
        if (decoded.exp * 1000 > Date.now()) {
          setTokenState(storedToken);
          setUser(decoded);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Failed to decode token from storage:', error);
        localStorage.removeItem('token');
      }
    }
  }, []);

  const setToken = (newToken: string | null) => {
    if (newToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(newToken);
        setTokenState(newToken);
        setUser(decoded);
        localStorage.setItem('token', newToken);
      } catch (error) {
        console.error('Failed to decode new token:', error);
        setTokenState(null);
        setUser(null);
        localStorage.removeItem('token');
      }
    } else {
      setTokenState(null);
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
