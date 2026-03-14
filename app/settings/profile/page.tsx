'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { insforge } from '@/lib/insforge-client';
import FullPageLoading from '@/components/ui/FullPageLoading';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface UserProfile {
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  location?: string;
  linkedin_url?: string;
}

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    avatar_url: '',
    bio: '',
    website: '',
    location: '',
    linkedin_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile from InsForge database
      const { data: profileData, error: profileError } = await insforge.database
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw profileError;
      }

      if (profileData) {
        setProfile({
          name: profileData.name || user?.name || '',
          email: user?.email || '',
          avatar_url: profileData.avatar_url || '',
          bio: profileData.bio || '',
          website: profileData.website || '',
          location: profileData.location || '',
          linkedin_url: profileData.linkedin_url || ''
        });
      } else {
        // Initialize with user data
        setProfile({
          name: user?.name || '',
          email: user?.email || '',
          avatar_url: '',
          bio: '',
          website: '',
          location: '',
          linkedin_url: ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const profileData = {
        user_id: user?.id,
        name: profile.name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        website: profile.website,
        location: profile.location,
        linkedin_url: profile.linkedin_url,
        updated_at: new Date().toISOString()
      };

      // Upsert profile data
      const { data, error } = await insforge.database
        .from('user_profiles')
        .upsert(profileData)
        .select()
        .single();

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    setShowResetConfirm(false);
    try {
      setResettingPassword(true);
      setMessage(null);
      
      const { error } = await insforge.auth.sendResetPasswordEmail({ email: profile.email });
      if (error) throw error;
      
      setMessage({ 
        type: 'success', 
        text: `Password reset email sent successfully to ${profile.email}! Please check your inbox.` 
      });
    } catch (error) {
      console.error('Password reset error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to send password reset email. Please try again later.' 
      });
    } finally {
      setResettingPassword(false);
    }
  };

  const handlePasswordResetClick = () => {
    setShowResetConfirm(true);
  };

  if (!user) {
    return <FullPageLoading message="Sign In Required" />;
  }

  if (loading) {
    return <FullPageLoading message="Loading profile..." />;
  }

  return (
    <DashboardLayout currentPage="settings" title="Profile Settings" subtitle="Manage your account information and preferences">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap');

        .profile-content {
          --bg: #000;
          --surface: #0a0a0a;
          --s2: #111;
          --s3: #161616;
          --b: rgba(255,255,255,0.08);
          --bh: rgba(255,255,255,0.14);
          --bf: rgba(255,255,255,0.22);
          --t1: #ededed;
          --t2: #a1a1a1;
          --t3: #555;
          --success: #34d399;
          --error: #f87171;
          --font: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
          font-family: var(--font);
        }
        .profile-content *, .profile-content *::before, .profile-content *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* Card */
        .card {
          background: var(--surface);
          border: 1px solid var(--b);
          border-radius: 12px;
          overflow: hidden;
        }

        .card-content {
          padding: 20px;
        }

        /* Form */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 12px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          margin-top: 12px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-label {
          font-size: 11px;
          font-weight: 500;
          color: var(--t3);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin: 2px;
        }

        .form-input {
          background: var(--s2);
          border: 1px solid var(--b);
          border-radius: 6px;
          padding: 10px 14px;
          font-size: 14px;
          color: var(--t1);
          transition: border-color 0.15s;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--bh);
        }

        .form-input:disabled {
          background: var(--s2);
          color: var(--t3);
          cursor: not-allowed;
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-help {
          font-size: 11px;
          color: var(--t3);
          margin-top: 4px;
        }

        /* Profile Picture */
        .profile-picture-section {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--b);
        }

        .profile-picture-container {
          position: relative;
          flex-shrink: 0;
        }

        .profile-picture {
          width: 64px;
          height: 64px;
          border-radius: 8px;
          object-cover;
          background: var(--s2);
          border: 2px solid var(--b);
          transition: border-color 0.15s ease;
        }

        .profile-picture:hover {
          border-color: var(--bh);
        }

        .profile-picture-input {
          flex: 1;
          min-width: 0;
        }

        .url-input-group {
          position: relative;
        }

        .url-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: var(--t3);
          pointer-events: none;
        }

        .url-input {
          background: var(--s2);
          border: 1px solid var(--b);
          border-radius: 6px;
          padding: 10px 14px 10px 40px;
          font-size: 14px;
          color: var(--t1);
          transition: all 0.15s ease;
          width: 100%;
        }

        .url-input:focus {
          outline: none;
          border-color: var(--bh);
          background: rgba(255, 255, 255, 0.02);
        }

        .url-input::placeholder {
          color: var(--t3);
        }

        .url-preview {
          margin-top: 8px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--b);
          border-radius: 4px;
          font-size: 11px;
          color: var(--t3);
          font-family: 'Monaco', 'Menlo', monospace;
          word-break: break-all;
          display: none;
        }

        .url-preview.visible {
          display: block;
        }

        /* Button */
        .button-group {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid var(--b);
        }

        .button {
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .button-primary {
          background: var(--t1);
          color: #000;
        }

        .button-primary:hover {
          background: #fff;
          transform: translateY(-1px);
        }

        .button-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .button-secondary {
          background: var(--surface);
          color: var(--t1);
          border: 1px solid var(--b);
        }

        .button-secondary:hover {
          background: var(--s2);
          border-color: var(--bh);
          transform: translateY(-1px);
        }

        .button-danger {
          background: var(--error);
          color: var(--t1);
        }

        .button-danger:hover {
          background: #dc2626;
          transform: translateY(-1px);
        }

        .button-danger:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* Loading spinner */
        .spinner {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          margin-right: 6px;
          vertical-align: middle;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Confirmation Dialog */
        .dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .dialog {
          background: var(--surface);
          border: 1px solid var(--b);
          border-radius: 12px;
          padding: 24px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
        }

        .dialog-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--t1);
          margin-bottom: 12px;
        }

        .dialog-content {
          font-size: 14px;
          color: var(--t2);
          line-height: 1.5;
          margin-bottom: 20px;
        }

        .dialog-email {
          font-weight: 600;
          color: var(--t1);
        }

        .dialog-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .dialog-button {
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          letter-spacing: -0.01em;
        }

        .dialog-button-cancel {
          background: var(--s2);
          color: var(--t2);
          border: 1px solid var(--b);
        }

        .dialog-button-cancel:hover:not(:disabled) {
          background: var(--s3);
          border-color: var(--bh);
          color: var(--t1);
          transform: translateY(-1px);
        }

        .dialog-button-confirm {
          background: var(--t1);
          color: #000;
          border: 1px solid var(--t1);
        }

        .dialog-button-confirm:hover:not(:disabled) {
          background: #fff;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.15);
        }

        .dialog-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* Message */
        .message {
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-size: 13px;
        }

        .message-success {
          background: rgba(52, 211, 153, 0.1);
          color: var(--success);
          border: 1px solid rgba(52, 211, 153, 0.2);
        }

        .message-error {
          background: rgba(248, 113, 113, 0.1);
          color: var(--error);
          border: 1px solid rgba(248, 113, 113, 0.2);
        }

        /* Account Management */
        .account-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .account-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: var(--s2);
          border-radius: 8px;
          border: 1px solid var(--b);
          transition: all 0.15s ease;
        }

        .account-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--bh);
          transform: translateY(-1px);
        }

        .account-info h3 {
          font-size: 13px;
          font-weight: 600;
          color: var(--t1);
          margin-bottom: 4px;
          letter-spacing: -0.01em;
        }

        .account-info p {
          font-size: 11px;
          color: var(--t3);
          line-height: 1.4;
        }

        .reset-button {
          background: var(--surface);
          color: var(--t2);
          border: 1px solid var(--b);
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 140px;
        }

        .reset-button:hover:not(:disabled) {
          background: var(--s3);
          border-color: var(--bh);
          color: var(--t1);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .reset-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .profile-picture-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .button-group {
            flex-direction: column;
            gap: 8px;
          }

          .account-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }
      `}</style>

      <div className="profile-content">
        {message && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Profile Form */}
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="card-content">
              {/* Profile Picture */}
              <div className="profile-picture-section">
                <div className="profile-picture-container">
                  <img
                    className="profile-picture"
                    src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=3b82f6&color=fff`}
                    alt="Profile"
                  />
                </div>
                <div className="profile-picture-input">
                  <label className="form-label">Profile Picture URL</label>
                  <div className="url-input-group">
                    <svg className="url-input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <input
                      type="url"
                      value={profile.avatar_url}
                      onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                      className="url-input"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                  {profile.avatar_url && (
                    <div className={`url-preview visible`}>
                      {profile.avatar_url}
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="form-input"
                    placeholder="Your full name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="form-input"
                    title="Email cannot be changed here"
                  />
                  <p className="form-help">Email is managed through authentication</p>
                </div>
              </div>

              {/* Bio */}
              <div className="form-group full-width">
                <label className="form-label">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="form-input form-textarea"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Additional Information */}
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input
                    type="url"
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    className="form-input"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="form-input"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label className="form-label">LinkedIn URL</label>
                <input
                  type="url"
                  value={profile.linkedin_url}
                  onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                  className="form-input"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Account Management */}
        <div className="card" style={{ marginTop: '32px' }}>
          <div className="card-content">
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Account Management</h3>
            <div className="account-list">
              <div className="account-item">
                <div className="account-info">
                  <h3>Password Reset</h3>
                  <p>Send a password reset link to <strong>{profile.email}</strong></p>
                </div>
                <button 
                  className="reset-button" 
                  onClick={handlePasswordResetClick}
                  disabled={resettingPassword}
                >
                  {resettingPassword && <span className="spinner" />}
                  {resettingPassword ? 'Sending...' : 'Send Reset Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showResetConfirm && (
        <div className="dialog-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="dialog-title">Send Password Reset Email?</h3>
            <div className="dialog-content">
              Are you sure you want to send a password reset link to <span className="dialog-email">{profile.email}</span>? 
              This will allow anyone with access to this email to reset your account password.
            </div>
            <div className="dialog-actions">
              <button 
                className="dialog-button dialog-button-cancel" 
                onClick={() => setShowResetConfirm(false)}
                disabled={resettingPassword}
              >
                Cancel
              </button>
              <button 
                className="dialog-button dialog-button-confirm" 
                onClick={handlePasswordReset}
                disabled={resettingPassword}
              >
                {resettingPassword && <span className="spinner" />}
                {resettingPassword ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
