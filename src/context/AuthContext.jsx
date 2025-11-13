import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient.js';

const AuthContext = createContext({ user: null, loading: false });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription;

    const init = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      // Check if we're returning from OAuth provider
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hasOAuthCallback = hashParams.has('access_token') || hashParams.has('error');

      if (hasOAuthCallback) {
        // Let Supabase handle the OAuth callback
        // It will automatically parse the hash and set the session
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);

      subscription = supabase.auth.onAuthStateChange((_event, sessionData) => {
        setUser(sessionData?.user ?? null);
      }).data.subscription;
    };

    init();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const logout = async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useAuth = () => useContext(AuthContext);
