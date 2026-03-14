import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Reset password using InsForge
    const { data, error } = await insforge.auth.resetPassword({ 
      otp: token, 
      newPassword: newPassword 
    });

    if (error) {
      console.error('Password reset error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to reset password' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Password reset successfully',
      success: true,
      redirectTo: '/auth/sign-in'
    });
  } catch (error) {
    console.error('Reset password API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
