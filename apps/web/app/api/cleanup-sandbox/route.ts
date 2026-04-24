import { NextResponse } from 'next/server';
import { sandboxManager } from '@/lib/sandbox/sandbox-manager';

export async function POST() {
  try {
    console.log('[cleanup-sandbox] Terminating all sandboxes...');
    await sandboxManager.terminateAll();
    
    // Clear global state
    if (typeof global !== 'undefined') {
      global.activeSandboxProvider = null;
      global.sandboxData = null;
    }
    
    console.log('[cleanup-sandbox] All sandboxes terminated');
    return NextResponse.json({ success: true, message: 'All sandboxes terminated' });
  } catch (error) {
    console.error('[cleanup-sandbox] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to cleanup sandboxes' },
      { status: 500 }
    );
  }
}
