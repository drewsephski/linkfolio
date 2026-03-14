'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function SignOutPage() {
  const router = useRouter();
  const { signOut } = useAuth();

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await signOut();
        router.push('/');
      } catch (error) {
        console.error('Sign out error:', error);
        router.push('/');
      }
    };

    handleSignOut();
  }, [signOut, router]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '2px solid rgba(255,255,255,0.1)',
          borderTopColor: '#ededed',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ color: '#a1a1a1', fontSize: '14px' }}>Signing out...</p>
      </div>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
