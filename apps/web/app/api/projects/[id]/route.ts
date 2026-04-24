import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/projects/[id] - Fetch a single project
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

    const project = await prisma.project.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        files: true,
        conversations: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('[GET /api/projects/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(
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

    const body = await request.json();
    const { name, description, sourceUrl, style, status, sandboxId, sandboxUrl, deployUrl, deployType, deploySlug, isPublic, deployedAt } = body;

    // Verify project belongs to user
    const existingProject = await prisma.project.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const project = await prisma.project.update({
      where: {
        id,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(sourceUrl !== undefined && { sourceUrl }),
        ...(style !== undefined && { style }),
        ...(status !== undefined && { status }),
        ...(sandboxId !== undefined && { sandboxId }),
        ...(sandboxUrl !== undefined && { sandboxUrl }),
        ...(deployUrl !== undefined && { deployUrl }),
        ...(deployType !== undefined && { deployType }),
        ...(deploySlug !== undefined && { deploySlug }),
        ...(isPublic !== undefined && { isPublic }),
        ...(deployedAt !== undefined && { deployedAt }),
      },
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error('[PUT /api/projects/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(
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
    const existingProject = await prisma.project.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Delete project (cascade will delete files and conversations)
    await prisma.project.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/projects/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
