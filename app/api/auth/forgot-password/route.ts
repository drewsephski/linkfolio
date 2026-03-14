import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Send reset password email
    const { error } = await insforge.auth.sendResetPasswordEmail({ email });

    if (error) {
      console.error('Password reset email error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to send reset email' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Password reset instructions sent successfully',
      success: true
    });
  } catch (error) {
    console.error('Forgot password API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
