import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/projects/[id]/files/[path] - Fetch a single file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; path: string }> }
) {
  try {
    const { id, path } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify project belongs to user
    const project = await prisma.project.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const file = await prisma.file.findUnique({
      where: {
        projectId_path: {
          projectId: id,
          path: decodeURIComponent(path),
        },
      },
    });

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ file });
  } catch (error) {
    console.error('[GET /api/projects/[id]/files/[path]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id]/files/[path] - Update a file
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; path: string }> }
) {
  try {
    const { id, path } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify project belongs to user
    const project = await prisma.project.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { content, language } = body;

    if (content === undefined) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const file = await prisma.file.update({
      where: {
        projectId_path: {
          projectId: id,
          path: decodeURIComponent(path),
        },
      },
      data: {
        content,
        ...(language !== undefined && { language }),
      },
    });

    // Update project timestamp
    await prisma.project.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ file });
  } catch (error) {
    console.error('[PUT /api/projects/[id]/files/[path]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update file' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/files/[path] - Delete a file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; path: string }> }
) {
  try {
    const { id, path } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify project belongs to user
    const project = await prisma.project.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    await prisma.file.delete({
      where: {
        projectId_path: {
          projectId: id,
          path: decodeURIComponent(path),
        },
      },
    });

    // Update project timestamp
    await prisma.project.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/projects/[id]/files/[path]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
