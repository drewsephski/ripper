import { notFound } from 'next/navigation';
import { prisma } from '@repo/database';
import fs from 'fs/promises';
import path from 'path';

// Using force-static would cause issues with dynamic path segments
// Using force-dynamic ensures proper handling at runtime
export const dynamic = 'force-dynamic';

// Disable static generation for this dynamic route
export const generateStaticParams = () => [];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DeployedProjectPage({ params }: PageProps) {
  const { slug } = await params;

  // Find project by deploy slug
  const project = await prisma.project.findFirst({
    where: {
      deploySlug: slug,
      isPublic: true,
    },
  });

  if (!project) {
    notFound();
  }

  // Try to read the index.html file from deployments
  const deploymentsDir = path.join(process.cwd(), '..', '..', 'deployments');
  const indexPath = path.join(deploymentsDir, slug, 'index.html');

  try {
    const htmlContent = await fs.readFile(indexPath, 'utf-8');
    
    // Return raw HTML
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
        style={{ width: '100%', height: '100vh', border: 'none' }}
      />
    );
  } catch (error) {
    // Fallback: try to serve individual files
    try {
      const projectDir = path.join(deploymentsDir, slug);
      const files = await fs.readdir(projectDir);
      
      // Look for an HTML file
      const htmlFile = files.find(f => f.endsWith('.html')) || 'index.html';
      const filePath = path.join(projectDir, htmlFile);
      
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        return (
          <div 
            dangerouslySetInnerHTML={{ __html: content }} 
            style={{ width: '100%', height: '100vh', border: 'none' }}
          />
        );
      } catch {
        notFound();
      }
    } catch {
      notFound();
    }
  }
}
