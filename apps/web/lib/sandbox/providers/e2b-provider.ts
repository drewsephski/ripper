import { Sandbox, TimeoutError, SandboxError } from '@e2b/code-interpreter';
import { SandboxProvider, SandboxInfo, CommandResult, SandboxProviderConfig } from '../types';

const VITE_PORT = 5173;
const VITE_STARTUP_DELAY = 5000;
const TIMEOUT_MS = 1800000; // 30 minutes to allow for longer AI generation + code apply
const KEEPALIVE_INTERVAL_MS = 60000; // Refresh timeout every 60 seconds during long operations

export class E2BProvider extends SandboxProvider {
  private existingFiles: Set<string> = new Set();
  private keepAliveInterval: NodeJS.Timeout | null = null;

  async reconnect(sandboxId: string): Promise<boolean> {
    try {
      // Try to connect to existing sandbox using Sandbox.connect
      const reconnectedSandbox = await Sandbox.connect(sandboxId);
      if (reconnectedSandbox) {
        this.sandbox = reconnectedSandbox;

        // Restore sandbox info
        const host = (this.sandbox as any).getHost(VITE_PORT);
        this.sandboxInfo = {
          sandboxId,
          url: `https://${host}`,
          provider: 'e2b',
          createdAt: new Date()
        };

        // Extend timeout on reconnection
        if (typeof this.sandbox.setTimeout === 'function') {
          await this.sandbox.setTimeout(TIMEOUT_MS);
        }

        console.log(`[E2BProvider] Successfully reconnected to sandbox ${sandboxId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`[E2BProvider] Failed to reconnect to sandbox ${sandboxId}:`, error);
      return false;
    }
  }

  async refreshTimeout(): Promise<void> {
    if (this.sandbox && typeof this.sandbox.setTimeout === 'function') {
      try {
        await this.sandbox.setTimeout(TIMEOUT_MS);
        console.log('[E2BProvider] Refreshed sandbox timeout');
      } catch (error) {
        console.error('[E2BProvider] Failed to refresh timeout:', error);
      }
    }
  }

  async createSandbox(): Promise<SandboxInfo> {
    try {
      if (this.sandbox) {
        try {
          await this.sandbox.kill();
        } catch (e) {
          console.error('Failed to close existing sandbox:', e);
        }
        this.sandbox = null;
      }

      this.existingFiles.clear();

      this.sandbox = await Sandbox.create({
        apiKey: this.config.e2b?.apiKey || process.env.E2B_API_KEY,
        timeoutMs: this.config.e2b?.timeoutMs || TIMEOUT_MS
      });

      const sandboxId = (this.sandbox as any).sandboxId || Date.now().toString();
      const host = (this.sandbox as any).getHost(VITE_PORT);

      this.sandboxInfo = {
        sandboxId,
        url: `https://${host}`,
        provider: 'e2b',
        createdAt: new Date()
      };

      if (typeof this.sandbox.setTimeout === 'function') {
        await this.sandbox.setTimeout(TIMEOUT_MS);
      }

      return this.sandboxInfo;

    } catch (error) {
      console.error('[E2BProvider] Error creating sandbox:', error);
      throw error;
    }
  }

  async runCommand(command: string): Promise<CommandResult> {
    if (!this.sandbox) {
      throw new Error('No active sandbox');
    }

    const result = await this.sandbox.runCode(`
      import subprocess
      import os

      os.chdir('/home/user/app')
      result = subprocess.run(${JSON.stringify(command.split(' '))},
                            capture_output=True,
                            text=True,
                            shell=False)

      print("STDOUT:")
      print(result.stdout)
      if result.stderr:
          print("\\nSTDERR:")
          print(result.stderr)
      print(f"\\nReturn code: {result.returncode}")
    `);

    const output = result.logs.stdout.join('\n');
    const stderr = result.logs.stderr.join('\n');

    return {
      stdout: output,
      stderr,
      exitCode: result.error ? 1 : 0,
      success: !result.error
    };
  }

  async writeFile(path: string, content: string): Promise<void> {
    if (!this.sandbox) {
      throw new Error('No active sandbox');
    }

    const fullPath = path.startsWith('/') ? path : `/home/user/app/${path}`;

    if ((this.sandbox as any).files && typeof (this.sandbox as any).files.write === 'function') {
      await (this.sandbox as any).files.write(fullPath, Buffer.from(content));
    } else {
      await this.sandbox.runCode(`
        import os

        dir_path = os.path.dirname("${fullPath}")
        os.makedirs(dir_path, exist_ok=True)

        with open("${fullPath}", 'w') as f:
            f.write(${JSON.stringify(content)})
        print(f"✓ Written: ${fullPath}")
      `);
    }

    this.existingFiles.add(path);
  }

  async readFile(path: string): Promise<string> {
    if (!this.sandbox) {
      throw new Error('No active sandbox');
    }

    const fullPath = path.startsWith('/') ? path : `/home/user/app/${path}`;

    const result = await this.sandbox.runCode(`
      with open("${fullPath}", 'r') as f:
          content = f.read()
      print(content)
    `);

    return result.logs.stdout.join('\n');
  }

  async listFiles(directory: string = '/home/user/app'): Promise<string[]> {
    if (!this.sandbox) {
      throw new Error('No active sandbox');
    }

    const result = await this.sandbox.runCode(`
      import os
      import json

      def list_files(path):
          files = []
          for root, dirs, filenames in os.walk(path):
              dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', '.next', 'dist', 'build']]
              for filename in filenames:
                  rel_path = os.path.relpath(os.path.join(root, filename), path)
                  files.append(rel_path)
          return files

      files = list_files("${directory}")
      print(json.dumps(files))
    `);

    try {
      return JSON.parse(result.logs.stdout.join(''));
    } catch {
      return [];
    }
  }

  async installPackages(packages: string[]): Promise<CommandResult> {
    if (!this.sandbox) {
      throw new Error('No active sandbox');
    }

    const packageList = packages.join(' ');

    const result = await this.sandbox.runCode(`
      import subprocess
      import os

      os.chdir('/home/user/app')

      result = subprocess.run(
          ['npm', 'install', ${packages.map(p => `'${p}'`).join(', ')}],
          capture_output=True,
          text=True
      )

      print("STDOUT:")
      print(result.stdout)
      if result.stderr:
          print("\\nSTDERR:")
          print(result.stderr)
      print(f"\\nReturn code: {result.returncode}")
    `);

    const output = result.logs.stdout.join('\n');
    const stderr = result.logs.stderr.join('\n');

    return {
      stdout: output,
      stderr,
      exitCode: result.error ? 1 : 0,
      success: !result.error
    };
  }

  async clearAppDirectory(): Promise<void> {
    if (!this.sandbox) {
      throw new Error('No active sandbox');
    }

    console.log('[E2BProvider] Clearing app directory...');
    
    await this.sandbox.runCode(`
import os
import shutil

app_dir = '/home/user/app'
if os.path.exists(app_dir):
    # Remove all files and directories in app directory
    for item in os.listdir(app_dir):
        item_path = os.path.join(app_dir, item)
        if os.path.isfile(item_path) or os.path.islink(item_path):
            os.remove(item_path)
        elif os.path.isdir(item_path):
            shutil.rmtree(item_path)
    print('✓ App directory cleared')
else:
    os.makedirs(app_dir, exist_ok=True)
    print('✓ App directory created')
    `);

    // Clear the existing files tracking
    this.existingFiles.clear();
  }

  async setupViteApp(): Promise<void> {
    if (!this.sandbox) {
      throw new Error('No active sandbox');
    }

    const setupScript = `
import os
import json

print('Setting up React app with Vite and Tailwind...')

os.makedirs('/home/user/app/src', exist_ok=True)

package_json = {
    "name": "sandbox-app",
    "version": "1.0.0",
    "type": "module",
    "scripts": {
        "dev": "vite --host",
        "build": "vite build",
        "preview": "vite preview"
    },
    "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
    },
    "devDependencies": {
        "@vitejs/plugin-react": "^4.0.0",
        "vite": "^4.3.9",
        "tailwindcss": "^3.3.0",
        "postcss": "^8.4.31",
        "autoprefixer": "^10.4.16"
    }
}

with open('/home/user/app/package.json', 'w') as f:
    json.dump(package_json, f, indent=2)
print('✓ package.json')

vite_config = """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: false,
    allowedHosts: ['.e2b.app', '.e2b.dev', '.vercel.run', 'localhost', '127.0.0.1']
  }
})"""

with open('/home/user/app/vite.config.js', 'w') as f:
    f.write(vite_config)
print('✓ vite.config.js')

tailwind_config = """/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}"""

with open('/home/user/app/tailwind.config.js', 'w') as f:
    f.write(tailwind_config)
print('✓ tailwind.config.js')

postcss_config = """export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}"""

with open('/home/user/app/postcss.config.js', 'w') as f:
    f.write(postcss_config)
print('✓ postcss.config.js')

index_html = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sandbox App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>"""

with open('/home/user/app/index.html', 'w') as f:
    f.write(index_html)
print('✓ index.html')

main_jsx = """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)"""

with open('/home/user/app/src/main.jsx', 'w') as f:
    f.write(main_jsx)
print('✓ src/main.jsx')

app_jsx = """function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <p className="text-lg text-gray-400">
          Sandbox Ready<br/>
          Start building your React app with Vite and Tailwind CSS!
        </p>
      </div>
    </div>
  )
}

export default App"""

with open('/home/user/app/src/App.jsx', 'w') as f:
    f.write(app_jsx)
print('✓ src/App.jsx')

index_css = """@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background-color: rgb(17 24 39);
}"""

with open('/home/user/app/src/index.css', 'w') as f:
    f.write(index_css)
print('✓ src/index.css')

print('\\nAll files created successfully!')
`;

    await this.sandbox.runCode(setupScript);

    await this.sandbox.runCode(`
import subprocess

print('Installing npm packages...')
result = subprocess.run(
    ['npm', 'install'],
    cwd='/home/user/app',
    capture_output=True,
    text=True
)

if result.returncode == 0:
    print('✓ Dependencies installed successfully')
else:
    print(f'⚠ Warning: npm install had issues: {result.stderr}')
    `);

    await this.sandbox.runCode(`
import subprocess
import os
import time

os.chdir('/home/user/app')

subprocess.run(['pkill', '-f', 'vite'], capture_output=True)
time.sleep(1)

env = os.environ.copy()
env['FORCE_COLOR'] = '0'

process = subprocess.Popen(
    ['npm', 'run', 'dev'],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    env=env
)

print(f'✓ Vite dev server started with PID: {process.pid}')
print('Waiting for server to be ready...')
    `);

    await new Promise(resolve => setTimeout(resolve, VITE_STARTUP_DELAY));

    this.existingFiles.add('src/App.jsx');
    this.existingFiles.add('src/main.jsx');
    this.existingFiles.add('src/index.css');
    this.existingFiles.add('index.html');
    this.existingFiles.add('package.json');
    this.existingFiles.add('vite.config.js');
    this.existingFiles.add('tailwind.config.js');
    this.existingFiles.add('postcss.config.js');
  }

  async restartViteServer(): Promise<void> {
    if (!this.sandbox) {
      throw new Error('No active sandbox');
    }

    await this.sandbox.runCode(`
import subprocess
import time
import os

os.chdir('/home/user/app')

subprocess.run(['pkill', '-f', 'vite'], capture_output=True)
time.sleep(2)

env = os.environ.copy()
env['FORCE_COLOR'] = '0'

process = subprocess.Popen(
    ['npm', 'run', 'dev'],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    env=env
)

print(f'✓ Vite restarted with PID: {process.pid}')
    `);

    await new Promise(resolve => setTimeout(resolve, VITE_STARTUP_DELAY));
  }

  getSandboxUrl(): string | null {
    return this.sandboxInfo?.url || null;
  }

  getSandboxInfo(): SandboxInfo | null {
    return this.sandboxInfo;
  }

  async terminate(): Promise<void> {
    if (this.sandbox) {
      try {
        await this.sandbox.kill();
      } catch (e) {
        console.error('Failed to terminate sandbox:', e);
      }
      this.sandbox = null;
      this.sandboxInfo = null;
    }
  }

  isAlive(): boolean {
    return !!this.sandbox;
  }

  /**
   * Verify the sandbox is actually responsive by making a test call
   * Uses sandbox.isRunning() if available (E2B best practice), otherwise falls back to files API
   */
  async verifyResponsive(): Promise<boolean> {
    if (!this.sandbox) {
      return false;
    }

    try {
      // Use isRunning() if available (preferred E2B method)
      if (typeof (this.sandbox as any).isRunning === 'function') {
        const isRunning = await (this.sandbox as any).isRunning();
        if (!isRunning) return false;
      }

      // Try to list files in the app directory as a health check
      if ((this.sandbox as any).files && typeof (this.sandbox as any).files.list === 'function') {
        await (this.sandbox as any).files.list('/home/user');
        return true;
      }

      // Fallback: try to run a simple command with short timeout
      await this.sandbox.runCode('print("ping")', { timeoutMs: 5000 });
      return true;
    } catch (error) {
      console.error('[E2BProvider] Sandbox health check failed:', error);
      return false;
    }
  }

  /**
   * Start keep-alive interval to prevent sandbox timeout during long operations
   * Call this before starting long AI generation or file operations
   */
  startKeepAlive(): void {
    if (this.keepAliveInterval) {
      return; // Already running
    }

    console.log('[E2BProvider] Starting keep-alive interval');
    this.keepAliveInterval = setInterval(async () => {
      try {
        await this.refreshTimeout();
      } catch (error) {
        console.error('[E2BProvider] Keep-alive refresh failed:', error);
      }
    }, KEEPALIVE_INTERVAL_MS);
  }

  /**
   * Stop keep-alive interval
   * Call this after operations complete to avoid unnecessary API calls
   */
  stopKeepAlive(): void {
    if (this.keepAliveInterval) {
      console.log('[E2BProvider] Stopping keep-alive interval');
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  /**
   * Check if an error is a timeout error from E2B
   */
  isTimeoutError(error: unknown): boolean {
    return error instanceof TimeoutError ||
      (error instanceof Error && error.message?.toLowerCase().includes('timeout'));
  }

  /**
   * Check if an error is a sandbox not found error
   */
  isSandboxNotFoundError(error: unknown): boolean {
    return error instanceof SandboxError ||
      (error instanceof Error && error.message?.toLowerCase().includes('sandbox was not found'));
  }
}
