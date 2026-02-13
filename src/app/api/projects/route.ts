import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Project from '@/lib/models/Project';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const project = await Project.create({
      userId: session.user.id,
      name: 'Untitled Project',
      bpm: 120,
      tracks: [],
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const projects = await Project.find({ userId: session.user.id })
      .select('name bpm tracks createdAt updatedAt')
      .sort({ updatedAt: -1 });

    // Return with track count for lightweight listing
    const projectsWithCount = projects.map((p) => ({
      _id: p._id,
      name: p.name,
      bpm: p.bpm,
      trackCount: p.tracks.length,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json(projectsWithCount);
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
