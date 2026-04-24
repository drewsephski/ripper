"use client";

import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Badge } from "@/components/retroui/Badge";
import { Dialog } from "@/components/retroui/Dialog";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Folder, Clock, ArrowRight, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { AnimatedThemeToggler } from "@/components/AnimatedThemeToggler";
import { Logo } from "@/components/Logo";
import { motion } from "framer-motion";

interface Project {
  id: string;
  name: string;
  targetUrl: string;
  status: "generating" | "ready" | "error";
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  
  // === AUTH STATE (useSession hook provides reactive session state) ===
  const { data: session, isPending: isAuthPending, error: authError } = useSession();
  const [authChecked, setAuthChecked] = useState(false);
  
  // === PROJECT STATE ===
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // === DELETE MODAL STATE ===
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle auth state changes
  useEffect(() => {
    console.log("[Projects] Auth state:", { isAuthPending, hasSession: !!session, authError: authError?.message });
    
    // Wait for session check to complete
    if (isAuthPending) {
      console.log("[Projects] Waiting for auth check...");
      return;
    }
    
    // Mark auth as checked
    if (!authChecked) {
      setAuthChecked(true);
    }

    // Handle auth error
    if (authError) {
      console.error("[Projects] Auth error:", authError);
      toast.error("Authentication error. Please sign in again.");
      router.push('/');
      return;
    }

    // Redirect if not authenticated
    if (!session) {
      console.log("[Projects] No session found, redirecting to /");
      router.push('/');
      return;
    }

    console.log("[Projects] User authenticated:", session.user?.email);
  }, [isAuthPending, session, authError, authChecked, router]);

  // Fetch projects after auth is confirmed
  useEffect(() => {
    // Only proceed if auth check is done and user is authenticated
    if (!authChecked || !session) {
      return;
    }

    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects', {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        const formattedProjects = data.projects.map((p: any) => ({
          id: p.id,
          name: p.name,
          targetUrl: p.sourceUrl || '',
          status: p.status as "generating" | "ready" | "error",
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }));
        setProjects(formattedProjects);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [authChecked, session]);

  const openDeleteModal = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
    setIsDeleting(false);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${projectToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
      toast.success("Project deleted");
      closeDeleteModal();
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
      setIsDeleting(false);
    }
  };

  const handleOpenProject = (id: string) => {
    // Navigate to builder with project ID and flag to start sandbox
    router.push(`/builder?projectId=${id}&startSandbox=true`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    }
    if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    }
    return "Just now";
  };

  // Show loading state while checking auth
  if (isAuthPending || !authChecked) {
    return (
      <div className="min-h-screen bg-[#f5f3ef] dark:bg-[#1a1a1a] text-[#1a1a1a] dark:text-[#f5f3ef] flex items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#1a1a1a] dark:border-[#f5f3ef] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#6b6b6b] dark:text-[#b8b0a8]">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If no session after auth check, show redirecting state briefly
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

  return (
    <main className="min-h-screen bg-[#f5f3ef] dark:bg-[#1a1a1a] text-[#1a1a1a] dark:text-[#f5f3ef] transition-colors duration-300">
      {/* Header */}
      <nav className="border-b border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 bg-white/50 dark:bg-[#1a1a1a]/50 backdrop-blur-sm sticky top-0 z-10 transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-6 lg:px-8 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <AnimatedThemeToggler variant="circle" duration={500} />
            <Button size="sm" variant="ghost" onClick={() => router.push("/")} className="dark:text-[#b8b0a8] dark:hover:text-[#f5f3ef]">
              New Project
            </Button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="font-display font-medium text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em] mb-4 dark:text-[#f5f3ef]">
            Your Projects
          </h1>
          <p className="font-body text-lg text-[#6b6b6b] dark:text-[#b8b0a8] max-w-2xl">
            Manage and iterate on your AI-generated applications. Open projects to continue editing or download the code.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-2 border-[#8b7355] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <Card className="bg-white dark:bg-[#252525] border-2 border-dashed border-[#1a1a1a]/20 dark:border-[#f5f3ef]/20 p-12 text-center transition-colors duration-300">
            <Folder className="w-12 h-12 text-[#9b9b9b] dark:text-[#b8b0a8] mx-auto mb-4" />
            <h3 className="font-display font-medium text-xl mb-2 dark:text-[#f5f3ef]">No projects yet</h3>
            <p className="text-[#6b6b6b] dark:text-[#b8b0a8] mb-6 max-w-md mx-auto">
              Start by pasting a URL to generate your first AI-powered application.
            </p>
            <Button size="lg" onClick={() => router.push("/")}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Project
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="bg-white dark:bg-[#252525] border border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 hover:border-[#8b7355]/30 dark:hover:border-[#8b7355]/50 transition-all cursor-pointer group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-display font-medium text-lg mb-1 group-hover:text-[#8b7355] transition-colors dark:text-[#f5f3ef]">
                        {project.name}
                      </h3>
                      <p className="text-sm text-[#9b9b9b] dark:text-[#b8b0a8] truncate">{project.targetUrl}</p>
                    </div>
                    <Badge
                      variant={
                        project.status === "ready"
                          ? "default"
                          : project.status === "generating"
                          ? "outline"
                          : "solid"
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#6b6b6b] dark:text-[#b8b0a8] mb-6">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Updated {formatDate(project.updatedAt)}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenProject(project.id)}
                    >
                      Open
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(project);
                      }}
                      className="dark:text-[#b8b0a8] dark:hover:text-[#f5f3ef]"
                    >
                      <Trash2 className="w-4 h-4 text-[#6b6b6b] dark:text-[#b8b0a8]" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {/* New project card */}
            <Card
              className="bg-[#f5f3ef] dark:bg-[#252525] border-2 border-dashed border-[#1a1a1a]/20 dark:border-[#f5f3ef]/20 hover:border-[#8b7355]/40 transition-all cursor-pointer flex items-center justify-center min-h-[200px]"
              onClick={() => router.push("/")}
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#8b7355]/10 flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-6 h-6 text-[#8b7355]" />
                </div>
                <p className="font-medium text-[#1a1a1a] dark:text-[#f5f3ef]">New Project</p>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <Dialog.Content size="sm" className="bg-white dark:bg-[#252525] border-2 border-[#1a1a1a]/20 dark:border-[#f5f3ef]/20">
          <Dialog.Header className="border-b-2 border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 bg-transparent">
            <div className="flex items-center gap-2 text-[#1a1a1a] dark:text-[#f5f3ef]">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="font-medium">Delete Project</span>
            </div>
          </Dialog.Header>
          <div className="p-6">
            <p className="text-[#1a1a1a] dark:text-[#f5f3ef] mb-2">
              Are you sure you want to delete <strong className="font-medium">{projectToDelete?.name}</strong>?
            </p>
            <p className="text-sm text-[#6b6b6b] dark:text-[#b8b0a8]">
              This action cannot be undone. All project files and conversation history will be permanently removed.
            </p>
          </div>
          <Dialog.Footer className="border-t-2 border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 bg-transparent">
            <Button
              variant="ghost"
              onClick={closeDeleteModal}
              disabled={isDeleting}
              className="dark:text-[#b8b0a8] dark:hover:text-[#f5f3ef]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white border-none"
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </main>
  );
}
