import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/projects/[id]/files - Fetch all files for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const files = await prisma.file.findMany({
      where: {
        projectId: id,
      },
      orderBy: {
        path: 'asc',
      },
    });

    return NextResponse.json({ files });
  } catch (error) {
    console.error('[GET /api/projects/[id]/files] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/files - Create a new file
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { path, content, language } = body;

    if (!path || content === undefined) {
      return NextResponse.json(
        { error: 'Path and content are required' },
        { status: 400 }
      );
    }

    // Upsert file (create or update if exists)
    const file = await prisma.file.upsert({
      where: {
        projectId_path: {
          projectId: id,
          path,
        },
      },
      update: {
        content,
        language,
      },
      create: {
        path,
        content,
        language,
        projectId: id,
      },
    });

    // Update project timestamp
    await prisma.project.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ file }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/projects/[id]/files] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create file' },
      { status: 500 }
    );
  }
}
