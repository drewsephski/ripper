import { NextRequest, NextResponse } from 'next/server';
import { sandboxManager } from '@/lib/sandbox/sandbox-manager';
import type { SandboxState } from '@/lib/sandbox/types';

declare global {
  var sandboxState: SandboxState;
  var activeSandboxProvider: any;
  var existingFiles: Set<string>;
}

interface ParsedFile {
  path: string;
  content: string;
  isTruncated?: boolean;
}

interface ApplyCodeBody {
  response?: string;
  sandboxId?: string;
  clearBeforeApply?: boolean;
}

function parseAIResponse(response: string): {
  files: ParsedFile[];
  packages: string[];
  commands: string[];
  explanation: string;
  validation: { isValid: boolean; issues: string[]; recovered: boolean };
} {
  const files: ParsedFile[] = [];
  const packages: string[] = [];
  const commands: string[] = [];
  let explanation = '';
  let recovered = false;
  const issues: string[] = [];

  // First, remove any markdown code blocks that might wrap the content
  const cleanedResponse = response.replace(/```[\s\S]*?```/g, '');

  // Strategy 1: Standard file tag parsing
  const fileRegex = /<file path="([^"]+)">([\s\S]*?)(?:<\/file>|<file path="|$)/g;
  let match;
  while ((match = fileRegex.exec(cleanedResponse)) !== null) {
    const path = match[1];
    let content = match[2].trim();

    // Remove any trailing file tag that might have been captured
    content = content.replace(/<\/file>$/, '').trim();

    // Only add if content is not empty
    if (content.length > 0) {
      // Check for truncation indicators in the content
      const truncationIndicators = [
        /\/\/\s*\.\.\./,
        /\/\/\s*rest of/i,
        /\/\/\s*continue/i,
      ];

      let isTruncated = false;
      for (const indicator of truncationIndicators) {
        if (indicator.test(content)) {
          isTruncated = true;
          issues.push(`${path} may be truncated (found truncation indicator)`);
          break;
        }
      }

      files.push({
        path,
        content,
        isTruncated
      });
    }
  }

  // Strategy 2: If no files found, try alternative patterns
  if (files.length === 0) {
    // Try to find files with different quote styles
    const altFileRegex = /<file path='([^']+)'>([\s\S]*?)(?:<\/file>|(?=<file|$))/g;
    while ((match = altFileRegex.exec(cleanedResponse)) !== null) {
      const path = match[1];
      let content = match[2].trim();
      if (content.length > 0) {
        files.push({ path, content });
      }
    }
  }

  // Strategy 3: Recovery - try to extract files even with broken tags
  if (files.length === 0) {
    const brokenFileRegex = /(?:^|\n)<file path="([^"]+)">([\s\S]*?)(?=\n<file path=|<\/file>|$)/g;
    while ((match = brokenFileRegex.exec(cleanedResponse)) !== null) {
      const path = match[1];
      let content = match[2].trim();
      if (content.length > 50) { // Reasonable minimum content length
        files.push({ path, content });
        recovered = true;
      }
    }
  }

  // Parse packages
  const pkgRegex = /<package>(.*?)<\/package>/g;
  while ((match = pkgRegex.exec(cleanedResponse)) !== null) {
    const pkgList = match[1].trim().split(/\s+/);
    packages.push(...pkgList.filter(p => p.length > 0));
  }

  // Parse commands
  const cmdRegex = /<command>(.*?)<\/command>/g;
  while ((match = cmdRegex.exec(cleanedResponse)) !== null) {
    commands.push(match[1].trim());
  }

  // Parse explanation
  const explanationMatch = cleanedResponse.match(/<explanation>([\s\S]*?)<\/explanation>/);
  if (explanationMatch) {
    explanation = explanationMatch[1].trim();
  }

  if (!explanation && files.length > 0) {
    explanation = `Generated ${files.length} file(s)${recovered ? ' (recovered from partial output)' : ''}`;
  }

  // Validation
  const openTags = (cleanedResponse.match(/<file path="/g) || []).length;
  const closeTags = (cleanedResponse.match(/<\/file>/g) || []).length;

  if (openTags !== closeTags) {
    issues.push(`Unbalanced tags: ${openTags} open, ${closeTags} close`);
    recovered = true;
  }

  // Deduplicate files by path (keep last occurrence)
  const uniqueFiles = new Map<string, ParsedFile>();
  for (const file of files) {
    uniqueFiles.set(file.path, file);
  }
  const dedupedFiles = Array.from(uniqueFiles.values());

  if (dedupedFiles.length === 0) {
    issues.push('No files could be parsed from the response');
  } else if (dedupedFiles.length < 4) {
    issues.push(`Only ${dedupedFiles.length} files found (expected at least 4)`);
  }

  const isValid = dedupedFiles.length >= 4 && issues.filter(i => !i.includes('Unbalanced')).length === 0;

  if (dedupedFiles.length !== files.length) {
    console.log(`[parseAIResponse] Deduplicated ${files.length - dedupedFiles.length} duplicate file(s)`);
  }

  console.log('[parseAIResponse] Found files:', dedupedFiles.map(f => f.path));
  console.log('[parseAIResponse] Found packages:', packages);
  console.log('[parseAIResponse] Validation:', { isValid, issues, recovered });

  return { files: dedupedFiles, packages, commands, explanation, validation: { isValid, issues, recovered } };
}

function extractPackagesFromCode(content: string): string[] {
  const packages: string[] = [];
  const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g;
  let importMatch;

  while ((importMatch = importRegex.exec(content)) !== null) {
    const importPath = importMatch[1];
    if (!importPath.startsWith('.') && !importPath.startsWith('/') &&
      importPath !== 'react' && importPath !== 'react-dom' &&
      !importPath.startsWith('@/')) {
      const packageName = importPath.startsWith('@')
        ? importPath.split('/').slice(0, 2).join('/')
        : importPath.split('/')[0];

      if (!packages.includes(packageName)) {
        packages.push(packageName);
      }
    }
  }

  return packages;
}

export async function POST(request: NextRequest) {
  // Keep-alive helper - declared outside try block so it's available in catch blocks
  let stopKeepAlive = () => {};

  try {
    // Safely parse request body
    let body: ApplyCodeBody;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('[apply-code] Failed to parse request body:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON in request body'
      }, { status: 400 });
    }

    const { response, sandboxId, clearBeforeApply } = body;

    console.log('[apply-code] Request received. sandboxId:', sandboxId, 'clearBeforeApply:', clearBeforeApply);
    console.log('[apply-code] global.activeSandboxProvider exists:', !!global.activeSandboxProvider);
    console.log('[apply-code] sandboxManager active sandbox:', sandboxManager.getActiveProvider() ? 'exists' : 'null');

    if (!response) {
      return NextResponse.json({
        success: false,
        error: 'Response is required'
      }, { status: 400 });
    }

    console.log('[apply-code] Parsing AI response...');
    const parsed = parseAIResponse(response);

    for (const file of parsed.files) {
      const filePackages = extractPackagesFromCode(file.content);
      for (const pkg of filePackages) {
        if (!parsed.packages.includes(pkg)) {
          parsed.packages.push(pkg);
        }
      }
    }

    console.log('[apply-code] Files found:', parsed.files.length);
    console.log('[apply-code] Packages found:', parsed.packages);

    if (!global.existingFiles) {
      global.existingFiles = new Set<string>();
    }

    let provider = sandboxId ? sandboxManager.getProvider(sandboxId) : sandboxManager.getActiveProvider();

    if (!provider) {
      provider = global.activeSandboxProvider;
    }

    if (!provider) {
      console.error('[apply-code] No active sandbox found');
      return NextResponse.json({
        success: false,
        error: 'No active sandbox found. Please create a sandbox first.'
      }, { status: 400 });
    }

    // Clear app directory before applying new files if requested
    if (clearBeforeApply && typeof (provider as any).clearAppDirectory === 'function') {
      console.log('[apply-code] Clearing app directory before applying files...');
      try {
        await (provider as any).clearAppDirectory();
        console.log('[apply-code] App directory cleared successfully');
      } catch (clearError) {
        console.error('[apply-code] Failed to clear app directory:', clearError);
        // Continue anyway, as file writes may still work
      }
    }

    // Check if sandbox is still responsive before proceeding
    // Use verifyResponsive if available (E2BProvider), otherwise fall back to isAlive
    let isSandboxResponsive: boolean;
    if (typeof (provider as any).verifyResponsive === 'function') {
      isSandboxResponsive = await (provider as any).verifyResponsive();
    } else {
      isSandboxResponsive = provider.isAlive();
    }

    if (!isSandboxResponsive) {
      console.error('[apply-code] Sandbox is not alive, cleaning up zombie provider...');

      // Clean up the zombie provider from global state
      if (global.activeSandboxProvider === provider) {
        global.activeSandboxProvider = null;
        global.sandboxData = null;
      }

      // Try to reconnect or create a new sandbox
      try {
        console.log('[apply-code] Attempting to create new sandbox...');
        const SandboxFactory = (await import('@/lib/sandbox/factory')).SandboxFactory;
        const newProvider = SandboxFactory.create();
        const sandboxInfo = await newProvider.createSandbox();

        // Set up Vite app - this installs dependencies and starts the dev server
        console.log('[apply-code] Setting up Vite app in new sandbox...');
        await newProvider.setupViteApp();
        console.log('[apply-code] Vite app setup complete');

        // Update global state
        global.activeSandboxProvider = newProvider;
        global.sandboxData = {
          sandboxId: sandboxInfo.sandboxId,
          url: sandboxInfo.url
        };

        // Register with manager
        sandboxManager.registerSandbox(sandboxInfo.sandboxId, newProvider);

        provider = newProvider;
        console.log('[apply-code] Successfully created new sandbox:', sandboxInfo.sandboxId);
      } catch (error) {
        console.error('[apply-code] Failed to create new sandbox:', error);
        return NextResponse.json({
          success: false,
          error: 'Sandbox connection lost and failed to create new one. Please try again.'
        }, { status: 400 });
      }
    }

    // Start keep-alive to prevent timeout during long file operations
    console.log('[apply-code] Starting keep-alive for file operations...');
    provider.startKeepAlive();

    // Define stopKeepAlive to actually stop the keep-alive
    stopKeepAlive = () => {
      try {
        provider.stopKeepAlive();
      } catch (e) {
        // Ignore errors when stopping
      }
    };

    const results = {
      filesCreated: [] as string[],
      packagesInstalled: [] as string[],
      commandsExecuted: [] as string[],
      errors: [] as string[]
    };

    for (let i = 0; i < parsed.files.length; i++) {
      const file = parsed.files[i];

      // Refresh timeout periodically during batch file operations (every 5 files)
      if (i > 0 && i % 5 === 0) {
        try {
          await provider.refreshTimeout();
        } catch (e) {
          console.warn(`[apply-code] Could not refresh timeout during file writes:`, e);
        }
      }

      try {
        await provider.writeFile(file.path, file.content);
        results.filesCreated.push(file.path);
        global.existingFiles.add(file.path);
        console.log(`[apply-code] Written: ${file.path}`);
      } catch (error) {
        const errorMessage = (error as Error).message;
        console.error(`[apply-code] Error writing ${file.path}:`, error);

        // If it's a timeout/sandbox not found error, try to recover once
        if (provider.isSandboxNotFoundError(error) || provider.isTimeoutError(error)) {
          console.log(`[apply-code] Attempting to recover from timeout for ${file.path}...`);

          // Try to verify sandbox is still responsive
          const stillResponsive = typeof (provider as any).verifyResponsive === 'function'
            ? await (provider as any).verifyResponsive()
            : provider.isAlive();

          if (!stillResponsive) {
            results.errors.push(`Failed to write ${file.path}: Sandbox timed out during file operations`);
            break; // Stop trying to write more files
          }

          // Try writing the file one more time
          try {
            await provider.writeFile(file.path, file.content);
            results.filesCreated.push(file.path);
            global.existingFiles.add(file.path);
            console.log(`[apply-code] Written (retry): ${file.path}`);
          } catch (retryError) {
            results.errors.push(`Failed to write ${file.path}: ${(retryError as Error).message}`);
          }
        } else {
          results.errors.push(`Failed to write ${file.path}: ${errorMessage}`);
        }
      }
    }

    if (parsed.packages.length > 0) {
      try {
        console.log('[apply-code] Installing packages:', parsed.packages);
        const installResult = await provider.installPackages(parsed.packages);
        if (installResult.success) {
          results.packagesInstalled.push(...parsed.packages);
        } else {
          results.errors.push(`Package installation failed: ${installResult.stderr}`);
        }
      } catch (error) {
        console.error('[apply-code] Error installing packages:', error);
        results.errors.push(`Package installation error: ${(error as Error).message}`);
      }
    }

    const hasErrors = results.errors.length > 0;
    const hasFiles = results.filesCreated.length > 0;

    // Stop keep-alive before returning
    stopKeepAlive();

    // Return error status if all files failed or there were critical errors
    if (hasErrors && !hasFiles) {
      return NextResponse.json({
        success: false,
        error: `All file operations failed: ${results.errors.join('; ')}`,
        results,
        explanation: parsed.explanation,
        validation: parsed.validation,
        parsedFiles: parsed.files.map(f => ({ path: f.path, length: f.content.length, isTruncated: f.isTruncated })),
        warnings: parsed.validation.issues.length > 0 ? parsed.validation.issues : undefined
      }, { status: 500 });
    }

    return NextResponse.json({
      success: !hasErrors,
      results,
      explanation: parsed.explanation,
      validation: parsed.validation,
      parsedFiles: parsed.files.map(f => ({ path: f.path, length: f.content.length, isTruncated: f.isTruncated })),
      warnings: parsed.validation.issues.length > 0 ? parsed.validation.issues : undefined
    });

  } catch (error) {
    // Ensure keep-alive is stopped on error
    stopKeepAlive();
    console.error('[apply-code] Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
