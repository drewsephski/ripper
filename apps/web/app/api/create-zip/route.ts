import { NextResponse } from 'next/server';
import { sandboxManager } from '@/lib/sandbox/sandbox-manager';

declare global {
  var activeSandboxProvider: any;
}

export async function POST() {
  try {
    let provider = sandboxManager.getActiveProvider();

    if (!provider) {
      provider = global.activeSandboxProvider;
    }

    if (!provider) {
      return NextResponse.json({
        success: false,
        error: 'No active sandbox found'
      }, { status: 400 });
    }

    const zipResult = await provider.runCommand('cd /home/user/app && zip -r project.zip . -x "node_modules/*" -x ".git/*" -x "dist/*" -x "build/*"');

    if (!zipResult.success) {
      throw new Error(`Failed to create zip: ${zipResult.stderr}`);
    }

    const zipContent = await provider.readFile('/home/user/app/project.zip');

    return new Response(Buffer.from(zipContent, 'base64'), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="project.zip"'
      }
    });

  } catch (error) {
    console.error('[create-zip] Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
