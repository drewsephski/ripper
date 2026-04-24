export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    sandboxId?: string;
    model?: string;
  };
}

export interface ConversationEdit {
  id: string;
  timestamp: number;
  description: string;
  filesChanged: string[];
  userPrompt: string;
}

export interface ConversationContext {
  messages: ConversationMessage[];
  edits: ConversationEdit[];
  projectEvolution: {
    majorChanges: string[];
  };
  userPreferences: Record<string, any>;
}

export interface ConversationState {
  conversationId: string;
  startedAt: number;
  lastUpdated: number;
  context: ConversationContext;
}
