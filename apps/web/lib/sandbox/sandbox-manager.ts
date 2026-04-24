import { SandboxProvider } from './types';
import { SandboxFactory } from './factory';

interface SandboxEntry {
  sandboxId: string;
  provider: SandboxProvider;
  createdAt: Date;
  lastAccessed: Date;
}

class SandboxManager {
  private sandboxes: Map<string, SandboxEntry> = new Map();
  private activeSandboxId: string | null = null;

  async getOrCreateProvider(sandboxId: string): Promise<SandboxProvider> {
    const existing = this.sandboxes.get(sandboxId);
    if (existing) {
      existing.lastAccessed = new Date();
      return existing.provider;
    }

    try {
      const provider = SandboxFactory.create();
      return provider;
    } catch (error) {
      console.error(`[SandboxManager] Error reconnecting to sandbox ${sandboxId}:`, error);
      throw error;
    }
  }

  registerSandbox(sandboxId: string, provider: SandboxProvider): void {
    this.sandboxes.set(sandboxId, {
      sandboxId,
      provider,
      createdAt: new Date(),
      lastAccessed: new Date()
    });
    this.activeSandboxId = sandboxId;
  }

  getActiveProvider(): SandboxProvider | null {
    if (!this.activeSandboxId) {
      return null;
    }

    const sandbox = this.sandboxes.get(this.activeSandboxId);
    if (sandbox) {
      sandbox.lastAccessed = new Date();
      return sandbox.provider;
    }

    return null;
  }

  getProvider(sandboxId: string): SandboxProvider | null {
    const sandbox = this.sandboxes.get(sandboxId);
    if (sandbox) {
      sandbox.lastAccessed = new Date();
      return sandbox.provider;
    }
    return null;
  }

  setActiveSandbox(sandboxId: string): boolean {
    if (this.sandboxes.has(sandboxId)) {
      this.activeSandboxId = sandboxId;
      return true;
    }
    return false;
  }

  async terminateSandbox(sandboxId: string): Promise<void> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (sandbox) {
      try {
        await sandbox.provider.terminate();
      } catch (error) {
        console.error(`[SandboxManager] Error terminating sandbox ${sandboxId}:`, error);
      }
      this.sandboxes.delete(sandboxId);

      if (this.activeSandboxId === sandboxId) {
        this.activeSandboxId = null;
      }
    }
  }

  async terminateAll(): Promise<void> {
    const promises = Array.from(this.sandboxes.values()).map(sandbox =>
      sandbox.provider.terminate().catch(err =>
        console.error(`[SandboxManager] Error terminating sandbox ${sandbox.sandboxId}:`, err)
      )
    );

    await Promise.all(promises);
    this.sandboxes.clear();
    this.activeSandboxId = null;
  }

  async cleanup(maxAge: number = 3600000): Promise<void> {
    const now = new Date();
    const toDelete: string[] = [];

    for (const [id, info] of this.sandboxes.entries()) {
      const age = now.getTime() - info.lastAccessed.getTime();
      if (age > maxAge) {
        toDelete.push(id);
      }
    }

    for (const id of toDelete) {
      await this.terminateSandbox(id);
    }
  }
}

export const sandboxManager = new SandboxManager();

declare global {
  var sandboxManager: SandboxManager;
}

global.sandboxManager = sandboxManager;
