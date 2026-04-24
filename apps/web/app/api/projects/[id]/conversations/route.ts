import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/projects/[id]/conversations - Fetch all conversations for a project
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

    const conversations = await prisma.conversation.findMany({
      where: {
        projectId: id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('[GET /api/projects/[id]/conversations] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/conversations - Create a new conversation message
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
    const { role, content } = body;

    if (!role || !content) {
      return NextResponse.json(
        { error: 'Role and content are required' },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.create({
      data: {
        role,
        content,
        projectId: id,
      },
    });

    // Update project timestamp
    await prisma.project.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/projects/[id]/conversations] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/conversations - Clear all conversations for a project
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

    await prisma.conversation.deleteMany({
      where: {
        projectId: id,
      },
    });

    // Update project timestamp
    await prisma.project.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/projects/[id]/conversations] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversations' },
      { status: 500 }
    );
  }
}
