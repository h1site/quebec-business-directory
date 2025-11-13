import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient.js';

const AuthContext = createContext({ user: null, loading: false });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription;
    let mounted = true;

    const init = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      // Set up auth state listener FIRST before getting session
      // This ensures we catch the SIGNED_IN event from OAuth callback
      subscription = supabase.auth.onAuthStateChange(async (event, sessionData) => {
        if (!mounted) return;

        console.log('Auth event:', event, 'User:', sessionData?.user?.email);

        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          setUser(sessionData?.user ?? null);

          // Clean up URL hash after OAuth callback
          if (window.location.hash.includes('access_token')) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        } else {
          setUser(sessionData?.user ?? null);
        }
      }).data.subscription;

      // Now get the current session
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
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
