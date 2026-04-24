import { NextRequest, NextResponse } from 'next/server';
import { SandboxFactory } from '@/lib/sandbox/factory';
import type { SandboxState } from '@/lib/sandbox/types';
import { sandboxManager } from '@/lib/sandbox/sandbox-manager';

declare global {
  var activeSandboxProvider: any;
  var sandboxData: any;
  var existingFiles: Set<string>;
  var sandboxState: SandboxState;
  var sandboxCreationInProgress: boolean;
  var sandboxCreationPromise: Promise<any> | null;
}

export async function POST(request: NextRequest) {
  let forceFresh = false;
  try {
    const body = await request.json();
    forceFresh = body.forceFresh === true;
    
    console.log('[create-sandbox] Request received. forceFresh:', forceFresh);
  } catch {
    // If body parsing fails, continue with default behavior (forceFresh = false)
  }

  // Check if sandbox creation is already in progress
  if (global.sandboxCreationInProgress && global.sandboxCreationPromise) {
    console.log('[create-sandbox] Sandbox creation already in progress, waiting for existing creation...');
    try {
      const existingResult = await global.sandboxCreationPromise;
      console.log('[create-sandbox] Returning existing sandbox creation result');
      return NextResponse.json(existingResult);
    } catch (error) {
      console.error('[create-sandbox] Existing sandbox creation failed:', error);
      // Continue with new creation if the existing one failed
    }
  }

  // Check if we already have an active sandbox
  // Only reuse if forceFresh is false
  if (!forceFresh && global.activeSandboxProvider && global.sandboxData) {
    // Verify the sandbox object still exists (synchronous check)
    const isAlive = global.activeSandboxProvider.isAlive();
    if (isAlive) {
      console.log('[create-sandbox] Returning existing active sandbox (alive)');
      return NextResponse.json({
        success: true,
        sandboxId: global.sandboxData.sandboxId,
        url: global.sandboxData.url,
        message: 'Using existing sandbox'
      });
    } else {
      console.log('[create-sandbox] Existing sandbox is not alive, creating new one');
      global.activeSandboxProvider = null;
      global.sandboxData = null;
    }
  }

  // Set the creation flag
  global.sandboxCreationInProgress = true;
  
  // Create the promise that other requests can await
  global.sandboxCreationPromise = createSandboxInternal();
  
  try {
    const result = await global.sandboxCreationPromise;
    return NextResponse.json(result);
  } catch (error) {
    console.error('[create-sandbox] Sandbox creation failed:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create sandbox',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  } finally {
    global.sandboxCreationInProgress = false;
    global.sandboxCreationPromise = null;
  }
}

async function createSandboxInternal() {
  try {
    console.log('[create-sandbox] Creating sandbox...');

    // Only terminate if we're creating a new sandbox (not reusing existing)
    // AND only if the existing sandbox is not alive
    const isExistingAlive = global.activeSandboxProvider ? global.activeSandboxProvider.isAlive() : false;
    if (!global.activeSandboxProvider || !global.sandboxData || !isExistingAlive) {
      console.log('[create-sandbox] No alive sandbox, terminating all and creating new one');
      await sandboxManager.terminateAll();
    }

    if (global.activeSandboxProvider && isExistingAlive) {
      console.log('[create-sandbox] Existing sandbox is alive, reusing it');
      // Don't terminate, just reuse
    } else if (global.activeSandboxProvider) {
      try {
        await global.activeSandboxProvider.terminate();
      } catch (e) {
        console.error('Failed to terminate legacy global sandbox:', e);
      }
      global.activeSandboxProvider = null;
    }

    if (global.existingFiles) {
      global.existingFiles.clear();
    } else {
      global.existingFiles = new Set<string>();
    }

    const provider = SandboxFactory.create();
    const sandboxInfo = await provider.createSandbox();

    console.log('[create-sandbox] Setting up Vite React app...');
    await provider.setupViteApp();

    sandboxManager.registerSandbox(sandboxInfo.sandboxId, provider);

    global.activeSandboxProvider = provider;
    global.sandboxData = {
      sandboxId: sandboxInfo.sandboxId,
      url: sandboxInfo.url
    };

    global.sandboxState = {
      fileCache: {
        files: {},
        lastSync: Date.now(),
        sandboxId: sandboxInfo.sandboxId
      },
      sandbox: provider,
      sandboxData: {
        sandboxId: sandboxInfo.sandboxId,
        url: sandboxInfo.url
      }
    };

    console.log('[create-sandbox] Sandbox ready at:', sandboxInfo.url);

    return {
      success: true,
      sandboxId: sandboxInfo.sandboxId,
      url: sandboxInfo.url,
      provider: sandboxInfo.provider,
      message: 'Sandbox created and Vite React app initialized'
    };

  } catch (error) {
    console.error('[create-sandbox] Error:', error);

    await sandboxManager.terminateAll();
    if (global.activeSandboxProvider) {
      try {
        await global.activeSandboxProvider.terminate();
      } catch (e) {
        console.error('Failed to terminate sandbox on error:', e);
      }
      global.activeSandboxProvider = null;
    }

    throw error;
  }
}
