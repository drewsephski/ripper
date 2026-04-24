import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/projects - Fetch all projects for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        files: {
          select: {
            id: true,
            path: true,
            language: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        conversations: {
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('[GET /api/projects] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
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
    const { name, description, sourceUrl, style = 'modern' } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Create or update user settings
    await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: {
        projectsCreated: {
          increment: 1,
        },
      },
      create: {
        userId: session.user.id,
        projectsCreated: 1,
      },
    });

    const project = await prisma.project.create({
      data: {
        name,
        description,
        sourceUrl,
        style,
        status: 'draft',
        userId: session.user.id,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/projects] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
