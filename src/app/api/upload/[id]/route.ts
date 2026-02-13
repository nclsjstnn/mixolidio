import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { del } from '@vercel/blob';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import AudioFile from '@/lib/models/AudioFile';
import Project from '@/lib/models/Project';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    // Find the audio file
    const audioFile = await AudioFile.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!audioFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete from Vercel Blob
    try {
      await del(audioFile.blobUrl);
    } catch (blobError) {
      console.error('Failed to delete from Vercel Blob:', blobError);
      // Continue anyway - the blob might already be deleted
    }

    // Remove track references from all projects
    await Project.updateMany(
      { userId: session.user.id },
      { $pull: { tracks: { audioFileId: id } } }
    );

    // Delete the audio file document
    await AudioFile.deleteOne({ _id: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
