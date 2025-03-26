import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useCookies } from 'react-cookie';

// Define the shape of our auth context
interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  checkAuthStatus: () => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAdmin: false,
  loading: true,
  checkAuthStatus: async () => {},
  logout: async () => {},
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [cookies, setCookie, removeCookie] = useCookies(['session_id', 'is_admin', 'user_logged_in']);

  // Function to check authentication status
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      
      // First check if we have cookies that indicate logged in state
      if (cookies.session_id && cookies.user_logged_in) {
        setIsAuthenticated(true);
        setIsAdmin(cookies.is_admin === "true");
        setLoading(false);
        return;
      }
      
      // If not, make an API call to verify
      const response = await fetch('./Backend/authStatus.php', {
        method: 'GET',
        credentials: 'include', // Important to include cookies
      });

      const data = await response.json();
      
      setIsAuthenticated(data.authenticated);
      setIsAdmin(data.isAdmin || false);
    } catch (error) {
      console.error('Auth status check failed:', error);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle logout
  const logout = async () => {
    try {
      const response = await fetch('./Backend/logout.php', {
        method: 'GET',
        credentials: 'include',
      });
      
      // Clear cookies regardless of response
      removeCookie('session_id', { path: '/' });
      removeCookie('is_admin', { path: '/' });
      removeCookie('user_logged_in', { path: '/' });
      
      setIsAuthenticated(false);
      setIsAdmin(false);
      
      return response;
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear cookies and state on error
      removeCookie('session_id', { path: '/' });
      removeCookie('is_admin', { path: '/' });
      removeCookie('user_logged_in', { path: '/' });
      
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };

  // Check auth status when the component mounts or cookies change
  useEffect(() => {
    checkAuthStatus();
  }, [cookies.session_id]); // Re-run when session cookie changes

  const value = {
    isAuthenticated,
    isAdmin,
    loading,
    checkAuthStatus,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};