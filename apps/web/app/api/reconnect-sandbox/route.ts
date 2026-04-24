import { NextResponse } from 'next/server';
import { SandboxFactory } from '@/lib/sandbox/factory';
import { sandboxManager } from '@/lib/sandbox/sandbox-manager';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sandboxId } = body;

    if (!sandboxId) {
      return NextResponse.json(
        { error: 'sandboxId is required' },
        { status: 400 }
      );
    }

    console.log(`[reconnect-sandbox] Attempting to reconnect to sandbox ${sandboxId}`);

    // Check if sandbox is already registered in manager
    const existingProvider = sandboxManager.getProvider(sandboxId);
    if (existingProvider && existingProvider.isAlive()) {
      console.log('[reconnect-sandbox] Sandbox already active in manager');
      const sandboxInfo = existingProvider.getSandboxInfo();
      return NextResponse.json({
        success: true,
        sandboxId,
        url: sandboxInfo?.url,
        message: 'Sandbox already active'
      });
    }

    // Try to reconnect using the provider
    const provider = SandboxFactory.create();
    const reconnected = await provider.reconnect(sandboxId);

    if (reconnected) {
      // Register the reconnected sandbox in the manager
      const sandboxInfo = provider.getSandboxInfo();
      if (sandboxInfo) {
        sandboxManager.registerSandbox(sandboxId, provider);
        sandboxManager.setActiveSandbox(sandboxId);

        // Update global state for compatibility
        (global as any).activeSandboxProvider = provider;
        (global as any).sandboxData = {
          sandboxId,
          url: sandboxInfo.url
        };

        console.log('[reconnect-sandbox] Successfully reconnected and registered sandbox');
        return NextResponse.json({
          success: true,
          sandboxId,
          url: sandboxInfo.url,
          message: 'Sandbox reconnected successfully'
        });
      }
    }

    console.log('[reconnect-sandbox] Reconnection failed');
    return NextResponse.json({
      success: false,
      error: 'Failed to reconnect to sandbox'
    }, { status: 400 });

  } catch (error) {
    console.error('[reconnect-sandbox] Error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to reconnect to sandbox',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
