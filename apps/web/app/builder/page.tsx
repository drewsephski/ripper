"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import { AsciiAnimation } from "@/components/effects";
import { Send, Download, RefreshCw, ArrowLeft, Code, Eye, Puzzle, MessageSquare, Globe, Zap, Loader2, Camera, Check, X, Wrench, Bot, Ruler, Palette, Sparkles } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedThemeToggler } from "@/components/AnimatedThemeToggler";
import { Logo } from "@/components/Logo";
import TypingIndicator from "@/components/TypingIndicator";
import { MarkdownMessage } from "@/components/MarkdownMessage";

// Chat message types
interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system' | 'error' | 'progress';
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
    
    if (!url && !existingProjectId) {
      setIsLoading(false);
      addChatMessage('Welcome! Enter a URL above to start cloning a website, or chat with me to build something new.', 'system');
      return;
    }

    if (existingProjectId) {
      setProjectId(existingProjectId);
      loadProject(existingProjectId);
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

  const createSandbox = async (fromGeneration = false) => {
    if (sandboxCreationRef.current) {
      console.log('[createSandbox] Already in progress, skipping...');
      return null;
    }
    
    sandboxCreationRef.current = true;
    
    if (!fromGeneration) {
      addChatMessage('Creating sandbox environment...', 'progress', <Wrench className="w-4 h-4" />);
    }
    
    try {
      const response = await fetch('/api/create-sandbox', { method: 'POST' });
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
    if (!url.trim()) return;

    setIsLoading(true);

    // Clear chat and add single static message
    setChatHistory([]);
    const cleanUrl = url.replace(/^https?:\/\//i, '');
    addChatMessage(`Cloning ${cleanUrl}...`, 'system');

    // Start creating sandbox and capturing screenshot in parallel
    // Always create sandbox to ensure provider is registered
    const sandboxPromise = createSandbox(true);
    captureUrlScreenshot(url, true);

    try {
      // Wait for sandbox
      const sandboxData = await sandboxPromise;
      await streamScrapeAndGenerate(url, model, sandboxData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate website');
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
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage;
    addChatMessage(userMsg, 'user');
    setChatMessage("");
    setIsGenerating(true);

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
          toast.success("Code updated and applied!");

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

            // Save all files (new and existing) to the project
            if (projectId && files.length > 0) {
              saveProjectFiles(files);
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
          toast.error("Failed to apply code - sandbox may have timed out");
          setSandboxHealthy(false);
        }
      }

    } catch (error) {
      toast.error("Failed to process chat message");
    } finally {
      setIsGenerating(false);
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
      toast.success("Project downloaded!");
    } catch (error) {
      toast.error("Failed to download project");
    }
  };

  const restart = () => {
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
            <Button size="sm" variant="outline" onClick={downloadCode} disabled={isLoading || parsedFiles.length === 0} className="dark:border-[#f5f3ef]/20 dark:text-[#f5f3ef] dark:hover:bg-[#f5f3ef]/10">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className="w-80 border-r border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 bg-[#faf9f7] dark:bg-[#252525] flex flex-col transition-colors duration-300">
          {/* URL Input */}
          <div className="p-6 border-b border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10">
            <p className="text-xs font-medium text-[#8b7355] uppercase tracking-wider mb-3">Clone Website</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#1a1a1a] border border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 rounded-sm flex-1">
                <Globe className="w-4 h-4 text-[#9b9b9b] dark:text-[#b8b0a8]" />
                <input
                  type="text"
                  placeholder="example.com"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && startGeneration(targetUrl, selectedModel)}
                  className="flex-1 bg-transparent text-sm outline-none text-[#1a1a1a] dark:text-[#f5f3ef] placeholder:text-[#9b9b9b] dark:placeholder:text-[#6b6b6b]"
                />
              </div>
              <Button 
                size="sm" 
                onClick={() => startGeneration(targetUrl, selectedModel)}
                disabled={!targetUrl.trim() || isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Project Info */}
          <div className="p-6 border-b border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10">
            <p className="text-xs font-medium text-[#8b7355] uppercase tracking-wider mb-2">Project</p>
            <p className="text-sm font-medium truncate dark:text-[#f5f3ef]">{targetUrl || 'New Project'}</p>
          </div>

          {/* Status */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div>
              <p className="text-xs font-medium text-[#8b7355] uppercase tracking-wider mb-3">Status</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm dark:text-[#b8b0a8]">
                  <div className={`w-2 h-2 rounded-full ${sandboxHealthy ? 'bg-green-500' : isLoading ? 'bg-amber-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  <span>Sandbox {sandboxHealthy ? 'Ready' : isLoading ? 'Creating...' : 'Not started'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm dark:text-[#b8b0a8]">
                  <div className={`w-2 h-2 rounded-full ${parsedFiles.length > 0 ? 'bg-green-500' : isGenerating ? 'bg-amber-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  <span>Code {parsedFiles.length > 0 ? `${parsedFiles.length} files` : isGenerating ? 'Generating...' : 'Not generated'}</span>
                </div>
              </div>
            </div>

            {parsedFiles.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[#8b7355] uppercase tracking-wider mb-3">Files</p>
                <div className="space-y-1">
                  {parsedFiles.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => { setSelectedFile(file.path); setActiveTab('code'); }}
                      className={`w-full text-left px-2 py-1.5 text-xs rounded transition-colors ${
                        selectedFile === file.path ? 'bg-[#1a1a1a] dark:bg-[#f5f3ef] text-[#f5f3ef] dark:text-[#1a1a1a]' : 'hover:bg-[#1a1a1a]/5 dark:hover:bg-[#f5f3ef]/10 dark:text-[#b8b0a8]'
                      }`}
                    >
                      {file.path.split('/').pop()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <AsciiAnimation color="#8b7355" />
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 space-y-3">
            <Button variant="outline" className="w-full dark:border-[#f5f3ef]/20 dark:text-[#f5f3ef] dark:hover:bg-[#f5f3ef]/10" onClick={restart}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Start New Project
            </Button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col bg-[#f5f3ef] dark:bg-[#1a1a1a] transition-colors duration-300">
          {/* Tabs */}
          <div className="border-b border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 bg-[#faf9f7] dark:bg-[#252525] transition-colors duration-300">
            <div className="flex">
              <button
                onClick={() => setActiveTab("chat")}
                className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === "chat"
                    ? "border-[#1a1a1a] dark:border-[#f5f3ef] text-[#1a1a1a] dark:text-[#f5f3ef]"
                    : "border-transparent text-[#6b6b6b] dark:text-[#b8b0a8] hover:text-[#1a1a1a] dark:hover:text-[#f5f3ef]"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Chat
                {chatHistory.length > 0 && (
                  <Badge variant="solid" size="sm" className="ml-1 dark:bg-[#f5f3ef] dark:text-[#1a1a1a]">
                    {chatHistory.length}
                  </Badge>
                )}
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === "preview"
                    ? "border-[#1a1a1a] dark:border-[#f5f3ef] text-[#1a1a1a] dark:text-[#f5f3ef]"
                    : "border-transparent text-[#6b6b6b] dark:text-[#b8b0a8] hover:text-[#1a1a1a] dark:hover:text-[#f5f3ef]"
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === "code"
                    ? "border-[#1a1a1a] dark:border-[#f5f3ef] text-[#1a1a1a] dark:text-[#f5f3ef]"
                    : "border-transparent text-[#6b6b6b] dark:text-[#b8b0a8] hover:text-[#1a1a1a] dark:hover:text-[#f5f3ef]"
                }`}
              >
                <Code className="w-4 h-4" />
                Code
                {generationProgress.isStreaming && (
                  <Badge
                    variant="solid"
                    size="sm"
                    className="ml-1 bg-amber-500 text-white animate-pulse inline-flex items-center"
                  >
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Streaming
                  </Badge>
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {/* Chat Tab */}
            {activeTab === "chat" && (
              <div className="h-full flex flex-col bg-[#f5f3ef] dark:bg-[#1a1a1a] transition-colors duration-300 relative">
                {/* Screenshot Background */}
                {urlScreenshot && (
                  <motion.img
                    src={urlScreenshot}
                    alt="Website preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.2 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 relative z-10 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
                  <AnimatePresence mode="popLayout">
                    {chatHistory.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center text-[#6b6b6b] dark:text-[#b8b0a8] py-16"
                      >
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                          className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#8b7355]/20 to-[#8b7355]/5 rounded-2xl flex items-center justify-center"
                        >
                          <MessageSquare className="w-10 h-10 text-[#8b7355]" />
                        </motion.div>
                        <p className="text-lg font-medium text-[#1a1a1a] dark:text-[#f5f3ef] mb-2">Ready to build</p>
                        <p className="text-sm max-w-xs mx-auto">Enter a URL above or type a message to start creating something amazing together.</p>
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
                              className={`max-w-[85%] relative transition-opacity duration-200 hover:opacity-90 ${
                                msg.type === 'user'
                                  ? 'bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] dark:from-[#f5f3ef] dark:to-[#e5e2dd] text-[#f5f3ef] dark:text-[#1a1a1a] shadow-lg shadow-black/10'
                                  : msg.type === 'error'
                                  ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800/30'
                                  : msg.type === 'progress'
                                  ? 'bg-[#8b7355] dark:bg-[#8b7355] text-white dark:text-white border border-[#8b7355] dark:border-[#8b7355]'
                                  : 'bg-white/95 dark:bg-[#252525]/95 text-[#1a1a1a] dark:text-[#f5f3ef] border border-[#e8e6e3] dark:border-[#f5f3ef]/10 shadow-sm backdrop-blur-sm'
                              } rounded-2xl px-5 py-4`}
                            >
                              {/* Icon for messages */}
                              {msg.icon && (
                                <div className="flex items-center gap-2 mb-2">
                                  {msg.icon}
                                </div>
                              )}
                              
                              {/* Progress indicator icon */}
                              {msg.type === 'progress' && (
                                <div className="flex items-center gap-2 mb-2">
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-4 h-4"
                                  >
                                    <Sparkles className="w-3 h-3 text-white" />
                                  </motion.div>
                                  <span className="text-xs font-medium uppercase tracking-wider text-white">Working</span>
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

                {/* Chat Input */}
                <motion.div
                  className="p-5 pt-2 border-t border-[#e8e6e3] dark:border-[#f5f3ef]/10 bg-[#f5f3ef] dark:bg-[#1a1a1a]"
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
              <div ref={codeContainerRef} className="h-full overflow-auto p-6">
                {selectedFile && parsedFiles.find(f => f.path === selectedFile) ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-medium text-[#8b7355]">{selectedFile}</p>
                      <Badge variant="outline" className="text-xs">
                        {(parsedFiles.find(f => f.path === selectedFile)?.content.length || 0).toLocaleString()} chars
                      </Badge>
                    </div>
                    <pre className="font-mono text-sm bg-[#1a1a1a] text-[#f5f3ef] p-6 rounded-sm whitespace-pre-wrap break-words">
                      <code>{parsedFiles.find(f => f.path === selectedFile)?.content || ""}</code>
                    </pre>
                  </div>
                ) : generationProgress.isStreaming && generationProgress.streamedCode ? (
                  <div>
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
                      <p>Select a file from the sidebar to view its contents</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
