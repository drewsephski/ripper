"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Badge } from "@/components/retroui/Badge";
import { templates, getAllCategories, getTemplatesByCategory, Template } from "@/lib/templates";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Layout, Globe, Briefcase, Code, Filter, Zap, Flame, Gem, Leaf } from "lucide-react";
import { AnimatedThemeToggler } from "@/components/AnimatedThemeToggler";
import { FontToggle } from "@/components/FontToggle";
import { Logo } from "@/components/Logo";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const categoryIcons: Record<string, React.ReactNode> = {
  'Landing Page': <Zap className="w-5 h-5" />,
  'Portfolio': <Globe className="w-5 h-5" />,
  'SaaS': <Briefcase className="w-5 h-5" />,
  'E-commerce': <Sparkles className="w-5 h-5" />,
  'Blog': <Code className="w-5 h-5" />,
};

const accentColors: Record<string, string> = {
  'Landing Page': '#ff3366',
  'Portfolio': '#00ff88',
  'SaaS': '#ff00ff',
  'E-commerce': '#ff6600',
  'Blog': '#00ccff',
};

const gradientMap: Record<string, string> = {
  'Landing Page': 'from-[#ff3366]/20 to-[#ff3366]/5',
  'Portfolio': 'from-[#00ff88]/20 to-[#00ff88]/5',
  'SaaS': 'from-[#ff00ff]/20 to-[#ff00ff]/5',
  'E-commerce': 'from-[#ff6600]/20 to-[#ff6600]/5',
  'Blog': 'from-[#00ccff]/20 to-[#00ccff]/5',
};

export default function TemplatesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const categories = ["All", ...getAllCategories()];

  const filteredTemplates = selectedCategory === "All" 
    ? templates 
    : getTemplatesByCategory(selectedCategory);

  const handleUseTemplate = (template: Template) => {
    // Store template in sessionStorage and redirect to builder
    sessionStorage.setItem('selectedTemplate', JSON.stringify(template));
    router.push('/builder');
  };

  return (
    <main className="min-h-screen bg-[#f5f3ef] dark:bg-[#1a1a1a] text-[#1a1a1a] dark:text-[#f5f3ef] transition-colors duration-300">
      {/* Navigation */}
      <nav className="border-b border-[#1a1a1a]/8 dark:border-[#f5f3ef]/10 relative z-20 bg-[#f5f3ef]/70 dark:bg-[#1a1a1a]/70 backdrop-blur-md supports-[backdrop-filter]:bg-[#f5f3ef]/60 supports-[backdrop-filter]:dark:bg-[#1a1a1a]/60 transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-6 lg:px-8 py-5 flex items-center justify-between">
          <Logo onClick={() => router.push('/')} />
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="text-sm font-normal text-[#6b6b6b] hover:text-[#8b7355] dark:text-[#b8b0a8] dark:hover:text-[#c9b896]"
            >
              Back to Home
            </Button>
            <FontToggle />
            <AnimatedThemeToggler variant="circle" duration={500} />
          </div>
        </div>
      </nav>

      {/* Header - dramatic, asymmetric */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-[#8b7355]/10 to-transparent rounded-full blur-3xl" />
        
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8b7355] text-white rounded-full mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-bold tracking-wider uppercase">Template Marketplace</span>
            </motion.div>
            
            <h1 className="font-display font-black text-[clamp(3.5rem,8vw,7rem)] leading-[0.9] tracking-tighter mb-8">
              Start with a
              <br />
              <span className="text-[#8b7355]">template.</span>
              <br />
              Ship faster.
            </h1>
            
            <p className="font-body text-xl md:text-2xl text-[#6b6b6b] dark:text-[#b8b0a8] leading-relaxed max-w-3xl font-light">
              Choose from our collection of professionally designed templates. Each one is production-ready and fully customizable.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter - bold pills */}
      <section className="mb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex items-center gap-4 overflow-x-auto pb-4"
          >
            <Filter className="w-5 h-5 text-[#6b6b6b] dark:text-[#b8b0a8] flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-[#8b7355] text-white scale-105 shadow-lg shadow-[#8b7355]/30'
                    : 'bg-white dark:bg-[#2a2a2a] text-[#6b6b6b] dark:text-[#b8b0a8] hover:bg-[#8b7355]/10 dark:hover:bg-[#8b7355]/20 border-2 border-transparent hover:border-[#8b7355]/30'
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Templates Grid - dramatic cards */}
      <section className="pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                variants={fadeInUp}
                className="group"
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="h-full bg-white dark:bg-[#2a2a2a] border-2 border-[#1a1a1a]/10 dark:border-[#8b7355]/20 overflow-hidden hover:border-[#8b7355] dark:hover:border-[#8b7355] transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-[#8b7355]/20">
                  {/* Preview Area - larger, more dramatic */}
                  <div className={`aspect-[4/3] bg-gradient-to-br ${gradientMap[template.category] || 'from-[#f5f3ef] to-[#e5e2dd]'} dark:from-[#2a2a2a] dark:to-[#1a1a1a] flex items-center justify-center border-b-2 border-[#1a1a1a]/10 dark:border-[#8b7355]/20 relative overflow-hidden`}>
                    {/* Animated pattern */}
                    <div className="absolute inset-0 opacity-30" style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, ${accentColors[template.category] || '#8b7355'} 1px, transparent 0)`,
                      backgroundSize: '24px 24px'
                    }} />
                    <div className="relative z-10 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm`}>
                        {categoryIcons[template.category] || <Layout className="w-8 h-8 text-[#8b7355]" />}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#6b6b6b] dark:text-[#b8b0a8]">Preview</span>
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-display font-bold text-xl text-[#1a1a1a] dark:text-[#f5f3ef] tracking-tight">
                        {template.name}
                      </h3>
                      <Badge className="text-xs font-bold uppercase tracking-wider">
                        {template.category}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-[#6b6b6b] dark:text-[#b8b0a8] mb-6 line-clamp-2 leading-relaxed">
                      {template.description}
                    </p>

                    {/* Tags - more prominent */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-bold px-3 py-1.5 bg-[#8b7355]/10 dark:bg-[#8b7355]/20 text-[#8b7355] uppercase tracking-wider rounded-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Action - bolder */}
                    <Button
                      onClick={() => handleUseTemplate(template)}
                      className="w-full bg-[#8b7355] text-white font-bold uppercase tracking-wider hover:bg-[#a08060] transition-all duration-300 group-hover:scale-105"
                    >
                      Use Template
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filteredTemplates.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <p className="text-xl text-[#6b6b6b] dark:text-[#b8b0a8] font-light">No templates found in this category.</p>
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}
