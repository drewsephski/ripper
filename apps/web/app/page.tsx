"use client";

import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import { Dialog } from "@/components/retroui/Dialog";
import { Accordion } from "@/components/retroui/Accordion";
import { Tooltip } from "@/components/retroui/Tooltip";
import { Popover } from "@/components/retroui/Popover";
import { Switch } from "@/components/retroui/Switch";
import { Drawer } from "@/components/retroui/Drawer";
import { Card } from "@/components/retroui/Card";
import { Textarea } from "@/components/retroui/Textarea";
import { AsciiAnimation, Connector, CurvyCorner, GridPattern, DotPattern } from "@/components/effects";
import { SignUpDialog } from "@/components/auth/SignUpDialog";
import { AnimatedThemeToggler } from "@/components/AnimatedThemeToggler";
import { FontToggle } from "@/components/FontToggle";
import { Logo } from "@/components/Logo";
import { authClient, useSession, signOut } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Menu, Play, Zap, Shield, Globe, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

interface TechLogo {
  title: string;
  url: string;
}

// Direct SVG URLs from SVGL collection - with dark mode variants
const techLogosData: TechLogo[] = [
  { title: "React", url: "https://svgl.app/library/react_light.svg" },
  { title: "TypeScript", url: "https://svgl.app/library/typescript.svg" },
  { title: "Tailwind CSS", url: "https://svgl.app/library/tailwindcss.svg" },
  { title: "Firecrawl", url: "https://svgl.app/library/firecrawl.svg" },
  { title: "OpenRouter", url: "https://svgl.app/library/openrouter_dark.svg" },
  { title: "Better Auth", url: "https://svgl.app/library/better-auth_light.svg" },
  { title: "Headless UI", url: "https://svgl.app/library/headlessui.svg" },
  { title: "Bun", url: "https://svgl.app/library/bun.svg" },
];

// Footer logos data
const footerLogosData: TechLogo[] = [
  { title: "React", url: "https://svgl.app/library/react_light.svg" },
  { title: "Tailwind CSS", url: "https://svgl.app/library/tailwindcss.svg" },
  { title: "Radix UI", url: "https://svgl.app/library/radix-ui_light.svg" },
  { title: "Better Auth", url: "https://svgl.app/library/better-auth_light.svg" },
  { title: "TypeScript", url: "https://svgl.app/library/typescript.svg" },
  { title: "Prisma", url: "https://svgl.app/library/prisma.svg" },
  { title: "Bun", url: "https://svgl.app/library/bun.svg" }
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

const slideIn = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

function AnimatedCounter({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  
  return <span>{count.toLocaleString()}</span>;
}

export default function IndexPage() {
  const router = useRouter();
  
  // === AUTH STATE (useSession hook provides reactive session state) ===
  const { data: session, isPending: isAuthPending } = useSession();
  const [welcomeShown, setWelcomeShown] = useState(false);

  // === UI STATE ===
  const [demoDialogOpen, setDemoDialogOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [livePreviewEnabled, setLivePreviewEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [targetUrl, setTargetUrl] = useState("");
  const [selectedModel, setSelectedModel] = useState("openrouter/free");
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<"prompt" | "url">("prompt");

  // Show welcome toast when session is loaded and user is authenticated
  useEffect(() => {
    if (!isAuthPending && session?.user && !welcomeShown) {
      toast.success(`Welcome back, ${session.user.name || session.user.email}!`, {
        description: "Ready to build something amazing?",
        duration: 5000,
      });
      setWelcomeShown(true);
    }
  }, [isAuthPending, session, welcomeShown]);


  const handleStartBuilding = () => {
    // Store URL or prompt in sessionStorage and redirect immediately to builder
    if (prompt.trim()) {
      sessionStorage.setItem('buildPrompt', prompt);
      sessionStorage.setItem('selectedModel', selectedModel);
    } else if (targetUrl.trim()) {
      sessionStorage.setItem('targetUrl', targetUrl);
      sessionStorage.setItem('selectedModel', selectedModel);
    }
    router.push('/builder');
  };

  const handlePromptSubmit = () => {
    if (prompt.trim()) {
      sessionStorage.setItem('buildPrompt', prompt);
      sessionStorage.setItem('selectedModel', selectedModel);
      router.push('/builder');
    }
  };

  const handleQuickPrompt = (quickPrompt: string) => {
    sessionStorage.setItem('buildPrompt', quickPrompt);
    sessionStorage.setItem('selectedModel', selectedModel);
    router.push('/builder');
  };

  const handleAuthSuccess = () => {
    // Session will automatically update via useSession hook
    // Show welcome toast - session data will be available on next render
    if (session?.user) {
      toast.success(`Welcome, ${session.user.name || session.user.email}!`, {
        description: "Let's start building!",
        duration: 5000,
      });
    }
    
    // Store project context and redirect
    if (targetUrl.trim()) {
      sessionStorage.setItem('targetUrl', targetUrl);
      sessionStorage.setItem('selectedModel', selectedModel);
    }
    console.log("[Landing] Auth success - redirecting to /builder");
    router.push('/builder');
  };

  const handleTryItYourself = () => {
    // Redirect immediately to builder
    router.push('/builder');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileNavOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#f5f3ef] dark:bg-[#1a1a1a] text-[#1a1a1a] dark:text-[#f5f3ef] transition-colors duration-300">

      {/* ASCII Animation in corners */}
      <AsciiAnimation className="fixed top-8 left-8 z-10 text-[#1a1a1a] dark:text-[#f5f3ef]" />
      <AsciiAnimation className="fixed bottom-8 right-8 z-10 rotate-180 text-[#1a1a1a] dark:text-[#f5f3ef]" />

      {/* Navigation - refined with subtle glassmorphism and enhanced interactions */}
      <nav className="border-b border-[#1a1a1a]/8 dark:border-[#f5f3ef]/10 relative z-20 bg-[#f5f3ef]/70 dark:bg-[#1a1a1a]/70 backdrop-blur-md supports-[backdrop-filter]:bg-[#f5f3ef]/60 supports-[backdrop-filter]:dark:bg-[#1a1a1a]/60 transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-6 lg:px-8 py-5 flex items-center justify-between relative">
          <Connector className="-bottom-[11px] left-8" color="#e5e2dd" />

          <Logo onClick={() => scrollToSection('hero')} />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm font-normal text-[#6b6b6b] hover:text-[#8b7355] dark:text-[#b8b0a8] dark:hover:text-[#c9b896]"
                onClick={() => scrollToSection('features')}
              >
                How it works
              </Button>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm font-normal text-[#6b6b6b] hover:text-[#8b7355] dark:text-[#b8b0a8] dark:hover:text-[#c9b896]"
                onClick={() => router.push('/templates')}
              >
                Templates
              </Button>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm font-normal text-[#6b6b6b] hover:text-[#8b7355] dark:text-[#b8b0a8] dark:hover:text-[#c9b896]"
                onClick={() => router.push('/projects')}
              >
                Projects
              </Button>
            </motion.div>
          </div>

          {/* Theme & Font Toggles - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            <FontToggle />
            <AnimatedThemeToggler variant="circle" duration={500} />
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            {session?.user ? (
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  className="hidden sm:flex font-medium text-sm px-5 bg-[#8b7355] hover:bg-[#a08060] text-white transition-all duration-200 hover:shadow-lg hover:shadow-[#8b7355]/20"
                  onClick={handleStartBuilding}
                >
                  Start building
                </Button>
                <Popover>
                  <Popover.Trigger asChild>
                    <button className="w-8 h-8 rounded-full bg-[#8b7355] text-white flex items-center justify-center text-sm font-medium hover:bg-[#a08060] transition-colors">
                      {session.user.name?.charAt(0) || session.user.email?.charAt(0) || '?'}
                    </button>
                  </Popover.Trigger>
                  <Popover.Content className="w-48 bg-white dark:bg-[#1a1a1a] border border-[#1a1a1a]/10 dark:border-[#8b7355]/20" align="end">
                    <div className="space-y-1">
                      <p className="px-3 py-2 text-sm font-medium text-[#1a1a1a] dark:text-[#f5f3ef] border-b border-[#1a1a1a]/10 dark:border-[#8b7355]/20">
                        {session.user.name || session.user.email}
                      </p>
                      <button 
                        onClick={() => router.push('/projects')}
                        className="w-full text-left px-3 py-2 text-sm text-[#6b6b6b] dark:text-[#b8b0a8] hover:text-[#8b7355] dark:hover:text-[#c9b896] hover:bg-[#8b7355]/5 dark:hover:bg-[#8b7355]/10 rounded-sm transition-colors"
                      >
                        My Projects
                      </button>
                      <button 
                        onClick={async () => {
                          await signOut();
                          toast.success("Signed out successfully");
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-sm transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </Popover.Content>
                </Popover>
              </div>
            ) : (
              <Button size="sm" className="hidden sm:flex font-medium text-sm px-5" onClick={handleStartBuilding}>
                Let's Cook
              </Button>
            )}

            <Drawer open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <Drawer.Trigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden p-2 text-[#1a1a1a] dark:text-[#f5f3ef]">
                  <Menu className="w-5 h-5" />
                </Button>
              </Drawer.Trigger>
              <Drawer.Content className="bg-[#faf9f7] dark:bg-[#1a1a1a]">
                <Drawer.Header>
                  <Drawer.Title className="font-display text-[#1a1a1a] dark:text-[#f5f3ef]">Menu</Drawer.Title>
                  <Drawer.Description className="text-[#6b6b6b] dark:text-[#b8b0a8]">Navigate NovaFlow</Drawer.Description>
                </Drawer.Header>
                <div className="p-4 space-y-2">
                  <motion.button 
                    className="w-full text-left px-4 py-3 text-sm font-medium text-[#1a1a1a] dark:text-[#f5f3ef] hover:bg-[#8b7355]/5 dark:hover:bg-[#8b7355]/10 rounded-sm border-2 border-transparent hover:border-[#8b7355]/20 dark:hover:border-[#8b7355]/30 transition-all"
                    onClick={() => scrollToSection('features')}
                    whileTap={{ scale: 0.98 }}
                  >
                    How it works
                  </motion.button>
                  <motion.button 
                    className="w-full text-left px-4 py-3 text-sm font-medium text-[#1a1a1a] dark:text-[#f5f3ef] hover:bg-[#8b7355]/5 dark:hover:bg-[#8b7355]/10 rounded-sm border-2 border-transparent hover:border-[#8b7355]/20 dark:hover:border-[#8b7355]/30 transition-all"
                    onClick={() => { setMobileNavOpen(false); router.push('/projects'); }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Projects
                  </motion.button>
                  <motion.button
                    className="w-full text-left px-4 py-3 text-sm font-medium text-[#1a1a1a] dark:text-[#f5f3ef] hover:bg-[#8b7355]/5 dark:hover:bg-[#8b7355]/10 rounded-sm border-2 border-transparent hover:border-[#8b7355]/20 dark:hover:border-[#8b7355]/30 transition-all"
                    onClick={() => scrollToSection('faq')}
                    whileTap={{ scale: 0.98 }}
                  >
                    FAQ
                  </motion.button>
                  <div className="flex items-center justify-between px-4 py-3 border-t border-[#1a1a1a]/10 dark:border-[#8b7355]/20 mt-2">
                    <span className="text-sm font-medium text-[#1a1a1a] dark:text-[#f5f3ef]">Theme</span>
                    <AnimatedThemeToggler variant="circle" duration={500} />
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm font-medium text-[#1a1a1a] dark:text-[#f5f3ef]">Font</span>
                    <FontToggle showLabel />
                  </div>
                  <div className="pt-4 border-t border-[#1a1a1a]/10 dark:border-[#8b7355]/20 mt-4">
                    <Button className="w-full bg-[#8b7355] hover:bg-[#a08060] text-white border-[#8b7355]" onClick={() => setSignUpOpen(true)}>Start building</Button>
                  </div>
                </div>
                <Drawer.Footer>
                  <Drawer.Close asChild>
                    <Button variant="outline" className="w-full border-[#1a1a1a]/20 dark:border-[#8b7355]/30 text-[#1a1a1a] dark:text-[#f5f3ef] hover:bg-[#1a1a1a]/5 dark:hover:bg-[#8b7355]/10">Close</Button>
                  </Drawer.Close>
                </Drawer.Footer>
              </Drawer.Content>
            </Drawer>
          </div>
        </div>
      </nav>

      {/* Hero Section - asymmetric, editorial with sophisticated effects */}
      <section id="hero" className="pt-24 pb-32 lg:pt-32 lg:pb-40 relative transition-colors duration-300">
        {/* Layered background effects */}
        <GridPattern className="opacity-[0.18] dark:opacity-[0.1]" size={48} color="#8b7355" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#f5f3ef] dark:to-transparent pointer-events-none" />

        {/* Decorative ASCII - code generation flowing down */}
        <AsciiAnimation className="absolute top-32 left-6 hidden xl:block text-[#8b7355]" />
        <AsciiAnimation className="absolute bottom-32 right-8 hidden xl:block rotate-180 text-[#1a1a1a] dark:text-[#f5f3ef]" />
        
        <div className="mx-auto max-w-6xl px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-start">
            {/* Left column - main content */}
            <div className="lg:col-span-7 relative pb-8">
              
              <div className="relative">
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-sm font-medium text-[#8b7355] mb-6 tracking-wide uppercase"
                >
                  Ship faster. Build smarter.
                </motion.p>
                <div className="pb-2">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="font-display font-medium text-[clamp(2.75rem,6vw,4.5rem)] tracking-[-0.02em] mb-6"
                  >
                    Describe your landing page.{" "}
                    <span className="text-[#8b7355]">Watch it build in seconds.</span>
                  </motion.h1>
                </div>

                {/* Chat Interface with Tab Switcher - moved directly under hero text */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="relative mb-8"
                >

                  <Card className="bg-white dark:bg-[#252525] border-2 border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 shadow-lg relative z-10">
                    {/* Tab Switcher */}
                    <div className="flex border-b-2 border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10">
                      <button
                        onClick={() => setActiveTab("prompt")}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                          activeTab === "prompt"
                            ? "text-[#1a1a1a] dark:text-[#f5f3ef] bg-[#f5f3ef] dark:bg-[#1a1a1a]"
                            : "text-[#6b6b6b] dark:text-[#b8b0a8] hover:text-[#8b7355] hover:bg-[#f5f3ef]/50 dark:hover:bg-[#1a1a1a]/50"
                        }`}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <Zap className="w-4 h-4" />
                          Describe to build
                        </span>
                        {activeTab === "prompt" && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8b7355]"
                          />
                        )}
                      </button>
                      <button
                        onClick={() => setActiveTab("url")}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                          activeTab === "url"
                            ? "text-[#1a1a1a] dark:text-[#f5f3ef] bg-[#f5f3ef] dark:bg-[#1a1a1a]"
                            : "text-[#6b6b6b] dark:text-[#b8b0a8] hover:text-[#8b7355] hover:bg-[#f5f3ef]/50 dark:hover:bg-[#1a1a1a]/50"
                        }`}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <Globe className="w-4 h-4" />
                          Clone from URL
                        </span>
                        {activeTab === "url" && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8b7355]"
                          />
                        )}
                      </button>
                    </div>

                    <div className="p-4">
                      <AnimatePresence mode="wait">
                        {activeTab === "prompt" ? (
                          <motion.div
                            key="prompt"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                          >
                            <div className="flex items-center gap-2 text-sm text-[#6b6b6b] dark:text-[#b8b0a8]">
                              <div className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
                              <span>AI is ready to build</span>
                            </div>

                            <Textarea
                              value={prompt}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handlePromptSubmit();
                                }
                              }}
                              placeholder="I need a SaaS landing page with hero section, pricing cards, testimonials, and a CTA footer..."
                              className="min-h-[100px] resize-none border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 bg-transparent text-[#1a1a1a] dark:text-[#f5f3ef] placeholder:text-[#9b9b9b] focus:border-[#8b7355] focus:shadow-md transition-all"
                            />

                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-2">
                                {["SaaS landing page", "Portfolio site", "E-commerce store"].map((quickPrompt) => (
                                  <button
                                    key={quickPrompt}
                                    onClick={() => handleQuickPrompt(`Build me a ${quickPrompt} with modern design, responsive layout, and professional styling`)}
                                    className="text-xs px-3 py-1.5 bg-[#f5f3ef] dark:bg-[#1a1a1a] text-[#6b6b6b] dark:text-[#b8b0a8] border border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 rounded-sm hover:border-[#8b7355] hover:text-[#8b7355] transition-colors"
                                  >
                                    {quickPrompt}
                                  </button>
                                ))}
                              </div>

                              <Button size="sm" onClick={handlePromptSubmit} disabled={!prompt.trim()}>
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="url"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                          >
                            <div className="flex items-center gap-2 text-sm text-[#6b6b6b] dark:text-[#b8b0a8]">
                              <div className="w-2 h-2 rounded-full bg-[#8b7355] animate-pulse" />
                              <span>Firecrawl will scrape and rebuild</span>
                            </div>

                            <div className="flex items-center gap-3 px-4 py-3 bg-[#f5f3ef] dark:bg-[#1a1a1a] border-2 border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 rounded-sm focus-within:border-[#8b7355] transition-colors">
                              <span className="text-[#9b9b9b] dark:text-[#b8b0a8] text-sm">https://</span>
                              <input
                                type="text"
                                value={targetUrl}
                                onChange={(e) => setTargetUrl(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleStartBuilding()}
                                placeholder="example.com"
                                className="flex-1 bg-transparent text-sm outline-none text-[#1a1a1a] dark:text-[#f5f3ef]"
                              />
                              <Button size="sm" onClick={handleStartBuilding} disabled={!targetUrl.trim()}>
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                            </div>

                            <p className="text-xs text-[#6b6b6b] dark:text-[#b8b0a8]">
                              Paste any website URL and we'll clone its design, structure, and content as a React app.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Card>
                </motion.div>

                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="font-medium px-8" onClick={handleStartBuilding}>
                    Start building free
                  </Button>

                  <Dialog open={demoDialogOpen} onOpenChange={setDemoDialogOpen}>
                    <Dialog.Trigger asChild>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="outline" size="lg" className="font-medium px-8 border-[#1a1a1a]/20 dark:border-[#f5f3ef]/20 hover:bg-[#1a1a1a]/5 dark:hover:bg-[#f5f3ef]/10 dark:text-[#f5f3ef]">
                          <Play className="w-4 h-4 mr-2" />
                          See a demo
                        </Button>
                      </motion.div>
                    </Dialog.Trigger>
                    <Dialog.Content size="2xl" className="bg-[#1a1a1a] border-[#f5f3ef]/20 overflow-hidden">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                        className="relative"
                      >
                        {/* Animated background gradient */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-[#8b7355]/10 via-transparent to-[#8b7355]/5"
                          animate={{
                            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                          }}
                          transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          style={{ backgroundSize: "200% 200%" }}
                        />
                        
                        <Dialog.Header className="bg-[#252525] text-[#f5f3ef] border-b-2 border-[#f5f3ef]/10 relative">
                          <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                            className="flex items-center gap-2"
                          >
                            <motion.div
                              animate={{ 
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                              }}
                              transition={{ 
                                duration: 2, 
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              <Zap className="w-4 h-4 text-[#8b7355]" />
                            </motion.div>
                            <span className="font-display font-medium">Live Demo</span>
                            <motion.div
                              className="ml-2 px-2 py-0.5 bg-[#4ade80]/20 text-[#4ade80] text-xs rounded-full"
                              animate={{ opacity: [1, 0.5, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              LIVE
                            </motion.div>
                          </motion.div>
                        </Dialog.Header>
                        
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.15, duration: 0.5 }}
                          className="p-6 space-y-6 relative"
                        >
                          {/* Terminal with typing effect */}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                            className="bg-[#0a0a0a] rounded-sm p-4 font-mono text-xs space-y-2 border border-[#f5f3ef]/10 relative overflow-hidden"
                          >
                            {/* Scanline effect */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f5f3ef]/5 to-transparent"
                              animate={{ y: ["-100%", "100%"] }}
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />
                            
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                              className="flex items-center gap-2 text-[#4ade80]"
                            >
                              <motion.span
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              >→</motion.span>
                              <span className="text-[#b8b0a8]">Scraping https://stripe.com...</span>
                              <motion.div
                                className="w-2 h-2 bg-[#4ade80] rounded-full ml-auto"
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              />
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5 }}
                              className="flex items-center gap-2 text-[#4ade80]"
                            >
                              <motion.span
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                              >→</motion.span>
                              <span className="text-[#b8b0a8]">Analyzing layout & components</span>
                              <motion.div
                                className="w-2 h-2 bg-[#4ade80] rounded-full ml-auto"
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                              />
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.7 }}
                              className="flex items-center gap-2 text-[#4ade80]"
                            >
                              <motion.span
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                              >→</motion.span>
                              <span className="text-[#b8b0a8]">Generating React + Tailwind code</span>
                              <motion.div
                                className="w-2 h-2 bg-[#4ade80] rounded-full ml-auto"
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                              />
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.9 }}
                              className="flex items-center gap-2 text-[#f5f3ef]"
                            >
                              <motion.span
                                animate={{ 
                  textShadow: ["0 0 0px currentColor", "0 0 10px currentColor", "0 0 0px currentColor"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >✓</motion.span>
              <span>Preview ready at localhost:5173</span>
              <motion.div
                className="ml-auto px-2 py-0.5 bg-[#4ade80]/20 text-[#4ade80] text-xs rounded"
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                SUCCESS
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Stats with animated counters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="grid grid-cols-2 gap-4"
          >
            <motion.div 
              whileHover={{ scale: 1.03, y: -2 }} 
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative"
            >
              <motion.div
                className="absolute inset-0 bg-[#8b7355]/20 rounded-lg blur-lg opacity-0 hover:opacity-100 transition-opacity"
              />
              <Card className="bg-[#252525] border-[#f5f3ef]/10 p-4 relative overflow-hidden">
                <motion.div
                  className="absolute top-0 right-0 w-16 h-16 bg-[#8b7355]/10 rounded-full blur-2xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <p className="text-xs text-[#8b7355] uppercase tracking-wider mb-1">Time</p>
                <motion.p 
                  className="text-2xl font-display text-[#f5f3ef]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <AnimatedCounter end={42} duration={1500} />s
                </motion.p>
              </Card>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.03, y: -2 }} 
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative"
            >
              <motion.div
                className="absolute inset-0 bg-[#8b7355]/20 rounded-lg blur-lg opacity-0 hover:opacity-100 transition-opacity"
              />
              <Card className="bg-[#252525] border-[#f5f3ef]/10 p-4 relative overflow-hidden">
                <motion.div
                  className="absolute top-0 right-0 w-16 h-16 bg-[#8b7355]/10 rounded-full blur-2xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                />
                <p className="text-xs text-[#8b7355] uppercase tracking-wider mb-1">Files</p>
                <motion.p 
                  className="text-2xl font-display text-[#f5f3ef]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <AnimatedCounter end={12} duration={1500} />
                </motion.p>
              </Card>
            </motion.div>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="space-y-2"
          >
            <div className="flex justify-between text-xs text-[#b8b0a8]">
              <span>Progress</span>
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >Processing...</motion.span>
            </div>
            <div className="h-2 bg-[#0a0a0a] rounded-full overflow-hidden border border-[#f5f3ef]/10">
              <motion.div
                className="h-full bg-gradient-to-r from-[#8b7355] to-[#4ade80]"
                initial={{ width: 0 }}
                animate={{ width: ["0%", "45%", "75%", "100%"] }}
                transition={{ duration: 3, ease: [0.25, 0.1, 0.25, 1] }}
              />
            </div>
          </motion.div>
        </motion.div>
        
        <Dialog.Footer position="static" className="border-[#f5f3ef]/10 bg-[#252525] relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="flex gap-3"
          >
            <Button 
              variant="outline" 
              size="sm" 
              className="border-[#f5f3ef]/20 text-[#f5f3ef] hover:bg-[#f5f3ef]/10"
              onClick={() => setDemoDialogOpen(false)}
            >
              Close
            </Button>
            <Button 
              size="sm" 
              className="bg-[#f5f3ef] text-[#1a1a1a] hover:bg-[#f5f3ef]/90 relative overflow-hidden"
              onClick={handleTryItYourself}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              Try it yourself
            </Button>
          </motion.div>
        </Dialog.Footer>
      </motion.div>
    </Dialog.Content>
  </Dialog>

                </div>
              </div>
            </div>

            {/* Right column - workflow preview */}
            <div className="lg:col-span-5 lg:pt-16 relative">
              {/* Corner accents */}
              <CurvyCorner position="top-left" color="#e5e2dd" className="absolute top-13 -left-3" />
              <CurvyCorner position="top-right" color="#e5e2dd" className="absolute top-13 -right-3" />
              <CurvyCorner position="bottom-left" color="#e5e2dd" className="absolute -bottom-3 -left-3" />
              <CurvyCorner position="bottom-right" color="#e5e2dd" className="absolute -bottom-3 -right-3" />
              
              {/* Subtle dot pattern behind workflow */}
              <DotPattern className="opacity-40 -inset-4" size={20} color="#8b7355" />
              
              <div className="relative space-y-5 bg-[#faf9f7]/50 dark:bg-[#252525]/80 backdrop-blur-sm p-6 border border-[#1a1a1a]/5 dark:border-[#f5f3ef]/10 transition-colors duration-300">
                <div className="flex gap-4 items-start group">
                  <div className="w-8 h-8 bg-[#1a1a1a] dark:bg-[#f5f3ef] text-[#f5f3ef] dark:text-[#1a1a1a] flex items-center justify-center text-sm font-medium shrink-0 transition-transform group-hover:scale-105">1</div>
                  <div>
                    <p className="font-medium text-sm dark:text-[#f5f3ef]">Describe what you want</p>
                    <p className="text-sm text-[#6b6b6b] dark:text-[#b8b0a8] leading-relaxed">Type your vision—AI understands layout, components, and styling needs.</p>
                  </div>
                </div>
                
                {/* Connector between steps */}
                <div className="flex justify-center">
                  <Connector className="relative rotate-90" color="#e5e2dd" />
                </div>
                
                <div className="flex gap-4 items-start group">
                  <div className="w-8 h-8 bg-[#1a1a1a] dark:bg-[#f5f3ef] text-[#f5f3ef] dark:text-[#1a1a1a] flex items-center justify-center text-sm font-medium shrink-0 transition-transform group-hover:scale-105">2</div>
                  <div>
                    <p className="font-medium text-sm dark:text-[#f5f3ef]">AI generates code</p>
                    <p className="text-sm text-[#6b6b6b] dark:text-[#b8b0a8] leading-relaxed">Claude Sonnet analyzes the design and writes complete code.</p>
                  </div>
                </div>
                
                {/* Connector between steps */}
                <div className="flex justify-center">
                  <Connector className="relative rotate-90" color="#e5e2dd" />
                </div>
                
                <div className="flex gap-4 items-start group">
                  <div className="w-8 h-8 bg-[#1a1a1a] dark:bg-[#f5f3ef] text-[#f5f3ef] dark:text-[#1a1a1a] flex items-center justify-center text-sm font-medium shrink-0 transition-transform group-hover:scale-105">3</div>
                  <div>
                    <p className="font-medium text-sm dark:text-[#f5f3ef]">Live preview instantly</p>
                    <p className="text-sm text-[#6b6b6b] dark:text-[#b8b0a8] leading-relaxed">Isolated sandbox spins up with Vite. See changes stream in real-time.</p>
                  </div>
                </div>
                
                <div className="pt-5 mt-5 border-t border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10">
                  <p className="text-xs text-[#9b9b9b] dark:text-[#b8b0a8] uppercase tracking-wider mb-4">Built with</p>
                  <div className="flex flex-wrap gap-3 items-center">
                    {techLogosData.slice(0, 4).map((logo) => (
                      <img
                        key={logo.title}
                        src={logo.url}
                        alt={logo.title}
                        className="h-5 w-auto opacity-70 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                        loading="lazy"
                      />
                    ))}
                  </div>
                </div>

                {/* Description text at bottom right */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="font-body text-sm text-[#6b6b6b] dark:text-[#b8b0a8] leading-relaxed pt-4 border-t border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10"
                >
                  Describe what you need or paste a URL. AI generates production-ready React + Tailwind code with live preview and instant iterations.
                </motion.p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - actual platform capabilities */}
      <section id="features" className="py-24 lg:py-32 bg-[#1a1a1a] text-[#f5f3ef] relative overflow-hidden">
        {/* Symmetrical ASCII animations on sides */}
        <AsciiAnimation className="absolute top-16 left-6 hidden xl:block" color="#8b7355" />
        <AsciiAnimation className="absolute bottom-16 right-6 hidden xl:block rotate-180" color="#8b7355" />
        
        {/* Subtle grid pattern overlay */}
        <GridPattern className="opacity-5" size={60} color="#f5f3ef" />
        
        <div className="mx-auto max-w-6xl px-6 lg:px-8 relative">
          {/* Section header - left aligned */}
          <div className="max-w-2xl mb-16 lg:mb-24 relative">
            <Connector className="absolute -left-8 top-0 hidden lg:block" color="#3a3a3a" />
            <p className="text-sm font-medium text-[#8b7355] mb-4 tracking-wide uppercase">Platform</p>
            <h2 className="font-display font-medium text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em] mb-6">
              From URL to deployed app in minutes.
            </h2>
            <p className="font-body text-lg text-[#b8b0a8] leading-relaxed">
              NovaFlow combines intelligent scraping, AI code generation, and live sandboxes into one seamless workflow.
            </p>
          </div>

          {/* Bento grid - editorial asymmetry with varied compositions */}
          <div className="grid md:grid-cols-12 gap-3 lg:gap-4">
            {/* Hero card - spans 8 cols, 2 rows */}
            <div className="md:col-span-8 md:row-span-2 bg-[#252525] p-10 lg:p-14 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#8b7355]/5 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <p className="text-xs font-medium text-[#8b7355] uppercase tracking-widest mb-3">Core</p>
                    <h3 className="font-display font-medium text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.1] tracking-tight">
                      Deep site scraping
                    </h3>
                  </div>
                  <div className="hidden sm:block">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-[#8b7355]/30">
                      <path d="M24 4L4 14v20l20 10 20-10V14L24 4z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M24 4v40M4 14l20 10 20-10" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </div>
                </div>
                <p className="font-body text-[#b8b0a8] leading-relaxed max-w-lg mb-8 text-base">
                  Firecrawl extracts content, structure, metadata, and screenshots. JavaScript-rendered pages, SPAs, complex layouts—handled automatically.
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[#f5f3ef]">Try with any URL</span>
                  <div className="w-8 h-px bg-[#8b7355]/50" />
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#8b7355]">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Tall card - spans 4 cols, 2 rows */}
            <div className="md:col-span-4 md:row-span-2 bg-[#2a2a2a] p-8 lg:p-10 relative overflow-hidden flex flex-col">
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#8b7355]/10 to-transparent" />
              <div className="relative z-10 flex-1">
                <p className="text-xs font-medium text-[#8b7355] uppercase tracking-widest mb-4">Runtime</p>
                <h3 className="font-display font-medium text-2xl mb-4">Live sandbox</h3>
                <p className="font-body text-sm text-[#b8b0a8] leading-relaxed mb-8">
                  Every app runs in an isolated E2B environment. Vite dev server, hot reload, full npm support.
                </p>
              </div>
              <div className="relative z-10 pt-6 border-t border-[#f5f3ef]/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[#4ade80]" />
                  <span className="text-xs font-mono text-[#4ade80]">localhost:5173</span>
                </div>
                <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-[#4ade80] animate-pulse" />
                </div>
              </div>
            </div>

            {/* Wide card - spans 6 cols */}
            <div className="md:col-span-6 bg-[#2a2a2a] p-8 lg:p-10 relative overflow-hidden">
              <div className="absolute top-4 right-4 font-mono text-[8b7355]/20 text-6xl font-bold">01</div>
              <div className="relative z-10">
                <p className="text-xs font-medium text-[#8b7355] uppercase tracking-widest mb-3">Integration</p>
                <h3 className="font-display font-medium text-xl mb-3">Claude Sonnet</h3>
                <p className="font-body text-sm text-[#b8b0a8] leading-relaxed mb-6">
                  Generates React 18 + Tailwind code with streaming responses, smart file parsing, automatic package detection.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['React 18', 'Tailwind', 'Streaming'].map((label, i) => (
                    <span key={i} className="px-3 py-1.5 bg-[#1a1a1a] text-xs font-medium text-[#b8b0a8] border border-[#f5f3ef]/10">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Wide card - spans 6 cols */}
            <div className="md:col-span-6 bg-[#252525] p-8 lg:p-10 relative overflow-hidden">
              <div className="absolute top-4 right-4 font-mono text-[#8b7355]/20 text-6xl font-bold">02</div>
              <div className="relative z-10">
                <p className="text-xs font-medium text-[#8b7355] uppercase tracking-widest mb-3">Deployment</p>
                <h3 className="font-display font-medium text-xl mb-3">One-click export</h3>
                <p className="font-body text-sm text-[#b8b0a8] leading-relaxed mb-6">
                  Push to GitHub, download as ZIP, or copy individual files. Your code, your control.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-[#1a1a1a]/50 rounded-sm">
                    <p className="text-2xl font-display text-[#f5f3ef] mb-1">ZIP</p>
                    <p className="text-[10px] text-[#b8b0a8] uppercase">Download</p>
                  </div>
                  <div className="text-center p-3 bg-[#1a1a1a]/50 rounded-sm">
                    <p className="text-2xl font-display text-[#f5f3ef] mb-1">GH</p>
                    <p className="text-[10px] text-[#b8b0a8] uppercase">Push</p>
                  </div>
                  <div className="text-center p-3 bg-[#1a1a1a]/50 rounded-sm">
                    <p className="text-2xl font-display text-[#f5f3ef] mb-1">CP</p>
                    <p className="text-[10px] text-[#b8b0a8] uppercase">Copy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech stack section */}
      <section className="py-16 border-y border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <p className="text-center text-xs text-[#9b9b9b] dark:text-[#b8b0a8] uppercase tracking-wider mb-8">
            Technologies we use
          </p>
          <div className="flex flex-wrap justify-center gap-4 lg:gap-6 items-center">
            <Tooltip.Provider delayDuration={100}>
              {techLogosData.map((logo) => (
                <Tooltip key={logo.title}>
                  <Tooltip.Trigger asChild>
                    <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-[#8b7355]/10 dark:bg-[#8b7355]/20 hover:bg-[#8b7355]/20 dark:hover:bg-[#8b7355]/30 transition-colors duration-300 cursor-pointer">
                      <img
                        src={logo.url}
                        alt={logo.title}
                        className="h-6 w-auto"
                        loading="lazy"
                      />
                    </div>
                  </Tooltip.Trigger>
                  <Tooltip.Content variant="solid">
                    <p className="font-body text-xs">{logo.title}</p>
                  </Tooltip.Content>
                </Tooltip>
              ))}
            </Tooltip.Provider>
          </div>
        </div>
      </section>

      {/* Use cases section */}
      <section className="py-24 lg:py-32 relative overflow-hidden transition-colors duration-300">
        {/* Prominent grid pattern background */}
        <GridPattern className="opacity-[0.08] dark:opacity-[0.05]" size={40} color="#8b7355" />

        {/* Symmetrical corner accents */}
        <CurvyCorner position="top-left" color="#e5e2dd" className="absolute top-8 left-8 dark:hidden" />
        <CurvyCorner position="bottom-right" color="#e5e2dd" className="absolute bottom-8 right-8 dark:hidden" />
        
        <div className="mx-auto max-w-6xl px-6 lg:px-8 relative">
          <div className="mb-16">
            <p className="text-sm font-medium text-[#8b7355] mb-4 tracking-wide uppercase">Use cases</p>
            <h2 className="font-display font-medium text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em] dark:text-[#f5f3ef]">
              What will you build?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Clone any site', desc: 'Recreate landing pages, dashboards, or components for learning.' },
              { title: 'Rapid prototyping', desc: 'Go from idea to interactive prototype in minutes, not days.' },
              { title: 'Design handoff', desc: 'Convert Figma or reference sites to working code instantly.' },
              { title: 'Code generation', desc: 'Let AI handle boilerplate while you focus on logic.' }
            ].map((use, i) => (
              <div key={i} className="p-6 border border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 hover:border-[#1a1a1a]/30 dark:hover:border-[#f5f3ef]/30 transition-colors dark:bg-[#252525]/50">
                <h3 className="font-display font-medium text-lg mb-2 dark:text-[#f5f3ef]">{use.title}</h3>
                <p className="text-sm text-[#6b6b6b] dark:text-[#b8b0a8] leading-relaxed">{use.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section with Accordion */}
      <section id="faq" className="py-24 lg:py-32 bg-[#faf9f7] dark:bg-[#1a1a1a] transition-colors duration-300">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-[#8b7355] mb-4 tracking-wide uppercase">FAQ</p>
            <h2 className="font-display font-medium text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em] dark:text-[#f5f3ef]">
              Common questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            <Accordion.Item value="item-1" className="border border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 overflow-hidden dark:bg-[#252525]">
              <Accordion.Header className="bg-white dark:bg-[#252525] hover:bg-[#f5f3ef] dark:hover:bg-[#2a2a2a] transition-colors duration-300 px-6 py-4">
                <span className="font-display font-medium text-sm dark:text-[#f5f3ef]">How does the AI code generation work?</span>
              </Accordion.Header>
              <Accordion.Content className="dark:bg-[#1a1a1a]">
                <div className="px-6 py-4 border-t border-[#1a1a1a]/5 dark:border-[#f5f3ef]/5">
                  <p className="text-sm text-[#6b6b6b] dark:text-[#b8b0a8] leading-relaxed">
                    Our system uses the most advanced models available to analyze scraped website content, identify design patterns,
                    and generate clean React + Tailwind code. The AI understands component structures,
                    styling systems, and generates production-ready code with proper file organization.
                  </p>
                </div>
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="item-2" className="border border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 overflow-hidden dark:bg-[#252525]">
              <Accordion.Header className="bg-white dark:bg-[#252525] hover:bg-[#f5f3ef] dark:hover:bg-[#2a2a2a] transition-colors duration-300 px-6 py-4">
                <span className="font-display font-medium text-sm dark:text-[#f5f3ef]">Can I export the generated code?</span>
              </Accordion.Header>
              <Accordion.Content className="dark:bg-[#1a1a1a]">
                <div className="px-6 py-4 border-t border-[#1a1a1a]/5 dark:border-[#f5f3ef]/5">
                  <p className="text-sm text-[#6b6b6b] dark:text-[#b8b0a8] leading-relaxed">
                    Yes! Pro and Team plans include GitHub export functionality. You can push generated
                    code directly to a repository, download as a ZIP file, or copy individual files.
                    All code is yours to keep and modify.
                  </p>
                </div>
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="item-3" className="border border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 overflow-hidden dark:bg-[#252525]">
              <Accordion.Header className="bg-white dark:bg-[#252525] hover:bg-[#f5f3ef] dark:hover:bg-[#2a2a2a] transition-colors duration-300 px-6 py-4">
                <span className="font-display font-medium text-sm dark:text-[#f5f3ef]">What websites work best with NovaFlow?</span>
              </Accordion.Header>
              <Accordion.Content className="dark:bg-[#1a1a1a]">
                <div className="px-6 py-4 border-t border-[#1a1a1a]/5 dark:border-[#f5f3ef]/5">
                  <p className="text-sm text-[#6b6b6b] dark:text-[#b8b0a8] leading-relaxed">
                    NovaFlow works with any public website. It excels with landing pages, marketing sites,
                    dashboards, and component libraries. JavaScript-rendered SPAs, complex animations,
                    and sites with heavy interactivity may require additional manual refinement.
                  </p>
                </div>
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="item-4" className="border border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 overflow-hidden dark:bg-[#252525]">
              <Accordion.Header className="bg-white dark:bg-[#252525] hover:bg-[#f5f3ef] dark:hover:bg-[#2a2a2a] transition-colors duration-300 px-6 py-4">
                <span className="font-display font-medium text-sm dark:text-[#f5f3ef]">Is there a limit on how many apps I can create?</span>
              </Accordion.Header>
              <Accordion.Content className="dark:bg-[#1a1a1a]">
                <div className="px-6 py-4 border-t border-[#1a1a1a]/5 dark:border-[#f5f3ef]/5">
                  <p className="text-sm text-[#6b6b6b] dark:text-[#b8b0a8] leading-relaxed">
                    Starter plan includes 10 apps per month. Pro and Team plans offer unlimited app generation.
                    Each app can be edited, previewed, and exported as many times as you need.
                  </p>
                </div>
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="item-5" className="border border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 overflow-hidden dark:bg-[#252525]">
              <Accordion.Header className="bg-white dark:bg-[#252525] hover:bg-[#f5f3ef] dark:hover:bg-[#2a2a2a] transition-colors duration-300 px-6 py-4">
                <span className="font-display font-medium text-sm dark:text-[#f5f3ef]">Do I need coding experience to use NovaFlow?</span>
              </Accordion.Header>
              <Accordion.Content className="dark:bg-[#1a1a1a]">
                <div className="px-6 py-4 border-t border-[#1a1a1a]/5 dark:border-[#f5f3ef]/5">
                  <p className="text-sm text-[#6b6b6b] dark:text-[#b8b0a8] leading-relaxed">
                    No coding experience required to generate apps. However, basic knowledge of React
                    and Tailwind CSS will help you iterate on generated code using natural language prompts.
                    We provide helpful tutorials to get you started.
                  </p>
                </div>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </div>
      </section>

      {/* Pricing Section - builder-focused */}
      <section id="pricing" className="py-24 lg:py-32 bg-white dark:bg-[#1a1a1a] relative overflow-hidden transition-colors duration-300">
        {/* Dot pattern for texture */}
        <DotPattern className="opacity-30 dark:opacity-20" size={24} color="#8b7355" />

        {/* Symmetrical ASCII accents */}
        <AsciiAnimation className="absolute top-12 right-8 hidden lg:block text-[#1a1a1a] dark:text-[#f5f3ef]" />
        <AsciiAnimation className="absolute bottom-12 left-8 hidden lg:block rotate-180 text-[#1a1a1a] dark:text-[#f5f3ef]" />
        
        <div className="mx-auto max-w-6xl px-6 lg:px-8 relative">
          <div className="mb-16 relative">
            <Connector className="absolute -left-4 top-1/2 -translate-y-1/2 hidden lg:block" color="#e5e2dd" />
            <p className="text-sm font-medium text-[#8b7355] mb-4 tracking-wide uppercase">Pricing</p>
            <h2 className="font-display font-medium text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em] dark:text-[#f5f3ef]">
              Start free. Scale as you build.
            </h2>
          </div>

          {/* Horizontal pricing table */}
          <div className="border-t border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10">
            {/* Starter */}
            <div className="grid lg:grid-cols-12 gap-6 py-8 border-b border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 items-center">
              <div className="lg:col-span-3">
                <h3 className="font-display font-medium text-xl dark:text-[#f5f3ef]">Starter</h3>
                <p className="text-sm text-[#6b6b6b] dark:text-[#b8b0a8] mt-1">For exploration</p>
              </div>
              <div className="lg:col-span-4">
                <ul className="text-sm text-[#6b6b6b] dark:text-[#b8b0a8] space-y-1">
                  <li>10 apps per month</li>
                  <li>Firecrawl scraping</li>
                  <li>Basic sandboxes</li>
                </ul>
              </div>
              <div className="lg:col-span-3">
                <span className="font-display text-3xl font-medium dark:text-[#f5f3ef]">Free</span>
              </div>
              <div className="lg:col-span-2 lg:text-right">
                <Button variant="outline" size="sm" className="border-[#1a1a1a]/20 dark:border-[#f5f3ef]/20 dark:text-[#f5f3ef] dark:hover:bg-[#f5f3ef]/10">Get started</Button>
              </div>
            </div>

            {/* Pro - highlighted */}
            <div className="grid lg:grid-cols-12 gap-6 py-8 border-b border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 items-center bg-[#fff] dark:bg-[#252525] -mx-6 px-6 lg:mx-0 lg:px-0 lg:bg-transparent lg:dark:bg-transparent">
              <div className="lg:col-span-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-medium text-xl dark:text-[#f5f3ef]">Pro</h3>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#1a1a1a] dark:bg-[#f5f3ef] text-[#f5f3ef] dark:text-[#1a1a1a] px-2 py-0.5">Popular</span>
                </div>
                <p className="text-sm text-[#6b6b6b] dark:text-[#b8b0a8] mt-1">For serious builders</p>
              </div>
              <div className="lg:col-span-4">
                <ul className="text-sm text-[#6b6b6b] dark:text-[#b8b0a8] space-y-1">
                  <li>Unlimited apps</li>
                  <li>Priority AI (Claude Sonnet)</li>
                  <li>Persistent sandboxes</li>
                  <li>Export to GitHub</li>
                </ul>
              </div>
              <div className="lg:col-span-3">
                <span className="font-display text-3xl font-medium dark:text-[#f5f3ef]">$29</span>
                <span className="text-[#6b6b6b] dark:text-[#b8b0a8] ml-1">/month</span>
              </div>
              <div className="lg:col-span-2 lg:text-right">
                <Button size="sm">Upgrade to Pro</Button>
              </div>
            </div>

            {/* Enterprise */}
            <div className="grid lg:grid-cols-12 gap-6 py-8 items-center">
              <div className="lg:col-span-3">
                <h3 className="font-display font-medium text-xl dark:text-[#f5f3ef]">Team</h3>
                <p className="text-sm text-[#6b6b6b] dark:text-[#b8b0a8] mt-1">For organizations</p>
              </div>
              <div className="lg:col-span-4">
                <ul className="text-sm text-[#6b6b6b] dark:text-[#b8b0a8] space-y-1">
                  <li>Everything in Pro</li>
                  <li>Shared workspaces</li>
                  <li>Custom model support</li>
                  <li>SSO & audit logs</li>
                </ul>
              </div>
              <div className="lg:col-span-3">
                <span className="font-display text-3xl font-medium dark:text-[#f5f3ef]">$99</span>
                <span className="text-[#6b6b6b] dark:text-[#b8b0a8] ml-1">/month</span>
              </div>
              <div className="lg:col-span-2 lg:text-right">
                <Button variant="outline" size="sm" className="border-[#1a1a1a]/20 dark:border-[#f5f3ef]/20 dark:text-[#f5f3ef] dark:hover:bg-[#f5f3ef]/10">Contact sales</Button>
              </div>
            </div>
          </div>

          <p className="text-sm text-[#6b6b6b] dark:text-[#b8b0a8] mt-8">
            No credit card required for Starter. Upgrade or cancel anytime.
          </p>
        </div>
      </section>

      {/* CTA Section - builder focused */}
      <section className="py-24 lg:py-32 relative overflow-hidden transition-colors duration-300">
        {/* Prominent grid pattern */}
        <GridPattern className="opacity-[0.06] dark:opacity-[0.04]" size={32} color="#1a1a1a" />

        {/* Symmetrical corner decorations - light mode only */}
        <CurvyCorner position="top-left" color="#e5e2dd" className="absolute top-12 left-12 dark:hidden" />
        <CurvyCorner position="top-right" color="#e5e2dd" className="absolute top-12 right-12 dark:hidden" />
        <CurvyCorner position="bottom-left" color="#e5e2dd" className="absolute bottom-12 left-12 dark:hidden" />
        <CurvyCorner position="bottom-right" color="#e5e2dd" className="absolute bottom-12 right-12 dark:hidden" />

        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center relative">
          <p className="text-sm font-medium text-[#8b7355] mb-6 tracking-wide uppercase">Start building</p>
          <h2 className="font-display font-medium text-[clamp(2rem,5vw,2.5rem)] leading-[1.1] tracking-[-0.02em] mb-6 dark:text-[#f5f3ef]">
            Your first app is 60 seconds away.
          </h2>
          <p className="font-body text-lg text-[#6b6b6b] dark:text-[#b8b0a8] leading-relaxed mb-10 max-w-xl mx-auto">
            Paste a URL. Watch AI work. See it live. No setup, no configuration—just building.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="font-medium px-8" onClick={handleStartBuilding}>
              Start building free
            </Button>
            <Button variant="outline" size="lg" className="font-medium px-8 border-[#1a1a1a]/20 dark:border-[#f5f3ef]/20 dark:text-[#f5f3ef] dark:hover:bg-[#f5f3ef]/10">
              <Play className="w-4 h-4 mr-2" />
              Watch demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-[#1a1a1a]/10 dark:border-[#f5f3ef]/10 relative transition-colors duration-300 bg-[#8b7355]/30">
        <AsciiAnimation className="absolute right-8 top-4 hidden lg:block text-[#1a1a1a] dark:text-[#f5f3ef]" />
        <Connector className="-top-[11px] left-1/4" color="#e5e2dd" />
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          {/* Brand row */}
          <div className="flex items-center gap-3 mb-12">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none" className="text-[#1a1a1a] dark:text-[#f5f3ef]">
              <rect x="2" y="2" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none"/>
              <circle cx="14" cy="14" r="5" fill="currentColor"/>
            </svg>
            <span className="font-display font-medium text-base text-[#1a1a1a] dark:text-[#f5f3ef]">NovaFlow</span>
          </div>

          {/* Built With Section */}
          <div className="mb-12">
            <p className="text-xs font-semibold text-[#8b7355] uppercase tracking-widest mb-6">Built With</p>
            <div className="flex flex-wrap justify-center gap-4 lg:gap-6 items-center">
              <Tooltip.Provider delayDuration={100}>
                {footerLogosData.map((logo) => (
                  <Tooltip key={logo.title}>
                    <Tooltip.Trigger asChild>
                      <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-[#8b7355]/10 dark:bg-[#8b7355]/20 hover:bg-[#8b7355]/20 dark:hover:bg-[#8b7355]/30 transition-colors duration-300 cursor-pointer">
                        <img
                          src={logo.url}
                          alt={logo.title}
                          className="h-6 w-auto"
                          loading="lazy"
                        />
                      </div>
                    </Tooltip.Trigger>
                    <Tooltip.Content variant="solid">
                      <p className="font-body text-xs">{logo.title}</p>
                    </Tooltip.Content>
                  </Tooltip>
                ))}
              </Tooltip.Provider>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-[#1a1a1a]/5 dark:border-[#f5f3ef]/5">
            <p className="text-xs text-[#9b9b9b] dark:text-[#b8b0a8]">
              © 2026 NovaFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <SignUpDialog 
        open={signUpOpen} 
        onOpenChange={setSignUpOpen}
        onSuccess={handleAuthSuccess}
      />

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
      `}</style>
    </main>
  );
}
