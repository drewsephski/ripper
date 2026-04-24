export interface SandboxFile {
  path: string;
  content: string;
  lastModified?: number;
}

export interface SandboxInfo {
  sandboxId: string;
  url: string;
  provider: 'e2b' | 'vercel';
  createdAt: Date;
}

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  success: boolean;
}

export interface SandboxProviderConfig {
  e2b?: {
    apiKey?: string;
    timeoutMs?: number;
    template?: string;
  };
  vercel?: {
    teamId?: string;
    projectId?: string;
    token?: string;
    authMethod?: 'oidc' | 'pat';
  };
}

export abstract class SandboxProvider {
  protected config: SandboxProviderConfig;
  protected sandbox: any;
  protected sandboxInfo: SandboxInfo | null = null;

  constructor(config: SandboxProviderConfig) {
    this.config = config;
  }

  abstract createSandbox(): Promise<SandboxInfo>;
  abstract runCommand(command: string): Promise<CommandResult>;
  abstract writeFile(path: string, content: string): Promise<void>;
  abstract readFile(path: string): Promise<string>;
  abstract listFiles(directory?: string): Promise<string[]>;
  abstract installPackages(packages: string[]): Promise<CommandResult>;
  abstract getSandboxUrl(): string | null;
  abstract getSandboxInfo(): SandboxInfo | null;
  abstract terminate(): Promise<void>;
  abstract isAlive(): boolean;

  async reconnect(sandboxId: string): Promise<boolean> {
    // Default implementation - providers can override
    return false;
  }

  async refreshTimeout(): Promise<void> {
    // Default no-op implementation - providers can override
  }

  async verifyResponsive(): Promise<boolean> {
    // Default: just check if sandbox object exists
    return this.isAlive();
  }

  startKeepAlive(): void {
    // Default no-op - providers can override
  }

  stopKeepAlive(): void {
    // Default no-op - providers can override
  }

  isTimeoutError(error: unknown): boolean {
    return error instanceof Error && error.message?.toLowerCase().includes('timeout');
  }

  isSandboxNotFoundError(error: unknown): boolean {
    return error instanceof Error && error.message?.toLowerCase().includes('sandbox was not found');
  }

  async setupViteApp(): Promise<void> {
    throw new Error('setupViteApp not implemented for this provider');
  }

  async restartViteServer(): Promise<void> {
    throw new Error('restartViteServer not implemented for this provider');
  }
}

export interface SandboxState {
  fileCache: {
    files: Record<string, { content: string; lastModified: number }>;
    lastSync: number;
    sandboxId: string;
    manifest?: FileManifest;
  };
  sandbox: any;
  sandboxData: {
    sandboxId: string;
    url: string;
  };
}

export interface FileInfo {
  content: string;
  type: 'component' | 'utility' | 'style' | 'config' | 'entry';
  path: string;
  relativePath: string;
  lastModified: number;
  exports?: string[];
  imports?: string[];
  dependencies?: string[];
  isComponent?: boolean;
  componentName?: string;
  props?: string[];
}

export interface RouteInfo {
  path: string;
  component: string;
}

export interface FileManifest {
  files: Record<string, FileInfo>;
  routes: RouteInfo[];
  componentTree: Record<string, string[]>;
  entryPoint: string;
  styleFiles: string[];
  timestamp: number;
}
