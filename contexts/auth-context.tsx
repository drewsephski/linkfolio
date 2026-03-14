'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { insforge } from '@/lib/insforge-client';

interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: {
    name?: string;
    avatar_url?: string;
  } | null;
  providers?: string[];
  metadata?: Record<string, unknown> | null;
}

interface Session {
  user: User;
  accessToken: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; requiresVerification?: boolean; error?: string }>;
  verifyEmail: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithOAuth: (provider: 'github' | 'google') => Promise<void>;
  signOut: () => Promise<void>;
  resendVerification: (email: string) => Promise<{ success: boolean; error?: string }>;
  sendResetPasswordEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async (retryCount = 0) => {
      try {
        console.log(`Checking session (attempt ${retryCount + 1})...`);
        
        // Debug: Check what's in localStorage
        console.log('LocalStorage keys:', Object.keys(localStorage));
        console.log('LocalStorage auth items:', Object.keys(localStorage).filter(k => k.includes('auth') || k.includes('insforge')));
        
        const { data } = await insforge.auth.getCurrentSession();
        console.log('Session check result:', data);
        
        if (data.session) {
          console.log('Session found, setting user:', data.session.user);
          setUser(data.session.user);
          setSession({ user: data.session.user, accessToken: data.session.accessToken });
          console.log('User and session set successfully');
        } else if (retryCount < 5) {
          // Retry more times for OAuth redirects
          console.log('No session found, retrying...');
          setTimeout(() => checkSession(retryCount + 1), 1000);
        } else {
          console.log('No session found after retries');
          setUser(null);
          setSession(null);
        }
      } catch (err) {
        console.error('Session check failed:', err);
        setUser(null);
        setSession(null);
      } finally {
        if (retryCount === 0) {
          setLoading(false);
        }
      }
    };

    // Initial session check
    checkSession();

    // Listen for focus events (OAuth returns from redirect)
    const handleFocus = () => {
      console.log('Page gained focus, checking session...');
      checkSession();
    };

    // Listen for storage events (session changes from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'insforge_session' || e.key?.includes('auth')) {
        console.log('Storage changed, checking session...');
        checkSession();
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await insforge.auth.signUp({
        email,
        password,
        name
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.requireEmailVerification) {
        return { success: true, requiresVerification: true };
      }

      if (data?.user && data?.accessToken) {
        setUser(data.user);
        setSession({ user: data.user, accessToken: data.accessToken });
        return { success: true };
      }

      return { success: false, error: 'Unknown error during sign up' };
    } catch (error) {
      return { success: false, error: 'Sign up failed' };
    }
  };

  const verifyEmail = async (email: string, otp: string) => {
    try {
      const { data, error } = await insforge.auth.verifyEmail({
        email,
        otp
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user && data?.accessToken) {
        setUser(data.user);
        setSession({ user: data.user, accessToken: data.accessToken });
        return { success: true };
      }

      return { success: false, error: 'Verification failed' };
    } catch (error) {
      return { success: false, error: 'Email verification failed' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await insforge.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.statusCode === 403) {
          return { success: false, error: 'Email not verified. Please check your email.' };
        }
        return { success: false, error: error.message };
      }

      if (data?.user && data?.accessToken) {
        setUser(data.user);
        setSession({ user: data.user, accessToken: data.accessToken });
        return { success: true };
      }

      return { success: false, error: 'Sign in failed' };
    } catch (error) {
      return { success: false, error: 'Sign in failed' };
    }
  };

  const signInWithOAuth = async (provider: 'github' | 'google') => {
    try {
      const { data, error } = await insforge.auth.signInWithOAuth({
        provider,
        redirectTo: `${window.location.origin}/dashboard`,
        skipBrowserRedirect: true
      });

      if (error) {
        console.error('OAuth sign in failed:', error);
        throw error;
      }

      if (data?.url) {
        // Redirect to OAuth provider
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('OAuth sign in failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await insforge.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const resendVerification = async (email: string) => {
    try {
      await insforge.auth.resendVerificationEmail({ email });
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to resend verification email' };
    }
  };

  const sendResetPasswordEmail = async (email: string) => {
    try {
      await insforge.auth.sendResetPasswordEmail({ email });
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to send reset password email' };
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const { data, error } = await insforge.auth.resetPassword({ 
        otp: token, 
        newPassword: newPassword 
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.message) {
        return { success: true };
      }

      return { success: false, error: 'Password reset failed' };
    } catch (error) {
      return { success: false, error: 'Password reset failed' };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    verifyEmail,
    signIn,
    signInWithOAuth,
    signOut,
    resendVerification,
    sendResetPasswordEmail,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
