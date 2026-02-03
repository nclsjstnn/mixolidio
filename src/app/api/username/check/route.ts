import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username parameter required' }, { status: 400 });
    }

    await dbConnect();

    const existingUser = await User.findOne({
      username: username.toLowerCase(),
      _id: { $ne: session.user.id },
    });

    return NextResponse.json({ available: !existingUser });
  } catch (error) {
    console.error('Check username error:', error);
    return NextResponse.json({ error: 'Failed to check username' }, { status: 500 });
  }
}
