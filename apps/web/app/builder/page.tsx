"use client";

import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import { AsciiAnimation } from "@/components/effects";
import LiquidButton from "@/components/LiquidButton";
import { Send, Download, RefreshCw, ArrowLeft, Code, Eye, Puzzle, MessageSquare, Globe, Zap, Loader2, Camera, Check, X, Wrench, Bot, Ruler, Palette, Sparkles, Play, AlertTriangle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedThemeToggler } from "@/components/AnimatedThemeToggler";
import { Logo } from "@/components/Logo";
import TypingIndicator from "@/components/TypingIndicator";
import { MarkdownMessage } from "@/components/MarkdownMessage";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import CodeEditor from "react-simple-code-editor";

// Chat message types
interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system' | 'error' | 'progress' | 'warning';
  content: string;
  timestamp: Date;
  icon?: React.ReactNode;
  metadata?: {
    scrapedUrl?: string;
    stage?: string;
  };
}

export default function BuilderPage() {
  const router = useRouter();
  
  // === AUTH STATE ===
  const [session, setSession] = useState<any>(undefined);
  const [authChecked, setAuthChecked] = useState(false);
  
  // === PROJECT STATE ===
  const [targetUrl, setTargetUrl] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("google/gemini-3.1-flash-lite-preview");
  const [isLoading, setIsLoading] = useState(true);
  const [sandboxUrl, setSandboxUrl] = useState<string>("");
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [parsedFiles, setParsedFiles] = useState<{path: string, content: string}[]>([]);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "chat">("chat");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [sandboxHealthy, setSandboxHealthy] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const codeEditorRef = useRef<HTMLTextAreaElement>(null);
  
  // Tab refs for sliding animation
  const chatTabRef = useRef<HTMLButtonElement>(null);
  const previewTabRef = useRef<HTMLButtonElement>(null);
  const codeTabRef = useRef<HTMLButtonElement>(null);
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });
  
  // File item refs for sliding highlight
  const fileItemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [fileSliderStyle, setFileSliderStyle] = useState({ top: 0, height: 0, opacity: 0 });

  // === CODE EDITING STATE ===
  const [editedContent, setEditedContent] = useState<string>("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // === DELETE MODAL STATE ===
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  
  // === VISUAL FEEDBACK STATES ===
  const [urlScreenshot, setUrlScreenshot] = useState<string | null>(null);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingStatus, setTypingStatus] = useState<string>("");
  
  // === GENERATION PROGRESS ===
  const [generationProgress, setGenerationProgress] = useState({
    isGenerating: false,
    status: '',
    isStreaming: false,
    streamedCode: '',
    files: [] as { path: string; content: string; completed: boolean }[],
  });
  
  // === SANDBOX CREATION REF ===
  const sandboxCreationRef = useRef<boolean>(false);
  
  // === GENERATION STARTED REF ===
  const generationStartedRef = useRef<boolean>(false);

  // === WELCOME MESSAGE REF ===
  const welcomeMessageAddedRef = useRef<boolean>(false);

  // === TEMPLATE STATE ===
  const [loadedTemplate, setLoadedTemplate] = useState<any>(null);
  const [templateReadyToRun, setTemplateReadyToRun] = useState(false);


  // === EFFECTS ===
  
  // Auth check effect
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionData = await authClient.getSession();
        if (sessionData.data) {
          setSession(sessionData.data);
        } else {
          setSession(null);
        }
      } catch (error) {
        setSession(null);
      } finally {
        setAuthChecked(true);
      }
    };
    
    checkSession();
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authChecked) return;
    if (!session) {
      router.push('/');
    }
  }, [authChecked, session, router]);

  // Handle project initialization
  useEffect(() => {
    if (!authChecked || !session) return;

    const url = sessionStorage.getItem('targetUrl');
    const model = sessionStorage.getItem('selectedModel') || "google/gemini-3.1-flash-lite-preview";
    const existingProjectId = new URLSearchParams(window.location.search).get('projectId');
    const startSandbox = new URLSearchParams(window.location.search).get('startSandbox') === 'true';
    const templateJson = sessionStorage.getItem('selectedTemplate');
    
    if (!url && !existingProjectId && !templateJson) {
      setIsLoading(false);
      if (!welcomeMessageAddedRef.current) {
        welcomeMessageAddedRef.current = true;
        addChatMessage('Welcome! Enter a URL above to start cloning a website, or chat with me to build something new.', 'system');
      }
      return;
    }

    if (existingProjectId) {
      setProjectId(existingProjectId);
      if (startSandbox) {
        startProjectSandbox(existingProjectId);
      } else {
        loadProject(existingProjectId);
      }
      return;
    }

    if (templateJson && !generationStartedRef.current) {
      generationStartedRef.current = true;
      sessionStorage.removeItem('selectedTemplate');
      loadTemplate(templateJson);
      return;
    }

    if (url && !generationStartedRef.current) {
      generationStartedRef.current = true;
      setTargetUrl(url);
      setSelectedModel(model);
      sessionStorage.removeItem('targetUrl');
      sessionStorage.removeItem('selectedModel');
      startGeneration(url, model);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, session]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Scroll code to bottom when streaming
  useEffect(() => {
    if (generationProgress.isStreaming && activeTab === "code") {
      codeContainerRef.current?.scrollTo({
        top: codeContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [generationProgress.streamedCode, generationProgress.isStreaming, activeTab]);

  // Sync edited content when selected file changes
  useEffect(() => {
    if (selectedFile) {
      const file = parsedFiles.find(f => f.path === selectedFile);
      if (file) {
        setEditedContent(file.content);
        setHasUnsavedChanges(false);
      }
    }
  }, [selectedFile, parsedFiles]);

  // Keyboard shortcut for saving (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges && selectedFile && !isSaving) {
          handleSaveCode();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasUnsavedChanges, selectedFile, isSaving, editedContent]);

  // Update slider position when active tab changes
  useLayoutEffect(() => {
    const tabs = {
      chat: chatTabRef.current,
      preview: previewTabRef.current,
      code: codeTabRef.current,
    };
    
    const activeTabElement = tabs[activeTab];
    if (activeTabElement) {
      setSliderStyle({
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth,
      });
    }
  }, [activeTab]);

  // Update file slider position when selected file changes
  useLayoutEffect(() => {
    if (selectedFile) {
      const fileElement = fileItemRefs.current.get(selectedFile);
      if (fileElement) {
        setFileSliderStyle({
          top: fileElement.offsetTop,
          height: fileElement.offsetHeight,
          opacity: 1,
        });
      }
    } else {
      setFileSliderStyle(prev => ({ ...prev, opacity: 0 }));
    }
  }, [selectedFile]);

  // === HELPERS ===
  
  const addChatMessage = (content: string, type: ChatMessage['type'], icon?: React.ReactNode, metadata?: ChatMessage['metadata']) => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      type,
      content,
      timestamp: new Date(),
      icon,
      metadata
    };
    setChatHistory(prev => [...prev, newMessage]);
  };

  const loadProject = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) throw new Error('Failed to load project');

      const data = await response.json();
      const project = data.project;

      // Set the project ID so subsequent saves work correctly
      setProjectId(id);

      setTargetUrl(project.sourceUrl || '');
      setSandboxUrl(project.sandboxUrl || '');
      
      if (project.conversations) {
        setChatHistory(project.conversations.map((c: any) => ({
          id: Math.random().toString(36).substring(7),
          type: c.role === 'user' ? 'user' : 'ai',
          content: c.content,
          timestamp: new Date(c.createdAt)
        })));
      }

      if (project.files && project.files.length > 0) {
        const files = project.files.map((f: any) => ({
          path: f.path,
          content: f.content
        }));
        setParsedFiles(files);
        if (files.length > 0) setSelectedFile(files[0].path);
      }

      setIsLoading(false);
      toast.success('Project loaded successfully');
    } catch (error) {
      toast.error('Failed to load project');
      router.push('/');
    }
  };

  const startProjectSandbox = async (id: string) => {
    try {
      setIsLoading(true);
      addChatMessage('Loading project...', 'progress', <Loader2 className="w-4 h-4 animate-spin" />);

      // First load the project data
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) throw new Error('Failed to load project');

      const data = await response.json();
      const project = data.project;

      setProjectId(id);
      setTargetUrl(project.sourceUrl || '');

      // Load files into state
      if (project.files && project.files.length > 0) {
        const files = project.files.map((f: any) => ({
          path: f.path,
          content: f.content
        }));
        setParsedFiles(files);
        if (files.length > 0) setSelectedFile(files[0].path);
      }

      // Load conversations
      if (project.conversations) {
        setChatHistory(project.conversations.map((c: any) => ({
          id: Math.random().toString(36).substring(7),
          type: c.role === 'user' ? 'user' : 'ai',
          content: c.content,
          timestamp: new Date(c.createdAt)
        })));
      }

      // Try to reconnect to existing sandbox
      if (project.sandboxId && project.sandboxUrl) {
        addChatMessage('Reconnecting to existing sandbox...', 'progress', <RefreshCw className="w-4 h-4 animate-spin" />);
        
        try {
          const reconnectRes = await fetch('/api/reconnect-sandbox', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sandboxId: project.sandboxId })
          });

          if (reconnectRes.ok) {
            const reconnectData = await reconnectRes.json();
            if (reconnectData.success) {
              setSandboxUrl(reconnectData.url);
              setSandboxHealthy(true);
              addChatMessage('Reconnected to sandbox! Preview is ready.', 'ai', <Check className="w-4 h-4" />);
              setActiveTab('preview');
              setIsLoading(false);
              toast.success('Project loaded successfully');
              return;
            }
          }
        } catch (reconnectError) {
          console.log('Reconnection failed, will create new sandbox');
        }
      }

      // If reconnection failed or no sandbox, create new sandbox and apply files
      addChatMessage('Creating new sandbox environment...', 'progress', <Wrench className="w-4 h-4" />);
      const sandboxData = await createSandbox(true, true);

      if (sandboxData) {
        setSandboxUrl(sandboxData.url);
        setSandboxHealthy(true);

        // Apply project files to sandbox
        addChatMessage('Applying project files to sandbox...', 'progress', <Loader2 className="w-4 h-4 animate-spin" />);
        
        const filePayload = project.files.map((f: any) => 
          `<file path="${f.path}">${f.content}</file>`
        ).join('\n');

        const applyRes = await fetch('/api/apply-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            response: filePayload,
            sandboxId: sandboxData.sandboxId,
            clearBeforeApply: true
          })
        });

        if (applyRes.ok) {
          addChatMessage('Files applied! Restarting Vite server...', 'progress', <Loader2 className="w-4 h-4 animate-spin" />);
          
          // Restart Vite server
          const restartRes = await fetch('/api/restart-vite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sandboxId: sandboxData.sandboxId })
          });

          if (restartRes.ok) {
            addChatMessage('Sandbox ready! Preview is now available.', 'ai', <Check className="w-4 h-4" />);
            setActiveTab('preview');
          } else {
            addChatMessage('Files applied but Vite restart failed. Try refreshing the preview.', 'warning', <AlertTriangle className="w-4 h-4" />);
            setActiveTab('preview');
          }

          // Update project with new sandbox info
          await fetch(`/api/projects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sandboxId: sandboxData.sandboxId,
              sandboxUrl: sandboxData.url,
              status: 'ready',
            }),
          });
        } else {
          throw new Error('Failed to apply files to sandbox');
        }
      }

      setIsLoading(false);
      toast.success('Project loaded successfully');
    } catch (error) {
      console.error('Failed to start project sandbox:', error);
      toast.error('Failed to load project');
      setIsLoading(false);
    }
  };

  const loadTemplate = async (templateJson: string) => {
    try {
      setIsLoading(true);
      const template = JSON.parse(templateJson);
      
      // Convert template files to the format expected by parsedFiles
      const files = template.files.map((f: any) => ({
        path: f.path,
        content: f.content
      }));
      
      setParsedFiles(files);
      if (files.length > 0) setSelectedFile(files[0].path);
      
      // Store template data for later use
      setLoadedTemplate(template);
      setTemplateReadyToRun(true);
      
      addChatMessage(`Template "${template.name}" loaded! Click "Run App" to render it in the preview.`, 'ai', <Play className="w-4 h-4" />);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load template:', error);
      toast.error('Failed to load template');
      setIsLoading(false);
    }
  };

  const runTemplateApp = async () => {
    if (!loadedTemplate) return;
    
    try {
      setIsLoading(true);
      setTemplateReadyToRun(false);
      
      addChatMessage('Creating sandbox environment...', 'progress', <Wrench className="w-4 h-4" />);
      
      // Create sandbox and apply template (force fresh to avoid old file contamination)
      const sandboxData = await createSandbox(true, true);
      if (sandboxData) {
        addChatMessage('Applying template to sandbox...', 'progress', <Loader2 className="w-4 h-4 animate-spin" />);
        
        // Format files as <file> tags for apply-code API
        const filePayload = loadedTemplate.files.map((f: any) => 
          `<file path="${f.path}">${f.content}</file>`
        ).join('\n');
        
        const applyRes = await fetch('/api/apply-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            response: filePayload,
            sandboxId: sandboxData.sandboxId,
            clearBeforeApply: true
          })
        });
        
        if (applyRes.ok) {
          addChatMessage('Template applied! Restarting Vite server...', 'progress', <Loader2 className="w-4 h-4 animate-spin" />);
          
          // Restart Vite server to pick up the new files
          const restartRes = await fetch('/api/restart-vite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sandboxId: sandboxData.sandboxId })
          });
          
          if (restartRes.ok) {
            addChatMessage('Template applied successfully! Preview is ready.', 'ai', <Check className="w-4 h-4" />);
            setActiveTab('preview');
          } else {
            addChatMessage('Template applied but Vite restart failed. Try refreshing the preview.', 'warning', <AlertTriangle className="w-4 h-4" />);
            setActiveTab('preview');
          }
          
          // Save as a new project
          const projectName = loadedTemplate.name;
          const projectRes = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: projectName,
              description: `Created from template: ${loadedTemplate.name}`,
              style: 'modern',
            }),
          });
          
          if (projectRes.ok) {
            const projectData = await projectRes.json();
            setProjectId(projectData.project.id);
            
            const files = loadedTemplate.files.map((f: any) => ({
              path: f.path,
              content: f.content
            }));
            
            // Save files to the project
            for (const file of files) {
              await fetch(`/api/projects/${projectData.project.id}/files`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  path: file.path,
                  content: file.content,
                  language: file.path.endsWith('.jsx') ? 'jsx' : file.path.endsWith('.css') ? 'css' : 'javascript',
                }),
              });
            }
            
            // Update project with sandbox info
            await fetch(`/api/projects/${projectData.project.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sandboxId: sandboxData.sandboxId,
                sandboxUrl: sandboxData.url,
                status: 'ready',
              }),
            });
          }
        } else {
          throw new Error('Failed to apply template to sandbox');
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to run template:', error);
      toast.error('Failed to run template');
      setIsLoading(false);
      setTemplateReadyToRun(true);
    }
  };

  const saveProject = async (url: string, sandboxId: string, sandboxUrl: string, files: {path: string, content: string}[]) => {
    try {
      let currentProjectId = projectId;
      const isNewProject = !currentProjectId;

      // If no project exists, create one
      if (isNewProject) {
        const projectRes = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: url.replace(/https?:\/\//, '').split('/')[0],
            description: `Generated from ${url}`,
            sourceUrl: url,
            style: 'modern',
          }),
        });

        if (!projectRes.ok) throw new Error('Failed to create project');

        const projectData = await projectRes.json();
        currentProjectId = projectData.project.id;
        setProjectId(currentProjectId);
      }

      // Save/update all files
      for (const file of files) {
        await fetch(`/api/projects/${currentProjectId}/files`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: file.path,
            content: file.content,
            language: file.path.endsWith('.jsx') ? 'jsx' : file.path.endsWith('.css') ? 'css' : 'javascript',
          }),
        });
      }

      // Update project with sandbox info and status
      await fetch(`/api/projects/${currentProjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sandboxId,
          sandboxUrl,
          status: 'ready',
        }),
      });

      toast.success(isNewProject ? 'Project saved successfully' : 'Project updated successfully');

      // Return the projectId so callers can use it immediately
      return currentProjectId;
    } catch (error) {
      toast.error('Failed to save project');
      return null;
    }
  };

  // Save files for an existing project (used after chat modifications)
  const saveProjectFiles = async (files: {path: string, content: string}[]) => {
    if (!projectId) return;

    try {
      for (const file of files) {
        await fetch(`/api/projects/${projectId}/files`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: file.path,
            content: file.content,
            language: file.path.endsWith('.jsx') ? 'jsx' : file.path.endsWith('.css') ? 'css' : 'javascript',
          }),
        });
      }
    } catch (error) {
      console.error('Failed to save project files:', error);
    }
  };

  // Save a project generated from a prompt (not URL)
  const savePromptProject = async (prompt: string, sandboxId: string, sandboxUrl: string, files: {path: string, content: string}[]) => {
    try {
      let currentProjectId = projectId;
      const isNewProject = !currentProjectId;

      // If no project exists, create one
      if (isNewProject) {
        // Generate a project name from the prompt (first 50 chars or first sentence)
        const projectName = prompt.length > 50 ? prompt.slice(0, 50) + '...' : prompt;

        const projectRes = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: projectName,
            description: `Generated from prompt: ${prompt}`,
            style: 'modern',
          }),
        });

        if (!projectRes.ok) throw new Error('Failed to create project');

        const projectData = await projectRes.json();
        currentProjectId = projectData.project.id;
        setProjectId(currentProjectId);
      }

      // Save/update all files
      for (const file of files) {
        await fetch(`/api/projects/${currentProjectId}/files`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: file.path,
            content: file.content,
            language: file.path.endsWith('.jsx') ? 'jsx' : file.path.endsWith('.css') ? 'css' : 'javascript',
          }),
        });
      }

      // Update project with sandbox info and status
      await fetch(`/api/projects/${currentProjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sandboxId,
          sandboxUrl,
          status: 'ready',
        }),
      });

      toast.success(isNewProject ? 'Project saved successfully' : 'Project updated successfully');

      // Return the projectId so callers can use it immediately
      return currentProjectId;
    } catch (error) {
      toast.error('Failed to save project');
      return null;
    }
  };

  const saveConversation = async (projectId: string, type: string, content: string) => {
    try {
      await fetch(`/api/projects/${projectId}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: type, content }),
      });
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  };

  // === CODE EDITING FUNCTIONS ===

  const handleSaveCode = async () => {
    if (!selectedFile || !projectId || !editedContent.trim()) {
      toast.error('No file selected or no content to save');
      return;
    }

    setIsSaving(true);
    const saveToastId = toast.loading('Saving changes...');

    try {
      // 1. Save to database via PUT endpoint
      const saveRes = await fetch(`/api/projects/${projectId}/files/${encodeURIComponent(selectedFile)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editedContent,
          language: selectedFile.endsWith('.jsx') ? 'jsx' : selectedFile.endsWith('.css') ? 'css' : selectedFile.endsWith('.html') ? 'html' : 'javascript',
        }),
      });

      if (!saveRes.ok) {
        throw new Error('Failed to save file to database');
      }

      // Update local state
      setParsedFiles(prev => prev.map(f =>
        f.path === selectedFile ? { ...f, content: editedContent } : f
      ));
      setHasUnsavedChanges(false);

      toast.success('Changes saved successfully', { id: saveToastId });

      // 2. Apply to sandbox if healthy
      if (sandboxHealthy) {
        setIsApplying(true);
        const applyToastId = toast.loading('Applying changes to preview...');

        try {
          // Format as <file> tag for the apply-code API
          const filePayload = `<file path="${selectedFile}">${editedContent}</file>`;

          const applyRes = await fetch('/api/apply-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ response: filePayload }),
          });

          if (applyRes.ok) {
            toast.success('Preview updated', { id: applyToastId });
            // Refresh iframe to show changes
            if (iframeRef.current) {
              iframeRef.current.src = iframeRef.current.src;
            }
          } else {
            const errorData = await applyRes.json().catch(() => ({ error: 'Unknown error' }));
            toast.error(`Preview update failed: ${errorData.error || 'Unknown error'}`, { id: applyToastId });
          }
        } catch (applyError) {
          toast.error('Failed to apply changes to preview', { id: applyToastId });
        } finally {
          setIsApplying(false);
        }
      } else {
        toast.info('Changes saved but preview not updated - sandbox is not active');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save changes', { id: saveToastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCodeChange = (newContent: string) => {
    setEditedContent(newContent);
    const originalContent = parsedFiles.find(f => f.path === selectedFile)?.content || '';
    setHasUnsavedChanges(newContent !== originalContent);
  };

  const handleDiscardChanges = () => {
    const originalContent = parsedFiles.find(f => f.path === selectedFile)?.content || '';
    setEditedContent(originalContent);
    setHasUnsavedChanges(false);
    toast.info('Changes discarded');
  };

  const handleDeleteFile = async () => {
    if (!fileToDelete || !projectId) return;

    const deleteToastId = toast.loading('Deleting file...');

    try {
      // Delete from database
      const deleteRes = await fetch(`/api/projects/${projectId}/files/${encodeURIComponent(fileToDelete)}`, {
        method: 'DELETE',
      });

      if (!deleteRes.ok) {
        throw new Error('Failed to delete file from database');
      }

      // Update local state
      setParsedFiles(prev => prev.filter(f => f.path !== fileToDelete));

      // If the deleted file was selected, clear selection
      if (selectedFile === fileToDelete) {
        setSelectedFile(null);
        setEditedContent('');
        setHasUnsavedChanges(false);
      }

      toast.success('File deleted successfully', { id: deleteToastId });
      setDeleteModalOpen(false);
      setFileToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file', { id: deleteToastId });
    }
  };

  const openDeleteModal = (filePath: string) => {
    setFileToDelete(filePath);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setFileToDelete(null);
  };

  // === CORE FUNCTIONS ===

  const captureUrlScreenshot = async (url: string, fromGeneration = false) => {
    setIsCapturingScreenshot(true);
    setScreenshotError(null);
    
    // Show typing indicator while initiating screenshot
    setTypingStatus("Connecting to Firecrawl API...");
    setIsTyping(true);
    
    // Small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 600));
    setIsTyping(false);
    
    addChatMessage('Capturing screenshot of the website...', 'progress', <Camera className="w-4 h-4" />);
    
    try {
      const response = await fetch('/api/scrape-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      const data = await response.json();
      
      if (data.success && data.screenshot) {
        setUrlScreenshot(data.screenshot);
        if (!fromGeneration) {
          addChatMessage('Screenshot captured successfully!', 'progress', <Check className="w-4 h-4" />);
        }
      } else {
        setScreenshotError(data.error || 'Failed to capture screenshot');
        addChatMessage(`Failed to capture screenshot: ${data.error}`, 'error', <X className="w-4 h-4" />);
      }
    } catch (error: any) {
      setScreenshotError('Network error while capturing screenshot');
      addChatMessage('Network error while capturing screenshot', 'error', <X className="w-4 h-4" />);
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  const createSandbox = async (fromGeneration = false, forceFresh = false) => {
    if (sandboxCreationRef.current) {
      console.log('[createSandbox] Already in progress, skipping...');
      return null;
    }
    
    sandboxCreationRef.current = true;
    
    if (!fromGeneration) {
      addChatMessage('Creating sandbox environment...', 'progress', <Wrench className="w-4 h-4" />);
    }
    
    try {
      const response = await fetch('/api/create-sandbox', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceFresh })
      });
      const data = await response.json();
      
      if (data.success) {
        setSandboxUrl(data.url);
        setSandboxHealthy(true);
        if (!fromGeneration) {
          addChatMessage('Sandbox ready! Environment initialized.', 'progress', <Check className="w-4 h-4" />);
        }
        return data;
      } else {
        throw new Error(data.error || 'Failed to create sandbox');
      }
    } catch (error: any) {
      setSandboxHealthy(false);
      addChatMessage(`Sandbox creation failed: ${error.message}`, 'error', <X className="w-4 h-4" />);
      throw error;
    } finally {
      sandboxCreationRef.current = false;
    }
  };

  const startGeneration = async (url: string, model: string) => {
    if (!url.trim()) {
      toast.error('Please enter a URL to clone');
      return;
    }

    // Validate URL format
    let validatedUrl = url.trim();
    if (!validatedUrl.startsWith('http://') && !validatedUrl.startsWith('https://')) {
      validatedUrl = 'https://' + validatedUrl;
    }

    const cloneToastId = toast.loading(`Starting to clone ${validatedUrl}...`);
    setIsLoading(true);

    // Clear chat history for new generation
    setChatHistory([]);

    // Start creating sandbox and capturing screenshot in parallel
    // Always create sandbox to ensure provider is registered
    const sandboxPromise = createSandbox(true);
    captureUrlScreenshot(validatedUrl, true);

    try {
      // Wait for sandbox
      const sandboxData = await sandboxPromise;
      toast.loading('Scraping website and generating code...', { id: cloneToastId });
      await streamScrapeAndGenerate(validatedUrl, model, sandboxData);
      toast.success('Website cloned successfully!', { id: cloneToastId });
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate website', { id: cloneToastId });
      addChatMessage(`Failed: ${error.message}`, 'error');
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const streamScrapeAndGenerate = async (url: string, model: string, sandboxData: any) => {
    setGenerationProgress(prev => ({ ...prev, isGenerating: true, isStreaming: true }));

    try {
      // Start streaming scrape
      const scrapeRes = await fetch('/api/scrape-url-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const reader = scrapeRes.body?.getReader();
      if (!reader) throw new Error('Failed to start scraping');

      let scrapeData: any = null;

      // Read scrape stream (no progress messages shown)
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'complete') {
              scrapeData = data.data;
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          } catch {}
        }
      }
      
      if (!scrapeData || !scrapeData.success) {
        throw new Error('Failed to scrape website after retries');
      }
      
      // Generate code and stream to code tab
      addChatMessage("**Planning the perfect design...**\n\nI'm analyzing the website's aesthetic direction, visual hierarchy, and selecting sophisticated component patterns that will create a beautiful, memorable result.", 'ai', <Bot className="w-4 h-4" />);

      const generateRes = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Recreate this website: ${url}`,
          scrapedContent: scrapeData.content,
          model
        })
      });

      const genReader = generateRes.body?.getReader();
      if (!genReader) throw new Error('Failed to start generation');

      let fullContent = "";
      let lastProgressUpdate = 0;
      const progressMessages = [
        { threshold: 0.1, message: '**Analyzing design direction...**\n\nEvaluating the aesthetic approach, color palette, and typography to select the perfect component patterns for this project.', icon: <Ruler className="w-4 h-4" /> },
        { threshold: 0.25, message: '**Crafting sophisticated navigation...**\n\nBuilding an elegant header with purposeful navigation that sets the tone for the entire experience.', icon: <Palette className="w-4 h-4" /> },
        { threshold: 0.4, message: '**Designing the hero section...**\n\nCreating a memorable first impression with bold typography, thoughtful composition, and visual impact.', icon: <Puzzle className="w-4 h-4" /> },
        { threshold: 0.6, message: '**Building content sections...**\n\nAssembling beautifully structured features, testimonials, and content areas with proper visual hierarchy.', icon: <Sparkles className="w-4 h-4" /> },
        { threshold: 0.75, message: '**Adding polish and motion...**\n\nImplementing smooth animations, hover effects, and micro-interactions that bring the design to life.', icon: <Zap className="w-4 h-4" /> },
        { threshold: 0.9, message: '**Finalizing and wiring up...**\n\nCompleting the footer, ensuring responsive behavior, and connecting all components into a cohesive whole.', icon: <Wrench className="w-4 h-4" /> },
      ];

      while (true) {
        const { done, value } = await genReader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'content') {
              fullContent += data.content;
              setGenerationProgress(prev => ({ ...prev, streamedCode: fullContent }));

              // Show progress messages at thresholds based on actual file count
              const fileCount = (fullContent.match(/<file path=/g) || []).length;
              const progress = fileCount / 6; // 6 expected files
              for (const { threshold, message, icon } of progressMessages) {
                if (progress >= threshold && lastProgressUpdate < threshold) {
                  addChatMessage(message, 'ai', icon);
                  lastProgressUpdate = threshold;
                  break;
                }
              }
            } else if (data.type === 'progress') {
              // Update progress based on actual file detection from server
              const { fileCount, isComplete, attempt, maxRetries, model } = data;
              setGenerationProgress(prev => ({
                ...prev,
                files: Array(fileCount).fill(null).map((_, i) => ({
                  path: `file-${i}`,
                  content: '',
                  completed: isComplete
                }))
              }));
              // Log attempt info for debugging
              if (attempt && maxRetries) {
                console.log(`[Generation] Attempt ${attempt}/${maxRetries}, Model: ${model || 'primary'}`);
              }
            } else if (data.type === 'status') {
              // Log status updates
              console.log(`[Generation Status]`, data.message);
            } else if (data.type === 'heartbeat') {
              // Heartbeat received - connection is alive, no action needed
              console.log('[Generation] Heartbeat received');
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          } catch (e) {
            // Ignore parse errors for individual lines
          }
        }
      }

      setGeneratedCode(fullContent);
      
      // Parse files
      const fileRegex = /<file path="([^"]+)">([\s\S]*?)(?:<\/file>|<file path="|$)/g;
      const files: {path: string, content: string}[] = [];
      let match;
      while ((match = fileRegex.exec(fullContent)) !== null) {    
        let content = match[2].trim();
        content = content.replace(/<\/file>$/, '').trim();
        if (content.length > 0) {
          files.push({ path: match[1], content });
        }
      }
      setParsedFiles(files);
      if (files.length > 0) setSelectedFile(files[0].path);
      
      // Apply code to sandbox
      addChatMessage('Analyzing and applying code to sandbox...', 'progress', <Wrench className="w-4 h-4" />);
      
      console.log('[startGeneration] sandboxData:', sandboxData);
      console.log('[startGeneration] sandboxData?.sandboxId:', sandboxData?.sandboxId);
      
      const applyRes = await fetch('/api/apply-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response: fullContent,
          sandboxId: sandboxData?.sandboxId
        })
      });
      
      // Check response before parsing
      if (!applyRes.ok) {
        let errorMessage = 'Failed to apply code';
        try {
          const errorText = await applyRes.text();
          if (errorText) {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          }
        } catch (parseError) {
          errorMessage = applyRes.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const applyData = await applyRes.json();

      if (applyData.success) {
        const successMessage = `Done! Generated ${files.length} files. Chat with me to make changes.`;
        addChatMessage(successMessage, 'ai', <Check className="w-4 h-4" />);

        // Save project and get the projectId
        let currentProjectId = projectId;
        if (sandboxData) {
          currentProjectId = await saveProject(url, sandboxData.sandboxId, sandboxData.url, files);
        }

        // Save conversation messages now that project exists
        if (currentProjectId) {
          const cleanUrl = url.replace(/^https?:\/\//i, '');
          await saveConversation(currentProjectId, 'system', `Cloning ${cleanUrl}...`);
          await saveConversation(currentProjectId, 'assistant', successMessage);
        }

        // Switch to preview tab to show the generated result
        setActiveTab('preview');
      } else {
        throw new Error(applyData.error || 'Failed to apply code');
      }
      
    } catch (error: any) {
      addChatMessage(`Error: ${error.message}`, 'error', <X className="w-4 h-4" />);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
      setGenerationProgress(prev => ({ ...prev, isGenerating: false, isStreaming: false }));
    }
  };

  const handleChat = async () => {
    if (!chatMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    const userMsg = chatMessage;
    addChatMessage(userMsg, 'user');
    setChatMessage("");
    setIsGenerating(true);

    const chatToastId = toast.loading('Processing your request...');

    // Show typing indicator while AI processes
    setTypingStatus("Thinking...");
    setIsTyping(true);

    try {
      const res = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg,
          scrapedContent: `Previous conversation:\n${chatHistory.map(h => `${h.type}: ${h.content}`).join('\n')}`,
          model: selectedModel,
          isChat: true
        })
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Failed to start chat");

      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'content') {
              fullContent += data.content;
            }
          } catch {}
        }
      }

      // Hide typing indicator and add AI response
      setIsTyping(false);

      // Parse response
      const { textResponse, codeBlocks } = parseAiResponse(fullContent);
      addChatMessage(textResponse, 'ai');

      // Save user and AI conversation messages if project exists
      if (projectId) {
        await saveConversation(projectId, 'user', userMsg);
        await saveConversation(projectId, 'assistant', textResponse);
      }

      // Apply code if there are code blocks
      if (codeBlocks.length > 0) {
        addChatMessage('Creating sandbox and applying code...', 'progress', <Wrench className="w-4 h-4" />);

        // Create sandbox NOW (after AI generation) so it's fresh
        const sandboxData = await createSandbox(true);
        if (!sandboxData) {
          throw new Error('Failed to create sandbox');
        }

        // Send the full AI response so API can parse <file> tags correctly
        const applyRes = await fetch('/api/apply-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            response: fullContent,
            sandboxId: sandboxData.sandboxId
          })
        });

        if (applyRes.ok) {
          const applyData = await applyRes.json();
          addChatMessage(`Code updated and applied! (${applyData.results?.filesCreated?.length || 0} files)`, 'ai', <Check className="w-4 h-4" />);
          toast.success(`Code updated! ${applyData.results?.filesCreated?.length || 0} files created/updated`, { id: chatToastId });

          // Use parsed files from API response (more reliable)
          if (applyData.parsedFiles && applyData.parsedFiles.length > 0) {
            const files = applyData.parsedFiles.map((f: {path: string, length?: number}) => {
              // Try to find content from code blocks
              for (const block of codeBlocks) {
                const fileRegex = new RegExp(`<file path="${f.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">([\\s\\S]*?)(?:</file>|<file path=|$)`, 'g');
                const match = fileRegex.exec(block);
                if (match) {
                  let content = match[1].trim().replace(/<\/file>$/, '').trim();
                  return { path: f.path, content };
                }
              }
              return { path: f.path, content: '' };
            }).filter((f: {content: string}) => f.content.length > 0);

            const existingPaths = new Set(parsedFiles.map(p => p.path));
            const newFiles = files.filter((f: {path: string}) => !existingPaths.has(f.path));

            // Update parsed files state with deduplication
            setParsedFiles(prev => {
              const combined = [...prev, ...newFiles];
              const seen = new Set<string>();
              return combined.filter(f => {
                if (seen.has(f.path)) return false;
                seen.add(f.path);
                return true;
              });
            });

            // Save project (create if new, update if existing)
            const currentProjectId = await savePromptProject(userMsg, sandboxData.sandboxId, sandboxData.url, files);

            // Save conversation messages now that project exists
            if (currentProjectId) {
              await saveConversation(currentProjectId, 'user', userMsg);
              await saveConversation(currentProjectId, 'assistant', `Code updated and applied! (${applyData.results?.filesCreated?.length || 0} files)`);
            }

            setSandboxHealthy(true);
            setSandboxUrl(sandboxData.url);

            // Auto-switch to preview tab to show results
            setActiveTab('preview');
          }
        } else {
          // Handle error response - may be empty if server crashed/timed out
          let errorMessage = 'Sandbox timed out. Please try again.';
          try {
            const errorText = await applyRes.text();
            if (errorText) {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.error || errorMessage;
            }
          } catch (parseError) {
            // If parsing fails, use status text
            errorMessage = applyRes.statusText || errorMessage;
          }
          addChatMessage(`Failed to apply code: ${errorMessage}`, 'error', <X className="w-4 h-4" />);
          toast.error(`Failed to apply code: ${errorMessage}`, { id: chatToastId });
          setSandboxHealthy(false);
        }
      } else {
        // No code blocks, just a text response
        toast.success('Response received', { id: chatToastId });
      }

    } catch (error) {
      toast.error("Failed to process chat message", { id: chatToastId });
    } finally {
      setIsGenerating(false);
      setIsTyping(false);
    }
  };

  const parseAiResponse = (response: string) => {
    const codeBlockRegex = /\`\`\`[\s\S]*?\`\`\`/g;
    const codeBlocks: string[] = [];
    let textResponse = response;
    
    let match;
    while ((match = codeBlockRegex.exec(response)) !== null) {
      codeBlocks.push(match[0]);
      textResponse = textResponse.replace(match[0], '[Code generated - see Code tab]');
    }
    
    const fileBlockRegex = /<file path="[^"]+">[\s\S]*?<\/file>/g;
    while ((match = fileBlockRegex.exec(response)) !== null) {
      if (!codeBlocks.includes(match[0])) {
        codeBlocks.push(match[0]);
        textResponse = textResponse.replace(match[0], '[Code generated - see Code tab]');
      }
    }
    
    return { textResponse, codeBlocks };
  };

  const downloadCode = async () => {
    const downloadToastId = toast.loading('Preparing download...');
    try {
      const res = await fetch('/api/create-zip', { method: 'POST' });
      if (!res.ok) throw new Error("Failed to create zip");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Project downloaded successfully!", { id: downloadToastId });
    } catch (error) {
      toast.error("Failed to download project", { id: downloadToastId });
    }
  };

  const restart = () => {
    toast.info('Starting new project...');
    sessionStorage.removeItem('targetUrl');
    sessionStorage.removeItem('selectedModel');
    router.push('/');
  };

  // === RENDER ===
  
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#f5f3ef] dark:bg-[#1a1a1a] text-[#1a1a1a] dark:text-[#f5f3ef] flex items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#1a1a1a] dark:border-[#f5f3ef] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#6b6b6b] dark:text-[#b8b0a8]">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#f5f3ef] dark:bg-[#1a1a1a] text-[#1a1a1a] dark:text-[#f5f3ef] flex items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#1a1a1a] dark:border-[#f5f3ef] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#6b6b6b] dark:text-[#b8b0a8]">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  // Removed loading overlay - everything loads in chat now

    return (
    <div className="min-h-screen bg-[#f5f3ef] dark:bg-[#1a1a1a] text-[#1a1a1a] dark:text-[#f5f3ef] transition-colors duration-300">

      {/* Header */}
      <header className="border-b border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 bg-[#faf9f7]/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm sticky top-0 z-30 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <div className="h-6 w-px bg-[#1a1a1a]/10 dark:bg-[#f5f3ef]/10" />
            <Button variant="ghost" size="sm" onClick={restart} className="dark:text-[#b8b0a8] dark:hover:text-[#f5f3ef]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <AnimatedThemeToggler variant="circle" duration={500} />
            <Badge variant="outline" className="text-xs dark:border-[#f5f3ef]/20 dark:text-white">
              {isLoading || isGenerating ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  {generationProgress.status || 'Working...'}
                </span>
              ) : (
                <span className="flex items-center gap-2 text-green-600">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Ready
                </span>
              )}
            </Badge>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadCode}
              disabled={isLoading || parsedFiles.length === 0}
              className="px-3 py-2 text-sm border border-[#1a1a1a]/10 dark:border-[#f5f3ef]/20 text-[#1a1a1a] dark:text-[#f5f3ef] rounded-lg hover:bg-[#1a1a1a]/5 dark:hover:bg-[#f5f3ef]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className="w-64 border-r border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 bg-[#faf9f7] dark:bg-[#252525] flex flex-col transition-colors duration-300">
          {/* URL Input */}
          <motion.div 
            className="p-6 border-b border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10"
            whileHover={{ backgroundColor: "rgba(139, 115, 85, 0.03)" }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-xs font-semibold text-[#8b7355] uppercase tracking-widest mb-4">Clone Website</p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#1a1a1a] border border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 rounded-lg shadow-sm transition-all duration-200 focus-within:border-[#8b7355]/50 focus-within:shadow-md">
                <Globe className="w-4 h-4 text-[#9b9b9b] dark:text-[#b8b0a8]" />
                <span className="text-xs text-[#9b9b9b] dark:text-[#6b6b6b]">https://</span>
                <input
                  type="text"
                  placeholder="example.com"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && startGeneration(targetUrl, selectedModel)}
                  className="flex-1 bg-transparent text-sm outline-none text-[#1a1a1a] dark:text-[#f5f3ef] placeholder:text-[#9b9b9b] dark:placeholder:text-[#6b6b6b]"
                />
              </div>
              <LiquidButton
                onClick={() => startGeneration(targetUrl, selectedModel)}
                disabled={!targetUrl.trim() || isLoading}
                isLoading={isLoading}
                className="w-full"
              >
                <Zap className="w-4 h-4" />
                <span>Clone Website</span>
              </LiquidButton>
            </div>
          </motion.div>

          {/* Project Info */}
          <motion.div 
            className="px-6 py-5 border-b border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10"
            whileHover={{ backgroundColor: "rgba(139, 115, 85, 0.03)" }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-xs font-semibold text-[#8b7355] uppercase tracking-widest mb-2">Project</p>
            <p className="text-base font-medium truncate dark:text-[#f5f3ef]">{targetUrl || 'New Project'}</p>
          </motion.div>

          {/* Status */}
          <div className="flex-1 px-6 py-6 space-y-8 overflow-y-auto">
            <div>
              <p className="text-xs font-semibold text-[#8b7355] uppercase tracking-widest mb-4">Status</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm dark:text-[#b8b0a8]">
                  <div className="relative">
                    {sandboxHealthy && (
                      <motion.div
                        className="absolute inset-0 bg-green-500 rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                    <div className={`relative w-2.5 h-2.5 rounded-full ${sandboxHealthy ? 'bg-green-500' : isLoading ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  </div>
                  <span>Sandbox {sandboxHealthy ? 'Ready' : isLoading ? 'Creating...' : 'Not started'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm dark:text-[#b8b0a8]">
                  <div className="relative">
                    {parsedFiles.length > 0 && (
                      <motion.div
                        className="absolute inset-0 bg-green-500 rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                    <div className={`relative w-2.5 h-2.5 rounded-full ${parsedFiles.length > 0 ? 'bg-green-500' : isGenerating ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  </div>
                  <span>Code {parsedFiles.length > 0 ? `${parsedFiles.length} files` : isGenerating ? 'Generating...' : 'Not generated'}</span>
                </div>
              </div>
            </div>

            {parsedFiles.length > 0 && (
              <div className="relative">
                <p className="text-xs font-semibold text-[#8b7355] uppercase tracking-widest mb-4">Files</p>
                <div className="space-y-1.5 relative">
                  {/* Sliding highlight for files */}
                  <motion.div
                    className="absolute left-0 right-0 bg-[#8b7355]/10 dark:bg-[#8b7355]/20 rounded-lg pointer-events-none"
                    animate={{
                      top: fileSliderStyle.top,
                      height: fileSliderStyle.height,
                      opacity: fileSliderStyle.opacity,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 28,
                    }}
                  />
                  
                  {parsedFiles.map((file) => (
                    <div
                      key={file.path}
                      ref={(el) => {
                        if (el) fileItemRefs.current.set(file.path, el);
                      }}
                      className={`flex items-center gap-2 group relative z-10`}
                    >
                      <button
                        onClick={() => { setSelectedFile(file.path); setActiveTab('code'); }}
                        className={`flex-1 text-left px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                          selectedFile === file.path 
                            ? 'text-[#1a1a1a] dark:text-[#f5f3ef] font-medium' 
                            : 'dark:text-[#b8b0a8] hover:text-[#8b7355] dark:hover:text-[#8b7355]'
                        }`}
                      >
                        {file.path.split('/').pop()}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openDeleteModal(file.path); }}
                        className="px-2.5 py-2.5 text-sm opacity-0 group-hover:opacity-100 transition-all duration-200 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:scale-110"
                        title="Delete file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <AsciiAnimation color="#8b7355" />
          </div>

          {/* Actions */}
          <motion.div 
            className="p-6 border-t border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10"
            whileHover={{ backgroundColor: "rgba(139, 115, 85, 0.03)" }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={restart}
              className="w-full text-sm px-4 py-3 border border-[#1a1a1a]/10 dark:border-[#f5f3ef]/20 text-[#1a1a1a] dark:text-[#f5f3ef] rounded-lg hover:bg-[#1a1a1a]/5 dark:hover:bg-[#f5f3ef]/10 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Start New Project
            </motion.button>
          </motion.div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col bg-[#f5f3ef] dark:bg-[#1a1a1a] transition-colors duration-300">
          {/* Tabs */}
          <div className="border-b border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 bg-[#faf9f7] dark:bg-[#252525] transition-colors duration-300 relative">
            <div className="flex px-6 relative">
              {/* Sliding background */}
              <motion.div
                className="absolute bottom-0 h-full bg-[#8b7355]/10 dark:bg-[#8b7355]/20 rounded-lg"
                animate={{
                  left: sliderStyle.left,
                  width: sliderStyle.width,
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              />
              
              <button
                ref={chatTabRef}
                onClick={() => setActiveTab("chat")}
                className={`relative px-5 py-4 text-sm font-medium flex items-center gap-2.5 transition-all duration-200 z-10 ${
                  activeTab === "chat"
                    ? "text-[#1a1a1a] dark:text-[#f5f3ef]"
                    : "text-[#6b6b6b] dark:text-[#b8b0a8] hover:text-[#8b7355] dark:hover:text-[#8b7355]"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Chat
                {chatHistory.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-[#8b7355] text-white rounded-full">
                    {chatHistory.length}
                  </span>
                )}
              </button>
              <button
                ref={previewTabRef}
                onClick={() => setActiveTab("preview")}
                className={`relative px-5 py-4 text-sm font-medium flex items-center gap-2.5 transition-all duration-200 z-10 ${
                  activeTab === "preview"
                    ? "text-[#1a1a1a] dark:text-[#f5f3ef]"
                    : "text-[#6b6b6b] dark:text-[#b8b0a8] hover:text-[#8b7355] dark:hover:text-[#8b7355]"
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                ref={codeTabRef}
                onClick={() => setActiveTab("code")}
                className={`relative px-5 py-4 text-sm font-medium flex items-center gap-2.5 transition-all duration-200 z-10 ${
                  activeTab === "code"
                    ? "text-[#1a1a1a] dark:text-[#f5f3ef]"
                    : "text-[#6b6b6b] dark:text-[#b8b0a8] hover:text-[#8b7355] dark:hover:text-[#8b7355]"
                }`}
              >
                <Code className="w-4 h-4" />
                Code
                {generationProgress.isStreaming && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-amber-500 text-white rounded-full animate-pulse inline-flex items-center">
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Live
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {/* Chat Tab */}
            {activeTab === "chat" && (
              <div className="h-full flex flex-col bg-[#f5f3ef] dark:bg-[#1a1a1a] transition-colors duration-300 relative">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 relative z-10 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
                  <AnimatePresence mode="popLayout">
                    {chatHistory.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center text-[#6b6b6b] dark:text-[#b8b0a8] py-20"
                      >
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                          className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-[#8b7355]/30 to-[#8b7355]/10 rounded-3xl flex items-center justify-center shadow-lg"
                        >
                          <MessageSquare className="w-12 h-12 text-[#8b7355]" />
                        </motion.div>
                        <h2 className="text-2xl font-semibold text-[#1a1a1a] dark:text-[#f5f3ef] mb-3">Ready to build</h2>
                        <p className="text-base max-w-md mx-auto leading-relaxed">Enter a URL above to clone a website, or type a message to start creating something new together.</p>
                      </motion.div>
                    ) : (
                      <>
                        {chatHistory.map((msg, index) => (
                          <motion.div
                            key={msg.id}
                            layout
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ 
                              delay: index * 0.05,
                              duration: 0.4,
                              ease: [0.25, 0.1, 0.25, 1]
                            }}
                            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] relative transition-all duration-200 hover:translate-y-[-2px] ${
                                msg.type === 'user'
                                  ? 'bg-[#1a1a1a] dark:bg-[#f5f3ef] text-[#f5f3ef] dark:text-[#1a1a1a] shadow-xl shadow-black/20 dark:shadow-black/5'
                                  : msg.type === 'error'
                                  ? 'bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-200 border-l-4 border-red-500'
                                  : msg.type === 'progress'
                                  ? 'bg-[#8b7355] text-white border-l-4 border-[#6b5344]'
                                  : 'bg-white dark:bg-[#2a2a2a] text-[#1a1a1a] dark:text-[#f5f3ef] border-l-4 border-[#8b7355] shadow-md'
                              } rounded-r-xl rounded-l-sm px-6 py-4`}
                            >
                              {/* Icon for messages */}
                              {msg.icon && (
                                <div className="flex items-center gap-2 mb-2">
                                  {msg.icon}
                                </div>
                              )}
                              
                              
                              {msg.type === 'ai' ? (
                                <MarkdownMessage
                                  content={msg.content}
                                  className={`leading-relaxed text-[14px] ${
                                    msg.type === 'ai' ? 'text-[15px]' : 'text-[14px]'
                                  }`}
                                />
                              ) : (
                                <p className={`leading-relaxed ${
                                  msg.type === 'user' 
                                    ? 'text-[#f5f3ef] dark:text-[#1a1a1a]' 
                                    : msg.type === 'progress' 
                                    ? 'text-white' 
                                    : 'text-[#1a1a1a] dark:text-[#f5f3ef]'
                                } ${
                                  msg.type === 'progress' ? 'text-[15px]' : 'text-[14px]'
                                }`}>
                                  {msg.content}
                                </p>
                              )}
                              
                              <div className={`flex items-center gap-1.5 mt-2 text-[11px] ${
                                msg.type === 'user' ? 'text-white/50 dark:text-[#1a1a1a]/50' : msg.type === 'progress' ? 'text-white/70' : 'text-[#9b9b9b] dark:text-[#b8b0a8]'
                              }`}>
                                <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {msg.type === 'user' && (
                                  <motion.span
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-white/70"
                                  >
                                    ✓
                                  </motion.span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        
                        {/* Typing Indicator */}
                        {isTyping && (
                          <TypingIndicator status={typingStatus} />
                        )}
                        
                        <div ref={chatEndRef} />
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Pre-filled Prompts - Dynamic based on code state */}
                <div className="px-5 pt-4 pb-2 border-t border-[#e8e6e3] dark:border-[#f5f3ef]/10 bg-[#f5f3ef] dark:bg-[#1a1a1a] transition-colors duration-300">
                  <div className="flex items-center gap-2 max-w-4xl mx-auto flex-wrap">
                    {(parsedFiles.length > 0 ? [
                      { label: "Make it dark mode", full: "Convert this design to a dark mode theme. Use deep charcoal backgrounds (#0f0f0f, #1a1a1a), off-white text (#f5f3ef), and adjust accent colors to be more vibrant against the dark background. Update all cards, sections, and components to work beautifully in dark mode." },
                      { label: "Make it blue-themed", full: "Transform this design into a blue-themed color scheme. Use deep navy backgrounds (#0a1929, #0d2137), crisp white text, and blue accents (#3b82f6, #60a5fa). Ensure all components, cards, and sections use the blue palette harmoniously." },
                      { label: "Add animations", full: "Add smooth Framer Motion animations throughout the site. Include fade-in on scroll, staggered entrance for cards and sections, hover scale effects on buttons and cards, and subtle parallax on hero elements. Make the experience feel alive and polished." },
                      { label: "More minimal", full: "Simplify the design to be ultra-minimal. Reduce the number of sections, increase whitespace significantly, use a more restrained color palette (black, white, one accent), and simplify typography to just one or two font weights. Remove any decorative elements." },
                      { label: "Add testimonials", full: "Add a testimonials section with 3-4 customer quotes. Include profile images (use placeholder initials or icons), star ratings, company names, and position titles. Use a grid or carousel layout that fits the existing design style." },
                      { label: "Change fonts", full: "Update the typography to use more distinctive Google Fonts. For headings, use Playfair Display, Cormorant Garamond, or Space Grotesk. For body text, use Source Serif 4, Lora, or Manrope. Ensure the font pairing creates clear visual hierarchy and feels designed, not default." },
                      { label: "Add pricing", full: "Add a pricing section with 3 pricing tiers (Basic, Pro, Enterprise). Include feature lists, price highlights, and a recommended/Popular badge on the middle tier. Use cards with clear hierarchy and make the CTA buttons prominent." },
                    ] : [
                      { label: "SaaS Landing Page", full: "Create a modern SaaS startup landing page with a hero section, feature grid, pricing tables, testimonials, and a CTA section. Use a clean, professional design with gradient accents." },
                      { label: "E-commerce Store", full: "Build a sleek e-commerce storefront with a product grid, shopping cart, product detail modal, category filters, and a checkout flow. Include product images, ratings, and pricing." },
                      { label: "Portfolio Website", full: "Design a creative portfolio website for a designer or developer with a hero section, project showcase, about section, skills grid, and contact form. Make it visually striking with bold typography." },
                      { label: "Dashboard App", full: "Create an analytics dashboard with sidebar navigation, stat cards, charts and graphs, recent activity feed, and data tables. Use a clean, modern admin panel design." },
                      { label: "Restaurant Site", full: "Build a restaurant website with a beautiful hero image, menu sections, photo gallery, reservation form, and contact info. Use warm, appetizing colors and elegant typography." },
                      { label: "Blog Platform", full: "Create a modern blog platform with article cards, featured posts, category tags, author profiles, newsletter signup, and a clean reading experience." },
                      { label: "Booking App", full: "Design a booking application for appointments or reservations with a calendar view, time slots, booking form, confirmation screen, and booking management." },
                    ]).map((prompt) => (
                      <button
                        key={prompt.label}
                        onClick={() => setChatMessage(prompt.full)}
                        disabled={isGenerating}
                        className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-[#1a1a1a] border border-[#e0ded9] dark:border-[#f5f3ef]/20 rounded-lg text-[#5c4f3d] dark:text-[#b8b0a8] hover:bg-[#8b7355]/5 hover:border-[#8b7355]/30 hover:text-[#8b7355] dark:hover:text-[#c9b896] transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {prompt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Run App Button - shows when template is loaded but not yet rendered */}
                {templateReadyToRun && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border-t border-[#e8e6e3] dark:border-[#f5f3ef]/10 bg-[#8b7355]/5 dark:bg-[#8b7355]/10"
                  >
                    <div className="flex items-center justify-between max-w-4xl mx-auto">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#8b7355] flex items-center justify-center">
                          <Play className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-[#1a1a1a] dark:text-[#f5f3ef]">Template Ready</p>
                          <p className="text-sm text-[#6b6b6b] dark:text-[#b8b0a8]">Click to render in preview</p>
                        </div>
                      </div>
                      <Button
                        onClick={runTemplateApp}
                        disabled={isLoading}
                        className="bg-[#8b7355] text-white hover:bg-[#a08060] font-medium px-6"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            Run App
                            <Play className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Chat Input */}
                <motion.div
                  className="p-5 pt-2 border-t border-[#e8e6e3] dark:border-[#f5f3ef]/10 bg-white/90 dark:bg-[#2a2a2a]"
                  initial={false}
                >
                  <div className="flex items-center gap-3 max-w-4xl mx-auto">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                        placeholder="Ask me to modify the code, add features, or anything else..."
                        className="w-full px-5 py-3.5 bg-white dark:bg-[#1a1a1a] border border-[#e0ded9] dark:border-[#f5f3ef]/20 rounded-xl text-[15px] outline-none focus:border-[#8b7355] focus:ring-2 focus:ring-[#8b7355]/10 transition-all placeholder:text-[#9b9b9b] dark:placeholder:text-[#6b6b6b] text-[#1a1a1a] dark:text-[#f5f3ef]"
                        disabled={isGenerating}
                      />
                      {chatMessage && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={() => setChatMessage('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9b9b9b] dark:text-[#b8b0a8] hover:text-[#6b6b6b] dark:hover:text-[#f5f3ef]"
                        >
                          ×
                        </motion.button>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleChat}
                      disabled={!chatMessage.trim() || isGenerating}
                      className={`px-5 py-3.5 rounded-xl font-medium text-sm transition-all ${
                        !chatMessage.trim() || isGenerating
                          ? 'bg-[#e0ded9] dark:bg-[#3a3a3a] text-[#9b9b9b] dark:text-[#6b6b6b] cursor-not-allowed'
                          : 'bg-[#1a1a1a] dark:bg-[#f5f3ef] text-white dark:text-[#1a1a1a] hover:bg-[#2d2d2d] dark:hover:bg-[#e5e2dd] shadow-lg shadow-black/10'
                      }`}
                    >
                      {isGenerating ? (
                        <RefreshCw className="w-5 h-5 animate-spin text-white dark:text-[#1a1a1a]" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>Send</span>
                          <Send className="w-4 h-4" />
                        </div>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Preview Tab */}
            {activeTab === "preview" && (
              <div className="h-full relative bg-[#f5f3ef] dark:bg-[#1a1a1a]">
                {sandboxUrl ? (
                  <iframe
                    ref={iframeRef}
                    src={sandboxUrl}
                    className="w-full h-full border-0"
                    title="Website Preview"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-[#6b6b6b] dark:text-[#b8b0a8]">
                    <div className="text-center">
                      <Eye className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>Preview will appear here after generation</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Code Tab */}
            {activeTab === "code" && (
              <div ref={codeContainerRef} className="h-full flex flex-col bg-[#f5f3ef] dark:bg-[#1a1a1a]">
                {selectedFile && parsedFiles.find(f => f.path === selectedFile) ? (
                  <>
                    {/* Code Header with Actions */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 bg-[#faf9f7] dark:bg-[#252525]">
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-medium text-[#8b7355]">{selectedFile}</p>
                        <Badge variant="outline" className="text-xs text-[#6b6b6b] dark:text-[#b8b0a8]">
                          {editedContent.length.toLocaleString()} chars
                        </Badge>
                        {hasUnsavedChanges && (
                          <Badge variant="solid" className="text-xs bg-amber-500 text-white">
                            Unsaved changes
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {hasUnsavedChanges && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDiscardChanges}
                            disabled={isSaving || isApplying}
                            className="text-[#6b6b6b] hover:text-red-600 dark:text-[#b8b0a8] dark:hover:text-red-400"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Discard
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSaveCode}
                          disabled={!hasUnsavedChanges || isSaving || isApplying}
                          className="dark:border-[#f5f3ef]/20 dark:text-[#f5f3ef] dark:hover:bg-[#f5f3ef]/10"
                        >
                          {isSaving || isApplying ? (
                            <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 mr-1" />
                          )}
                          {isSaving ? 'Saving...' : isApplying ? 'Applying...' : 'Save'}
                          <span className="ml-1 text-xs opacity-60">(Ctrl+S)</span>
                        </Button>
                      </div>
                    </div>

                    {/* Code Editor */}
                    <div className="flex-1 p-6 overflow-auto">
                      <CodeEditor
                        value={editedContent}
                        onValueChange={handleCodeChange}
                        highlight={(code) => (
                          <SyntaxHighlighter
                            language="javascript"
                            style={vscDarkPlus}
                            customStyle={{
                              background: 'transparent',
                              padding: 0,
                              margin: 0,
                              fontSize: '0.875rem',
                              fontFamily: 'monospace',
                            }}
                          >
                            {code}
                          </SyntaxHighlighter>
                        )}
                        padding={24}
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                          backgroundColor: '#1a1a1a',
                          borderRadius: '0.25rem',
                          minHeight: '100%',
                        }}
                        textareaClassName="outline-none"
                      />
                    </div>
                  </>
                ) : generationProgress.isStreaming && generationProgress.streamedCode ? (
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-[#8b7355] rounded-full animate-pulse" />
                      <p className="text-sm font-medium text-[#8b7355]">Generating...</p>
                    </div>
                    <pre className="font-mono text-sm bg-[#1a1a1a] text-[#f5f3ef] p-6 rounded-sm whitespace-pre-wrap break-words">
                      <code>{generationProgress.streamedCode}</code>
                    </pre>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-[#6b6b6b]">
                    <div className="text-center">
                      <Code className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>Select a file from the sidebar to view and edit its contents</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeDeleteModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.2 }}
              className="bg-[#faf9f7] dark:bg-[#252525] border border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 rounded-xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#1a1a1a] dark:text-[#f5f3ef]">Delete File</h3>
                  <p className="text-sm text-[#6b6b6b] dark:text-[#b8b0a8]">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-sm text-[#1a1a1a] dark:text-[#f5f3ef] mb-6">
                Are you sure you want to delete <span className="font-medium">{fileToDelete?.split('/').pop()}</span>? This will permanently remove the file from your project.
              </p>

              <div className="flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={closeDeleteModal}
                  className="dark:text-[#b8b0a8] dark:hover:text-[#f5f3ef]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteFile}
                  className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                >
                  Delete File
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
