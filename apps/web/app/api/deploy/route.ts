import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';
import { auth } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

// Ensure deployments directory exists
const DEPLOYMENTS_DIR = path.join(process.cwd(), '..', '..', 'deployments');

async function ensureDeploymentsDir() {
  try {
    await fs.mkdir(DEPLOYMENTS_DIR, { recursive: true });
  } catch (error) {
    console.error('[deploy] Error creating deployments dir:', error);
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

// POST /api/deploy - Deploy a project
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
    const { projectId, deployType = 'path' } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Get project with files
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
      include: {
        files: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (!project.files || project.files.length === 0) {
      return NextResponse.json(
        { error: 'Project has no files to deploy' },
        { status: 400 }
      );
    }

    await ensureDeploymentsDir();

    // Generate or use existing slug
    let slug = project.deploySlug;
    if (!slug) {
      const baseSlug = generateSlug(project.name);
      
      // Check for existing slugs
      const existingProjects = await prisma.project.findMany({
        where: {
          deploySlug: { not: null },
        },
        select: {
          deploySlug: true,
        },
      });
      const existingSlugs = existingProjects.map(p => p.deploySlug).filter(Boolean) as string[];
      
      slug = generateUniqueSlug(baseSlug, existingSlugs);
    }

    // Create deployment directory
    const projectDeployDir = path.join(DEPLOYMENTS_DIR, slug);
    await fs.mkdir(projectDeployDir, { recursive: true });

    // Write all project files
    for (const file of project.files) {
      const filePath = path.join(projectDeployDir, file.path);
      const dir = path.dirname(filePath);
      
      // Ensure directory exists
      await fs.mkdir(dir, { recursive: true });
      
      // Write file
      await fs.writeFile(filePath, file.content, 'utf-8');
    }

    // Create an index.html if it doesn't exist (use App.jsx content as fallback)
    const indexPath = path.join(projectDeployDir, 'index.html');
    try {
      await fs.access(indexPath);
    } catch {
      // index.html doesn't exist, create a basic one that loads the React app
      const appFile = project.files.find(f => f.path.includes('App.')) || project.files[0];
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name}</title>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        ${project.files.map(f => `/* ${f.path} */\n${f.content}`).join('\n\n')}
        
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>`;
      await fs.writeFile(indexPath, htmlContent, 'utf-8');
    }

    // Build the public URL
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    
    let deployUrl: string;
    if (deployType === 'subdomain') {
      // Subdomain deployment: slug.example.com
      const domain = host.replace(/^www\./, '');
      deployUrl = `${protocol}://${slug}.${domain}`;
    } else {
      // Path deployment: example.com/p/slug
      deployUrl = `${protocol}://${host}/p/${slug}`;
    }

    // Update project with deployment info
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        deployUrl,
        deployType,
        deploySlug: slug,
        isPublic: true,
        deployedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      project: updatedProject,
      deployUrl,
      deployType,
      slug,
    });

  } catch (error) {
    console.error('[POST /api/deploy] Error:', error);
    return NextResponse.json(
      { error: 'Failed to deploy project' },
      { status: 500 }
    );
  }
}

// DELETE /api/deploy - Undeploy a project
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Get project
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Remove deployment directory if it exists
    if (project.deploySlug) {
      const projectDeployDir = path.join(DEPLOYMENTS_DIR, project.deploySlug);
      try {
        await fs.rm(projectDeployDir, { recursive: true, force: true });
      } catch (error) {
        console.error('[deploy] Error removing deployment dir:', error);
      }
    }

    // Update project to remove deployment info
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        deployUrl: null,
        deployType: null,
        deploySlug: null,
        isPublic: false,
        deployedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      project: updatedProject,
    });

  } catch (error) {
    console.error('[DELETE /api/deploy] Error:', error);
    return NextResponse.json(
      { error: 'Failed to undeploy project' },
      { status: 500 }
    );
  }
}
