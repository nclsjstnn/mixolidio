import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import User from '@/lib/models/User';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { username } = body;

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Validate format
    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json(
        {
          error: 'Username must be 3-20 characters, alphanumeric and underscores only',
        },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check uniqueness
    const existingUser = await User.findOne({
      username: username.toLowerCase(),
      _id: { $ne: session.user.id },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { username: username.toLowerCase() },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, username: updatedUser.username });
  } catch (error) {
    console.error('Set username error:', error);
    return NextResponse.json({ error: 'Failed to set username' }, { status: 500 });
  }
}
