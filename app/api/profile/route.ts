import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Fetch user profile from InsForge database
    const { data: profileData, error: profileError } = await insforge.database
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw profileError;
    }

    return NextResponse.json({ data: profileData });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, avatar_url, bio, website, location, linkedin_url } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const profileData = {
      user_id: userId,
      name,
      avatar_url,
      bio,
      website,
      location,
      linkedin_url,
      updated_at: new Date().toISOString()
    };

    // Upsert profile data
    const { data, error } = await insforge.database
      .from('user_profiles')
      .upsert(profileData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Profile POST error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...updateFields } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const updateData = {
      ...updateFields,
      updated_at: new Date().toISOString()
    };

    // Update profile data
    const { data, error } = await insforge.database
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile data' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Delete profile data
    const { error } = await insforge.database
      .from('user_profiles')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete profile data' },
      { status: 500 }
    );
  }
}
