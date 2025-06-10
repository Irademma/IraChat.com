import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { getAuthInstance, getCurrentUserSafely } from '../services/firebaseSimple';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initAuth = async () => {
      try {
        // Get current user safely
        const currentUser = await getCurrentUserSafely();
        setUser(currentUser);

        // Set up auth state listener if auth instance is available
        const authInstance = getAuthInstance();
        if (authInstance && authInstance.onAuthStateChanged) {
          unsubscribe = authInstance.onAuthStateChanged((user: User | null) => {
            setUser(user);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in useAuth:', error);
        setUser(null);
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return { user, loading };
};