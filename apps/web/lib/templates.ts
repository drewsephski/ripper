export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  previewImage?: string;
  files: {
    path: string;
    content: string;
    language: string;
  }[];
  tags: string[];
}

export const templates: Template[] = [
  {
    id: 'modern-saas-landing',
    name: 'Modern SaaS Landing',
    description: 'A sleek, modern SaaS landing page with hero, features, pricing, and footer sections. Uses Framer Motion for smooth animations.',
    category: 'Landing Page',
    tags: ['SaaS', 'Modern', 'Animation'],
    files: [
      {
        path: 'App.jsx',
        language: 'jsx',
        content: `import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

export default function App() {
  return (
    <main className="max-w-[1440px] mx-auto px-6 py-12 md:py-24">
      {/* Hero */}
      <section className="grid lg:grid-cols-2 gap-16 items-center mb-32">
        <motion.div initial="hidden" whileInView="visible" variants={fadeIn}>
          <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-6 block">Version 2.0 Now Live</span>
          <h1 className="text-[clamp(3rem,8vw,6rem)] leading-[0.9] mb-8">Precision tools for modern teams.</h1>
          <p className="text-xl text-zinc-600 mb-10 max-w-md">Design, deploy, and scale your infrastructure without the overhead. Built for engineers who value their time.</p>
          <button className="bg-black text-white px-8 py-4 rounded-full font-medium flex items-center gap-2 hover:bg-zinc-800 transition-colors">
            Get Started <ArrowRight size={18} />
          </button>
        </motion.div>
        <div className="bg-zinc-100 aspect-square rounded-3xl flex items-center justify-center border border-zinc-200">
          <span className="text-zinc-400 font-mono">Visual Placeholder</span>
        </div>
      </section>

      {/* Features */}
      <section className="mb-32">
        <h2 className="text-4xl mb-16">Core Capabilities</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {['Automated Scaling', 'Global Edge', 'Real-time Analytics'].map((f, i) => (
            <div key={i} className="border-t border-zinc-200 pt-8">
              <h3 className="text-2xl mb-4">{f}</h3>
              <p className="text-zinc-600">Advanced logic that adapts to your traffic patterns in real-time, ensuring zero downtime during spikes.</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="grid md:grid-cols-2 gap-16 items-start mb-32 bg-zinc-900 text-white p-12 md:p-20 rounded-[2rem]">
        <div>
          <h2 className="text-5xl mb-6">Transparent pricing for every scale.</h2>
          <p className="text-zinc-400">No hidden fees. No enterprise bloat. Just pay for what you use.</p>
        </div>
        <div className="bg-white text-black p-8 rounded-2xl">
          <div className="text-sm font-bold uppercase mb-4">Pro Plan</div>
          <div className="text-6xl font-bold mb-6">$49<span className="text-xl text-zinc-400">/mo</span></div>
          <ul className="space-y-4 mb-8">
            {['Unlimited Projects', 'Priority Support', 'API Access'].map(item => (
              <li key={item} className="flex items-center gap-3"><Check size={16} className="text-[var(--accent)]" /> {item}</li>
            ))}
          </ul>
          <button className="w-full bg-[var(--accent)] py-4 rounded-xl font-bold">Upgrade Now</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 pt-12 text-zinc-500 text-sm">
        <div className="flex justify-between">
          <p>© 2024 Foundry Inc. All rights reserved.</p>
          <div className="flex gap-8">
            <span>Twitter</span>
            <span>GitHub</span>
            <span>Privacy</span>
          </div>
        </div>
      </footer>
    </main>
  );
}`
      },
      {
        path: 'index.css',
        language: 'css',
        content: `@import url('https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&f[]=general-sans@200,300,400,500,600,700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #fdfdfd;
  --text: #0a0a0a;
  --accent: #ccff00;
}

body {
  background-color: var(--bg);
  color: var(--text);
  font-family: 'General Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 {
  font-family: 'Clash Display', sans-serif;
  letter-spacing: -0.02em;
}`
      }
    ]
  },
  {
    id: 'brutalist-studio',
    name: 'Brutalist Studio',
    description: 'Raw, industrial aesthetic with bold typography, high contrast, and unconventional layouts. Perfect for creative agencies.',
    category: 'Portfolio',
    tags: ['Brutalist', 'Industrial', 'Bold'],
    files: [
      {
        path: 'App.jsx',
        language: 'jsx',
        content: `import React from 'react';

export default function App() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f5f3ef]">
      {/* Hero - asymmetric, brutal */}
      <section className="min-h-screen flex items-center border-b-4 border-[#f5f3ef]">
        <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-8 lg:col-span-9 pt-32 pb-16">
              <h1 className="text-[clamp(4rem,12vw,12rem)] font-black leading-[0.85] tracking-tighter">
                WE BUILD
                <br />
                <span className="text-[#ff3366]">DIGITAL</span>
              </h1>
            </div>
            <div className="col-span-12 md:col-span-4 lg:col-span-3 flex items-end pb-16">
              <p className="text-xl md:text-2xl font-light leading-relaxed">
                A creative studio crafting experiences that challenge conventions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Work - grid breaking */}
      <section className="py-24 border-b-4 border-[#f5f3ef]">
        <div className="max-w-[1920px] mx-auto px-4 md:px-8">
          <div className="mb-16">
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter">SELECTED WORK</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Project One', year: '2024' },
              { name: 'Project Two', year: '2024' },
              { name: 'Project Three', year: '2023' },
              { name: 'Project Four', year: '2023' }
            ].map((project, i) => (
              <div key={i} className="border-4 border-[#f5f3ef] p-8 hover:bg-[#f5f3ef] hover:text-[#0a0a0a] transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-3xl md:text-4xl font-black">{project.name}</h3>
                  <span className="text-lg font-mono">{project.year}</span>
                </div>
                <div className="h-32 bg-[#f5f3ef]/20" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact - raw */}
      <section className="py-24">
        <div className="max-w-[1920px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-6">
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-8">LET'S TALK</h2>
              <a href="mailto:hello@studio.com" className="text-2xl md:text-4xl font-light hover:text-[#ff3366] transition-colors">
                hello@studio.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}`
      },
      {
        path: 'index.css',
        language: 'css',
        content: `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Space Grotesk', sans-serif;
  -webkit-font-smoothing: antialiased;
}`
      }
    ]
  },
  {
    id: 'editorial-magazine',
    name: 'Editorial Magazine',
    description: 'Sophisticated editorial layout with elegant typography, asymmetric grids, and magazine-style composition.',
    category: 'Portfolio',
    tags: ['Editorial', 'Magazine', 'Typography'],
    files: [
      {
        path: 'App.jsx',
        language: 'jsx',
        content: `import React from 'react';

export default function App() {
  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#1a1a1a]">
      {/* Header - elegant */}
      <header className="border-b border-[#1a1a1a]/10">
        <div className="max-w-[1400px] mx-auto px-6 py-6 flex justify-between items-center">
          <span className="text-2xl font-serif italic">The Archive</span>
          <nav className="flex gap-8 text-sm tracking-widest uppercase">
            <a href="#" className="hover:underline">Essays</a>
            <a href="#" className="hover:underline">Photography</a>
            <a href="#" className="hover:underline">About</a>
          </nav>
        </div>
      </header>

      {/* Hero - editorial asymmetric */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-7 lg:col-span-8">
              <p className="text-sm tracking-widest uppercase mb-4 text-[#8b7355]">Featured Story</p>
              <h1 className="text-[clamp(3rem,6vw,6rem)] font-serif leading-[0.95] mb-8">
                The Art of
                <br />
                <span className="italic">Slow Living</span>
              </h1>
              <p className="text-lg md:text-xl leading-relaxed max-w-2xl text-[#6b6b6b]">
                In a world that demands constant acceleration, there's a quiet revolution happening. People are choosing depth over breadth, presence over productivity.
              </p>
            </div>
            <div className="col-span-12 md:col-span-5 lg:col-span-4 pt-8 md:pt-0">
              <div className="aspect-[3/4] bg-[#e5e2dd]" />
            </div>
          </div>
        </div>
      </section>

      {/* Articles - editorial grid */}
      <section className="py-16 border-t border-[#1a1a1a]/10">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              { title: 'Morning Rituals', category: 'Lifestyle' },
              { title: 'Digital Minimalism', category: 'Technology' },
              { title: 'The Joy of Missing Out', category: 'Culture' }
            ].map((article, i) => (
              <article key={i} className="group cursor-pointer">
                <div className="aspect-[4/3] bg-[#e5e2dd] mb-6 group-hover:bg-[#d5d2cd] transition-colors" />
                <p className="text-xs tracking-widest uppercase mb-2 text-[#8b7355]">{article.category}</p>
                <h3 className="text-2xl font-serif mb-3 group-hover:underline">{article.title}</h3>
                <p className="text-sm text-[#6b6b6b] leading-relaxed">
                  Exploring the intersection of tradition and modernity in everyday life.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}`
      },
      {
        path: 'index.css',
        language: 'css',
        content: `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
}

.font-serif {
  font-family: 'Playfair Display', serif;
}`
      }
    ]
  },
  {
    id: 'retro-future-saas',
    name: 'Retro Future SaaS',
    description: 'Cyberpunk-inspired SaaS landing with neon accents, geometric patterns, and bold 80s aesthetics.',
    category: 'Landing Page',
    tags: ['Retro', 'Cyberpunk', 'Neon'],
    files: [
      {
        path: 'App.jsx',
        language: 'jsx',
        content: `import React from 'react';

export default function App() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f5f3ef] overflow-hidden">
      {/* Background grid */}
      <div className="fixed inset-0 opacity-20" style={{
        backgroundImage: \`
          linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)
        \`,
        backgroundSize: '50px 50px'
      }} />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center">
        <div className="max-w-[1400px] mx-auto px-6 py-24">
          <div className="relative">
            <h1 className="text-[clamp(4rem,10vw,10rem)] font-black leading-none tracking-tighter mb-8">
              <span className="text-[#00ff88]">NEXUS</span>
              <br />
              SYSTEMS
            </h1>
            <p className="text-xl md:text-2xl max-w-xl mb-12 text-[#b8b0a8]">
              Build the future. Deploy at the edge. Scale infinitely.
            </p>
            <button className="bg-[#00ff88] text-[#0a0a0a] px-8 py-4 font-bold text-lg hover:bg-[#00cc6a] transition-colors border-2 border-[#00ff88]">
              INITIALIZE →
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 border-2 border-[#ff00ff] rotate-45 opacity-50" />
        <div className="absolute bottom-20 left-20 w-24 h-24 border-2 border-[#00ff88] opacity-50" />
      </section>

      {/* Features */}
      <section className="relative py-24 border-t border-[#00ff88]/30">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'QUANTUM', desc: 'Edge computing at light speed' },
              { title: 'SYNAPSE', desc: 'AI-powered infrastructure' },
              { title: 'VOID', desc: 'Serverless architecture' }
            ].map((feature, i) => (
              <div key={i} className="border-2 border-[#ff00ff]/30 p-8 hover:border-[#ff00ff] transition-colors">
                <h3 className="text-3xl font-black mb-4 text-[#ff00ff]">{feature.title}</h3>
                <p className="text-[#b8b0a8]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}`
      },
      {
        path: 'index.css',
        language: 'css',
        content: `@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Rajdhani', sans-serif;
  -webkit-font-smoothing: antialiased;
}

.font-display {
  font-family: 'Orbitron', sans-serif;
}`
      }
    ]
  },
  {
    id: 'organic-wellness',
    name: 'Organic Wellness',
    description: 'Soft, natural aesthetic with flowing shapes, earth tones, and gentle typography. Perfect for wellness brands.',
    category: 'Landing Page',
    tags: ['Organic', 'Wellness', 'Soft'],
    files: [
      {
        path: 'App.jsx',
        language: 'jsx',
        content: `import React from 'react';

export default function App() {
  return (
    <main className="min-h-screen bg-[#f5f0e8] text-[#2d2a26]">
      {/* Hero - soft, flowing */}
      <section className="min-h-screen flex items-center relative overflow-hidden">
        {/* Organic shapes */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#d4c4a8]/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#a8b5a0]/30 rounded-full blur-3xl" />

        <div className="max-w-[1200px] mx-auto px-6 py-24 relative z-10">
          <div className="max-w-2xl">
            <p className="text-sm tracking-[0.3em] uppercase mb-6 text-[#8b7355]">Natural Wellness</p>
            <h1 className="text-[clamp(3rem,7vw,5rem] font-light leading-[1.1] mb-8">
              Find your
              <br />
              <span className="font-medium italic">natural rhythm</span>
            </h1>
            <p className="text-lg leading-relaxed mb-12 text-[#5c5a56]">
              Embrace the gentle path to wellness. Our products are crafted with intention, using only the purest ingredients nature provides.
            </p>
            <button className="bg-[#2d2a26] text-[#f5f0e8] px-8 py-4 rounded-full font-medium hover:bg-[#3d3a36] transition-colors">
              Begin Your Journey
            </button>
          </div>
        </div>
      </section>

      {/* Products - gentle grid */}
      <section className="py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Calming Essence', price: '$48' },
              { name: 'Renewal Serum', price: '$62' },
              { name: 'Balance Oil', price: '$54' }
            ].map((product, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="aspect-square bg-[#e8e0d4] rounded-3xl mb-6 group-hover:bg-[#d4c4a8] transition-colors flex items-center justify-center">
                  <span className="text-[#8b7355] text-sm">Product Image</span>
                </div>
                <h3 className="text-xl font-light mb-2">{product.name}</h3>
                <p className="text-[#8b7355]">{product.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy - flowing text */}
      <section className="py-24 bg-[#a8b5a0]/20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-light leading-relaxed mb-8">
              "True wellness isn't about perfection—it's about finding harmony in the gentle rhythms of nature."
            </h2>
            <p className="text-[#5c5a56]">— Our Philosophy</p>
          </div>
        </div>
      </section>
    </main>
  );
}`
      },
      {
        path: 'index.css',
        language: 'css',
        content: `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Lato:wght@300;400;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Lato', sans-serif;
  -webkit-font-smoothing: antialiased;
}

.font-serif {
  font-family: 'Cormorant Garamond', serif;
}`
      }
    ]
  },
  {
    id: 'luxury-architecture',
    name: 'Luxury Architecture',
    description: 'Elegant, refined aesthetic with sophisticated typography, generous whitespace, and premium feel.',
    category: 'Portfolio',
    tags: ['Luxury', 'Architecture', 'Refined'],
    files: [
      {
        path: 'App.jsx',
        language: 'jsx',
        content: `import React from 'react';

export default function App() {
  return (
    <main className="min-h-screen bg-[#f8f6f4] text-[#1a1a1a]">
      {/* Header - minimal luxury */}
      <header className="border-b border-[#1a1a1a]/10">
        <div className="max-w-[1600px] mx-auto px-8 py-6 flex justify-between items-center">
          <span className="text-xl tracking-[0.3em] uppercase">Atelier</span>
          <nav className="hidden md:flex gap-12 text-sm tracking-widest uppercase">
            <a href="#" className="hover:text-[#8b7355] transition-colors">Projects</a>
            <a href="#" className="hover:text-[#8b7355] transition-colors">Studio</a>
            <a href="#" className="hover:text-[#8b7355] transition-colors">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero - dramatic spacing */}
      <section className="min-h-screen flex items-center">
        <div className="max-w-[1600px] mx-auto px-8 py-32">
          <div className="max-w-4xl">
            <p className="text-xs tracking-[0.4em] uppercase mb-8 text-[#8b7355]">Architecture & Design</p>
            <h1 className="text-[clamp(3rem,8vw,7rem] font-light leading-[0.95] tracking-tight mb-12">
              Crafting spaces
              <br />
              that inspire
            </h1>
            <p className="text-lg leading-relaxed max-w-xl text-[#6b6b6b]">
              We believe architecture should elevate the human experience. Every project is a dialogue between form, function, and feeling.
            </p>
          </div>
        </div>
      </section>

      {/* Projects - asymmetric layout */}
      <section className="py-32">
        <div className="max-w-[1600px] mx-auto px-8">
          <div className="mb-24">
            <h2 className="text-xs tracking-[0.4em] uppercase mb-4">Selected Projects</h2>
          </div>
          <div className="space-y-32">
            {[
              { name: 'The Glass House', location: 'Kyoto, Japan', year: '2024' },
              { name: 'Ocean Residence', location: 'Malibu, California', year: '2023' }
            ].map((project, i) => (
              <div key={i} className="grid grid-cols-12 gap-8 items-center">
                <div className="col-span-12 md:col-span-7 lg:col-span-8">
                  <div className="aspect-[16/9] bg-[#e5e2dd]" />
                </div>
                <div className="col-span-12 md:col-span-5 lg:col-span-4">
                  <p className="text-xs tracking-[0.3em] uppercase mb-4 text-[#8b7355]">{project.year}</p>
                  <h3 className="text-3xl font-light mb-4">{project.name}</h3>
                  <p className="text-[#6b6b6b]">{project.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}`
      },
      {
        path: 'index.css',
        language: 'css',
        content: `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@300;400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
}

.font-serif {
  font-family: 'Cormorant Garamond', serif;
}`
      }
    ]
  }
];

export function getTemplateById(id: string): Template | undefined {
  return templates.find(t => t.id === id);
}

export function getTemplatesByCategory(category: string): Template[] {
  return templates.filter(t => t.category === category);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(templates.map(t => t.category)));
}
