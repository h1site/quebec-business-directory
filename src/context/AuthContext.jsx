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

  const value = useMemo(() => ({ user, loading }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useAuth = () => useContext(AuthContext);
