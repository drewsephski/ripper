import { NextRequest, NextResponse } from 'next/server';
import { sandboxManager } from '@/lib/sandbox/sandbox-manager';

declare global {
  var activeSandboxProvider: any;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sandboxId } = body;

    console.log('[restart-vite] Request received. sandboxId:', sandboxId);

    let provider = sandboxId ? sandboxManager.getProvider(sandboxId) : sandboxManager.getActiveProvider();

    if (!provider) {
      provider = global.activeSandboxProvider;
    }

    if (!provider) {
      console.error('[restart-vite] No active sandbox found');
      return NextResponse.json({
        success: false,
        error: 'No active sandbox found'
      }, { status: 400 });
    }

    // Check if provider has restartViteServer method
    if (typeof (provider as any).restartViteServer !== 'function') {
      console.error('[restart-vite] Provider does not support restartViteServer');
      return NextResponse.json({
        success: false,
        error: 'Provider does not support Vite server restart'
      }, { status: 400 });
    }

    console.log('[restart-vite] Restarting Vite server...');
    await (provider as any).restartViteServer();
    console.log('[restart-vite] Vite server restarted successfully');

    return NextResponse.json({
      success: true,
      message: 'Vite server restarted successfully'
    });

  } catch (error) {
    console.error('[restart-vite] Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
