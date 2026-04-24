/**
 * Sophisticated Component Library for Enhanced Code Generation
 * 
 * This library provides production-ready, beautifully designed component templates
 * that avoid "AI slop" aesthetics. Each template is fully customizable and
 * follows modern design principles.
 */

// =============================================================================
// HEADER/NAVIGATION PATTERNS
// =============================================================================

export const headerPatterns = {
  // Minimalist floating nav with glassmorphism
  floatingGlass: `export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={\`fixed top-0 left-0 right-0 z-50 transition-all duration-500 \${
        scrolled ? 'py-3' : 'py-6'
      }\`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <nav className={\`flex items-center justify-between px-6 py-4 rounded-full transition-all duration-500 \${
          scrolled 
            ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5' 
            : 'bg-transparent'
        }\`}>
          <a href="/" className="text-xl font-semibold tracking-tight">
            Brand
          </a>
          <div className="hidden md:flex items-center gap-8">
            {['Products', 'Solutions', 'About', 'Contact'].map((item) => (
              <a 
                key={item}
                href={\`#\${item.toLowerCase()}\`}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gray-900 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>
          <button className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors">
            Get Started
          </button>
        </nav>
      </div>
    </motion.header>
  );
}`,

  // Asymmetric nav with bold typography
  asymmetricBold: `export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#fafaf9] border-b border-[#e7e5e4]">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-12">
            <a href="/" className="text-2xl font-bold tracking-tighter text-[#1c1917]">
              STUDIO
            </a>
            <div className="hidden lg:flex items-center gap-1">
              {['Work', 'Services', 'Studio', 'Journal'].map((item, i) => (
                <React.Fragment key={item}>
                  <a 
                    href={\`#\${item.toLowerCase()}\`}
                    className="px-4 py-2 text-sm font-medium text-[#78716c] hover:text-[#1c1917] transition-colors"
                  >
                    {item}
                  </a>
                  {i < 3 && <span className="text-[#d6d3d1]">·</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
          <a 
            href="#contact" 
            className="group flex items-center gap-2 text-sm font-semibold text-[#1c1917]"
          >
            Start a Project
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </a>
        </nav>
      </div>
    </header>
  );
}`,

  // Magazine-style editorial nav
  editorialNav: `export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    return (
      <header className="bg-[#f8f5f2] border-b border-[#e8e2dc]">
        <div className="max-w-6xl mx-auto px-8">
          {/* Top bar */}
          <div className="flex items-center justify-between py-3 border-b border-[#e8e2dc]">
            <span className="text-xs tracking-widest text-[#8b7355] uppercase">Est. 2024</span>
            <div className="flex items-center gap-6">
              <a href="#search" className="text-xs text-[#5c4d3c] hover:text-[#2c241b]">Search</a>
              <a href="#subscribe" className="text-xs text-[#5c4d3c] hover:text-[#2c241b]">Subscribe</a>
            </div>
          </div>
          
          {/* Main nav */}
          <div className="flex items-center justify-between py-6">
            <a href="/" className="font-serif text-3xl italic text-[#2c241b]">
              The Editorial
            </a>
            <nav className="hidden md:flex items-center gap-10">
              {['Culture', 'Design', 'Travel', 'Food', 'Style'].map((item) => (
                <a 
                  key={item}
                  href={\`#\${item.toLowerCase()}\`}
                  className="text-sm font-medium text-[#5c4d3c] hover:text-[#2c241b] tracking-wide transition-colors"
                >
                  {item}
                </a>
              ))}
            </nav>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>
    );
  }`,
};

// =============================================================================
// HERO SECTION PATTERNS
// =============================================================================

export const heroPatterns = {
  // Split-screen asymmetric hero
  splitAsymmetric: `export default function Hero() {
  return (
    <section className="min-h-screen bg-[#fafaf9] pt-32 pb-20 lg:pt-40 lg:pb-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-block px-4 py-1.5 bg-[#f5f5f4] text-[#78716c] text-xs font-semibold tracking-wider uppercase rounded-full mb-8">
              New Collection 2024
            </span>
            <h1 className="font-serif text-5xl lg:text-7xl font-medium text-[#1c1917] leading-[1.1] mb-6">
              Crafted for
              <span className="block italic text-[#78716c]">the discerning</span>
            </h1>
            <p className="text-lg text-[#78716c] leading-relaxed mb-10 max-w-md">
              Discover our curated selection of timeless pieces, each telling a story of craftsmanship and intention.
            </p>
            <div className="flex items-center gap-4">
              <button className="px-8 py-4 bg-[#1c1917] text-white font-medium rounded-full hover:bg-[#292524] transition-colors">
                Explore Collection
              </button>
              <button className="px-8 py-4 border border-[#d6d3d1] text-[#44403c] font-medium rounded-full hover:border-[#a8a29e] transition-colors">
                Our Story
              </button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="aspect-[4/5] bg-[#e7e5e4] rounded-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80" 
                alt="Hero"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl max-w-xs">
              <p className="text-sm font-medium text-[#1c1917] mb-1">Handcrafted Excellence</p>
              <p className="text-xs text-[#78716c]">Each piece takes 40+ hours to complete</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}`,

  // Bold typography hero with minimal imagery
  typographicBold: `export default function Hero() {
  return (
    <section className="relative min-h-screen bg-[#0a0a0a] text-white overflow-hidden flex items-center">
      {/* Abstract background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#dc2626] rounded-full blur-[120px] opacity-30" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#7c3aed] rounded-full blur-[120px] opacity-20" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-12 bg-white/30" />
            <span className="text-sm tracking-widest uppercase text-white/60">
              Digital Agency
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9] mb-8">
            WE BUILD
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">
              THE FUTURE
            </span>
          </h1>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <p className="text-lg md:text-xl text-white/60 max-w-md leading-relaxed">
              Award-winning digital experiences that captivate audiences and drive measurable results.
            </p>
            <button className="group flex items-center gap-3 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-colors">
              Start Project
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
        
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-3 gap-8 mt-24 pt-12 border-t border-white/10"
        >
          {[
            { value: '150+', label: 'Projects Delivered' },
            { value: '12', label: 'Years Experience' },
            { value: '98%', label: 'Client Satisfaction' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-sm text-white/50">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}`,

  // Editorial magazine-style hero
  editorialHero: `export default function Hero() {
  return (
    <section className="bg-[#f8f5f2] pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-8">
        {/* Category tag */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-[#c4a77d]" />
          <span className="text-xs tracking-widest uppercase text-[#8b7355]">Featured Story</span>
        </motion.div>
        
        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl text-[#2c241b] leading-[1.05] mb-8"
        >
          The Art of
          <br />
          <span className="italic text-[#8b7355]">Slow Living</span>
        </motion.h1>
        
        {/* Deck/Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-[#5c4d3c] leading-relaxed max-w-2xl mb-12"
        >
          In a world obsessed with speed, a growing movement embraces intentionality, 
          craftsmanship, and the beauty of taking time.
        </motion.p>
        
        {/* Author meta */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-6 text-sm text-[#8b7355]"
        >
          <span>By Sarah Mitchell</span>
          <span className="w-1 h-1 rounded-full bg-[#d4c5b5]" />
          <span>12 min read</span>
          <span className="w-1 h-1 rounded-full bg-[#d4c5b5]" />
          <span>December 2024</span>
        </motion.div>
        
        {/* Hero image */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 aspect-[21/9] rounded-lg overflow-hidden"
        >
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&q=80"
            alt="Slow living"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}`,

  // Product-focused hero
  productHero: `export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-[#667eea]/10 via-white to-[#764ba2]/10 pt-32 pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-8">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-700">Now in Stock</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Aurora
              <span className="block text-[#667eea]">Wireless Headphones</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Experience sound like never before. Active noise cancellation, 
              40-hour battery life, and studio-quality audio.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <span className="text-4xl font-bold text-gray-900">$299</span>
              <span className="text-lg text-gray-400 line-through">$399</span>
              <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
                Save 25%
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20">
                Add to Cart
              </button>
              <button className="p-4 border-2 border-gray-200 rounded-full hover:border-gray-300 transition-colors">
                <Heart className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            {/* Trust badges */}
            <div className="flex items-center gap-6 mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500" />
                Free Shipping
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500" />
                2-Year Warranty
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500" />
                30-Day Returns
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#667eea]/20 to-[#764ba2]/20 rounded-3xl blur-3xl" />
            <img 
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
              alt="Headphones"
              className="relative w-full aspect-square object-contain drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}`,

  // Minimalist center hero
  minimalistCenter: `export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block text-xs tracking-[0.3em] uppercase text-gray-400 mb-8"
        >
          Portfolio 2024
        </motion.span>
        
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl lg:text-9xl font-light tracking-tight text-gray-900 mb-8"
        >
          DESIGN
          <span className="block font-serif italic">studio</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-gray-500 max-w-lg mx-auto mb-12 leading-relaxed"
        >
          Creating thoughtful digital experiences for brands that value design excellence.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-8"
        >
          <a href="#work" className="text-sm tracking-wide text-gray-900 hover:text-gray-600 transition-colors">
            View Work
          </a>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <a href="#contact" className="text-sm tracking-wide text-gray-900 hover:text-gray-600 transition-colors">
            Get in Touch
          </a>
        </motion.div>
      </div>
    </section>
  );
}`,
};

// =============================================================================
// CONTENT SECTION PATTERNS
// =============================================================================

export const contentPatterns = {
  // Bento grid layout
  bentoGrid: `export default function Content() {
  const items = [
    { 
      title: 'Strategy', 
      desc: 'Data-driven insights that inform every decision',
      span: 'col-span-2',
      bg: 'bg-[#fef3c7]'
    },
    { 
      title: 'Design', 
      desc: 'Beautiful interfaces that users love',
      span: 'col-span-1',
      bg: 'bg-[#dbeafe]'
    },
    { 
      title: 'Development', 
      desc: 'Clean, performant code',
      span: 'col-span-1',
      bg: 'bg-[#d1fae5]'
    },
    { 
      title: 'Growth', 
      desc: 'Scale your product with confidence using our proven frameworks',
      span: 'col-span-2',
      bg: 'bg-[#fce7f3]'
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What we do
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl">
            End-to-end digital solutions for ambitious brands
          </p>
        </motion.div>
        
        <div className="grid grid-cols-3 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className={\`\${item.span} \${item.bg} rounded-3xl p-8 min-h-[280px] flex flex-col justify-between group cursor-pointer transition-shadow hover:shadow-xl\`}
            >
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-700">{item.desc}</p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}`,

  // Feature list with large numbers
  numberedFeatures: `export default function Content() {
  const features = [
    {
      num: '01',
      title: 'Discovery',
      desc: 'Deep dive into your business, users, and competitive landscape'
    },
    {
      num: '02',
      title: 'Strategy',
      desc: 'Define the roadmap and key metrics for success'
    },
    {
      num: '03',
      title: 'Design',
      desc: 'Craft intuitive interfaces that delight users'
    },
    {
      num: '04',
      title: 'Build',
      desc: 'Engineer robust solutions with clean, scalable code'
    },
  ];

  return (
    <section className="py-32 bg-[#fafaf9]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20">
          <div className="lg:sticky lg:top-32 lg:h-fit">
            <span className="text-xs tracking-widest uppercase text-[#78716c] mb-4 block">
              Our Process
            </span>
            <h2 className="text-5xl font-bold text-[#1c1917] mb-6">
              How we work
            </h2>
            <p className="text-lg text-[#78716c] leading-relaxed">
              A proven methodology refined over 50+ projects. 
              We combine strategic thinking with agile execution.
            </p>
          </div>
          
          <div className="space-y-16">
            {features.map((feature, i) => (
              <motion.div
                key={feature.num}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-8 group"
              >
                <span className="text-7xl font-bold text-[#e7e5e4] group-hover:text-[#d6d3d1] transition-colors">
                  {feature.num}
                </span>
                <div className="pt-4">
                  <h3 className="text-2xl font-semibold text-[#1c1917] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[#78716c] text-lg">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}`,

  // Editorial article layout
  editorialArticle: `export default function Content() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <div className="prose prose-lg max-w-none">
          <p className="text-xl leading-relaxed text-gray-700 mb-8 first-letter:text-6xl first-letter:font-serif first-letter:float-left first-letter:mr-3 first-letter:mt-[-8px]">
            In the rolling hills of Tuscany, where time seems to move differently, 
            a small collective of artisans has been practicing their craft for generations. 
            Their workshop, nestled among cypress trees and olive groves, represents 
            something increasingly rare in our modern world: an unwavering commitment to quality.
          </p>
          
          <p className="text-lg leading-relaxed text-gray-600 mb-6">
            The philosophy is simple yet profound: every object that leaves their hands 
            must be worthy of the materials from which it's made and the time invested in its creation.
          </p>
          
          <blockquote className="border-l-4 border-[#c4a77d] pl-6 my-12 italic text-2xl text-gray-800">
            "The best things in life take time. We've learned to respect that process."
          </blockquote>
          
          <p className="text-lg leading-relaxed text-gray-600">
            This approach extends beyond mere production. It's a mindset that values 
            patience over speed, quality over quantity, and meaning over mass consumption.
          </p>
        </div>
        
        {/* Image grid */}
        <div className="grid grid-cols-2 gap-4 mt-12">
          <img 
            src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&q=80"
            alt="Craftsmanship"
            className="rounded-lg aspect-[4/3] object-cover"
          />
          <img 
            src="https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=600&q=80"
            alt="Workshop"
            className="rounded-lg aspect-[4/3] object-cover mt-8"
          />
        </div>
      </div>
    </section>
  );
}`,

  // Testimonial cards
  testimonials: `export default function Content() {
  const testimonials = [
    {
      quote: "They transformed our vision into reality. The attention to detail was remarkable.",
      author: "Elena Rodriguez",
      role: "CEO, Artisan Co",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80"
    },
    {
      quote: "The best investment we've made. Our conversion rate increased by 340%.",
      author: "Marcus Chen",
      role: "Founder, TechStart",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80"
    },
    {
      quote: "Professional, creative, and incredibly easy to work with.",
      author: "Sarah Johnson",
      role: "Director, Bloom Agency",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80"
    }
  ];

  return (
    <section className="py-24 bg-[#fafaf9]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#1c1917] mb-4">
            What clients say
          </h2>
          <p className="text-lg text-[#78716c]">
            Don't just take our word for it
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#f59e0b] text-[#f59e0b]" />
                ))}
              </div>
              <p className="text-lg text-[#44403c] mb-6 leading-relaxed">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-4">
                <img 
                  src={t.avatar} 
                  alt={t.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-[#1c1917]">{t.author}</p>
                  <p className="text-sm text-[#78716c]">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}`,

  // Feature grid with icons
  featureGrid: `export default function Content() {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized performance ensures your site loads in milliseconds"
    },
    {
      icon: Shield,
      title: "Secure by Default",
      description: "Enterprise-grade security built into every layer"
    },
    {
      icon: Sparkles,
      title: "Beautiful Design",
      description: "Stunning aesthetics that captivate your audience"
    },
    {
      icon: Code,
      title: "Clean Code",
      description: "Maintainable, scalable code that grows with you"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold tracking-wider uppercase text-[#667eea] mb-4 block">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything you need
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features that help you build faster and scale effortlessly
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors group"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:shadow-md transition-shadow">
                <feature.icon className="w-6 h-6 text-[#667eea]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}`,

  // Stats bar
  statsBar: `export default function Content() {
  const stats = [
    { value: "10M+", label: "Active Users" },
    { value: "99.9%", label: "Uptime" },
    { value: "150+", label: "Countries" },
    { value: "24/7", label: "Support" }
  ];

  return (
    <section className="py-20 bg-[#1c1917]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}`,

  // Image + text alternating
  alternatingContent: `export default function Content() {
  const sections = [
    {
      title: "Design that speaks",
      description: "Every pixel is placed with intention. We create designs that communicate your brand's unique story and values.",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
      reverse: false
    },
    {
      title: "Built for performance",
      description: "Speed matters. Our code is optimized for lightning-fast load times and smooth interactions.",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80",
      reverse: true
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            className={\`grid md:grid-cols-2 gap-12 items-center \${i > 0 ? 'mt-24' : ''} \${section.reverse ? 'md:flex-row-reverse' : ''}\`}
          >
            <div className={section.reverse ? 'md:order-2' : ''}>
              <span className="text-sm font-semibold tracking-wider uppercase text-[#667eea] mb-4 block">
                0{i + 1}
              </span>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {section.title}
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                {section.description}
              </p>
              <button className="flex items-center gap-2 text-[#667eea] font-semibold hover:gap-3 transition-all">
                Learn more <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className={section.reverse ? 'md:order-1' : ''}>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <img 
                  src={section.image} 
                  alt={section.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}`,

  // Pricing section
  pricing: `export default function Content() {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for individuals and small projects",
      features: ["5 Projects", "10GB Storage", "Basic Analytics", "Email Support"],
      popular: false
    },
    {
      name: "Pro",
      price: "$79",
      period: "/month",
      description: "For growing teams with advanced needs",
      features: ["Unlimited Projects", "100GB Storage", "Advanced Analytics", "Priority Support", "Custom Integrations"],
      popular: true
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "/month",
      description: "For large organizations with custom requirements",
      features: ["Everything in Pro", "Unlimited Storage", "Dedicated Support", "SLA Guarantee", "Custom Contracts"],
      popular: false
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold tracking-wider uppercase text-[#667eea] mb-4 block">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that works best for you
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={\`relative p-8 rounded-2xl \${
                plan.popular 
                  ? 'bg-[#1c1917] text-white scale-105 shadow-xl' 
                  : 'bg-white text-gray-900'
              }\`}
            >
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#667eea] text-white text-sm font-semibold rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className={\`text-xl font-semibold mb-2 \${plan.popular ? 'text-white' : 'text-gray-900'}\`}>
                {plan.name}
              </h3>
              <p className={\`text-sm mb-6 \${plan.popular ? 'text-gray-400' : 'text-gray-600'}\`}>
                {plan.description}
              </p>
              <div className="mb-6">
                <span className={\`text-5xl font-bold \${plan.popular ? 'text-white' : 'text-gray-900'}\`}>
                  {plan.price}
                </span>
                <span className={plan.popular ? 'text-gray-400' : 'text-gray-600'}>{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className={\`w-5 h-5 \${plan.popular ? 'text-[#667eea]' : 'text-green-500'}\`} />
                    <span className={plan.popular ? 'text-gray-300' : 'text-gray-700'}>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className={\`w-full py-3 rounded-full font-semibold transition-colors \${
                plan.popular
                  ? 'bg-white text-[#1c1917] hover:bg-gray-100'
                  : 'bg-[#1c1917] text-white hover:bg-gray-800'
              }\`}>
                Get Started
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}`,
};

// =============================================================================
// FOOTER PATTERNS
// =============================================================================

export const footerPatterns = {
  // Minimal footer
  minimal: `export default function Footer() {
  return (
    <footer className="bg-[#1c1917] text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <a href="/" className="text-2xl font-bold tracking-tight">
            BRAND
          </a>
          <nav className="flex items-center gap-8">
            {['About', 'Work', 'Contact'].map((item) => (
              <a 
                key={item}
                href={\`#\${item.toLowerCase()}\`}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>
          <p className="text-sm text-gray-500">
            © 2024 Brand. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}`,

  // Newsletter footer
  newsletter: `export default function Footer() {
  return (
    <footer className="bg-[#fafaf9] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Newsletter section */}
        <div className="max-w-2xl mb-20">
          <h3 className="text-3xl font-bold text-[#1c1917] mb-4">
            Stay in the loop
          </h3>
          <p className="text-[#78716c] mb-6">
            Get design insights and updates delivered to your inbox.
          </p>
          <form className="flex gap-3">
            <input 
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-3 bg-white border border-[#e7e5e4] rounded-full focus:outline-none focus:border-[#a8a29e]"
            />
            <button className="px-6 py-3 bg-[#1c1917] text-white font-medium rounded-full hover:bg-[#292524] transition-colors">
              Subscribe
            </button>
          </form>
        </div>
        
        {/* Links */}
        <div className="grid md:grid-cols-4 gap-8 py-12 border-t border-[#e7e5e4]">
          <div>
            <a href="/" className="text-xl font-bold text-[#1c1917]">BRAND</a>
          </div>
          {[
            { title: 'Product', links: ['Features', 'Pricing', 'Integrations'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers'] },
            { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies'] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-[#1c1917] mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href={\`#\${link.toLowerCase()}\`} className="text-[#78716c] hover:text-[#1c1917] transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-[#e7e5e4] text-sm text-[#78716c]">
          <p>© 2024 Brand. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            {['Twitter', 'Instagram', 'LinkedIn'].map((social) => (
              <a key={social} href={\`#\${social.toLowerCase()}\`} className="hover:text-[#1c1917] transition-colors">
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}`,

  // Editorial footer
  editorialFooter: `export default function Footer() {
  return (
    <footer className="bg-[#2c241b] text-[#e8e2dc]">
      <div className="max-w-6xl mx-auto px-8 py-20">
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <div>
            <a href="/" className="font-serif text-3xl italic mb-6 block">
              The Editorial
            </a>
            <p className="text-[#a89b8c] leading-relaxed">
              Curated stories about culture, design, and the art of living well.
            </p>
          </div>
          
          {/* Categories */}
          <div>
            <h4 className="text-xs tracking-widest uppercase mb-6">Sections</h4>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {['Culture', 'Design', 'Travel', 'Food', 'Style', 'Archive'].map((item) => (
                <a 
                  key={item}
                  href={\`#\${item.toLowerCase()}\`}
                  className="text-[#a89b8c] hover:text-[#e8e2dc] transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
          
          {/* Social */}
          <div>
            <h4 className="text-xs tracking-widest uppercase mb-6">Follow</h4>
            <div className="space-y-3">
              {['Instagram', 'Twitter', 'Pinterest', 'RSS'].map((item) => (
                <a 
                  key={item}
                  href={\`#\${item.toLowerCase()}\`}
                  className="block text-[#a89b8c] hover:text-[#e8e2dc] transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#3d3429] text-sm text-[#8b7355]">
          <p>© 2024 The Editorial. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}`,
};

// =============================================================================
// UTILITY COMPONENTS
// =============================================================================

export const utilityPatterns = {
  // Marquee scrolling text
  marquee: `export default function Marquee() {
  return (
    <div className="py-8 bg-black text-white overflow-hidden">
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="flex whitespace-nowrap"
      >
        {[...Array(4)].map((_, i) => (
          <span key={i} className="text-6xl font-bold mx-8">
            DESIGN • DEVELOP • DEPLOY •
          </span>
        ))}
      </motion.div>
    </div>
  );
}`,

  // CTA Section
  ctaSection: `export default function CTA() {
  return (
    <section className="py-32 bg-[#1c1917]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Let's create something
          <span className="block italic text-[#a8a29e]">extraordinary</span>
        </h2>
        <p className="text-xl text-[#a8a29e] mb-10 max-w-xl mx-auto">
          Ready to transform your digital presence? We're here to help.
        </p>
        <button className="px-10 py-5 bg-white text-[#1c1917] font-semibold rounded-full hover:bg-[#f5f5f4] transition-colors">
          Start a Project
        </button>
      </div>
    </section>
  );
}`,

  // Logo cloud/trust bar
  trustBar: `export default function TrustBar() {
  const logos = ['Google', 'Meta', 'Apple', 'Amazon', 'Netflix'];
  
  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-sm text-gray-400 mb-8 tracking-widest uppercase">
          Trusted by industry leaders
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
          {logos.map((logo) => (
            <span key={logo} className="text-2xl font-bold text-gray-300">
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}`,
};

// =============================================================================
// COMPONENT TEMPLATE SELECTOR
// =============================================================================

export interface DesignProfile {
  style: 'minimal' | 'bold' | 'editorial' | 'playful' | 'luxury' | 'technical';
  colorScheme: 'light' | 'dark' | 'warm' | 'cool' | 'vibrant';
  typography: 'serif' | 'sans' | 'mixed' | 'display';
  complexity: 'simple' | 'moderate' | 'complex';
}

export function selectComponents(profile: DesignProfile) {
  const selections: Record<string, string> = {};
  
  // Header selection
  if (profile.style === 'minimal') {
    selections.header = headerPatterns.floatingGlass;
  } else if (profile.style === 'editorial') {
    selections.header = headerPatterns.editorialNav;
  } else {
    selections.header = headerPatterns.asymmetricBold;
  }
  
  // Hero selection
  if (profile.style === 'minimal') {
    selections.hero = heroPatterns.minimalistCenter;
  } else if (profile.style === 'editorial') {
    selections.hero = heroPatterns.editorialHero;
  } else if (profile.style === 'bold') {
    selections.hero = heroPatterns.typographicBold;
  } else {
    selections.hero = heroPatterns.splitAsymmetric;
  }
  
  // Content selection
  if (profile.complexity === 'simple') {
    selections.content = contentPatterns.editorialArticle;
  } else if (profile.style === 'bold') {
    selections.content = contentPatterns.bentoGrid;
  } else {
    selections.content = contentPatterns.numberedFeatures;
  }
  
  // Footer selection
  if (profile.style === 'editorial') {
    selections.footer = footerPatterns.editorialFooter;
  } else if (profile.style === 'minimal') {
    selections.footer = footerPatterns.minimal;
  } else {
    selections.footer = footerPatterns.newsletter;
  }
  
  return selections;
}

// =============================================================================
// FALLBACK DESIGN SYSTEM
// =============================================================================

export const fallbackDesignSystem = {
  description: `When screenshot analysis is incomplete or content is minimal, use this sophisticated fallback design system:

**Design Direction:**
Choose ONE of these distinct aesthetic directions based on context clues:

1. **Refined Minimalism** (default for business/professional)
   - Warm neutral palette: cream (#FAF9F6), soft gray (#78716C), charcoal (#292524)
   - Typography: Elegant serif (Playfair Display) + clean sans (DM Sans)
   - Generous whitespace, asymmetric layouts
   - Subtle micro-interactions

2. **Editorial Magazine** (for content-heavy/lifestyle)
   - Earth tones: warm beige (#F8F5F2), terracotta (#C4A77D), deep brown (#2C241B)
   - Typography: Classic serif (Cormorant Garamond) + refined sans (Source Sans Pro)
   - Grid-based layouts with intentional asymmetry
   - Sophisticated spacing hierarchy

3. **Bold Modern** (for tech/startups)
   - High contrast: near-black (#0A0A0A), pure white, electric accent
   - Typography: Bold geometric sans (Space Grotesk) + body text (Inter - only if necessary)
   - Dramatic scale contrasts, dynamic compositions
   - Purposeful motion and animation

4. **Soft Playful** (for consumer/apps)
   - Pastel accents: soft coral, mint, lavender against warm white
   - Typography: Rounded sans (Plus Jakarta Sans) throughout
   - Organic shapes, soft shadows
   - Friendly, approachable interactions

**Component Guidelines:**
- Always use the sophisticated prebuilt patterns from the component library
- Never generate generic "AI slop" layouts
- Choose typography pairings that feel intentional and distinctive
- Create visual rhythm with varied spacing
- Add meaningful micro-interactions

**Quality Check:**
If the design looks like it could be from any AI generator circa 2024, start over with a bolder direction.`,

  colorPalettes: {
    refinedMinimal: {
      background: '#FAF9F6',
      surface: '#FFFFFF',
      primary: '#292524',
      secondary: '#78716C',
      accent: '#A8A29E',
      muted: '#E7E5E4',
    },
    editorial: {
      background: '#F8F5F2',
      surface: '#FFFFFF',
      primary: '#2C241B',
      secondary: '#5C4D3C',
      accent: '#C4A77D',
      muted: '#E8E2DC',
    },
    boldModern: {
      background: '#0A0A0A',
      surface: '#171717',
      primary: '#FFFFFF',
      secondary: '#A3A3A3',
      accent: '#DC2626', // or vibrant purple, electric blue
      muted: '#262626',
    },
    softPlayful: {
      background: '#FFFBF7',
      surface: '#FFFFFF',
      primary: '#1F2937',
      secondary: '#6B7280',
      accent: '#FF6B6B', // soft coral
      muted: '#F3F4F6',
    },
  },

  fontPairings: {
    refined: {
      display: 'Playfair Display',
      body: 'DM Sans',
      import: `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');`,
    },
    editorial: {
      display: 'Cormorant Garamond',
      body: 'Source Sans Pro',
      import: `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Source+Sans+Pro:wght@400;600;700&display=swap');`,
    },
    bold: {
      display: 'Space Grotesk',
      body: 'Inter',
      import: `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');`,
    },
    playful: {
      display: 'Plus Jakarta Sans',
      body: 'Plus Jakarta Sans',
      import: `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`,
    },
  },
};

// Export all patterns
export default {
  headerPatterns,
  heroPatterns,
  contentPatterns,
  footerPatterns,
  utilityPatterns,
  selectComponents,
  fallbackDesignSystem,
};
