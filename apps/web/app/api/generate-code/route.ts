import { NextRequest, NextResponse } from 'next/server';
import { openrouter, ModelId } from '@/lib/openrouter';
import type { ConversationState } from '@/types/conversation';

declare global {
  var conversationState: ConversationState | null;
}

export const dynamic = 'force-dynamic';

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const CONFIG = {
  // Retry strategy
  MAX_RETRIES: 2,
  RETRY_DELAY_BASE: 1000,
  RETRY_BACKOFF_MULTIPLIER: 2,
  
  // Streaming & timeouts
  HEARTBEAT_INTERVAL: 15000,
  STREAM_TIMEOUT: 300000,
  CHUNK_TIMEOUT: 30000,
  
  // Token limits
  MAX_TOKENS: 12000,
  MAX_TOKENS_FALLBACK: 8000,
  
  // Validation
  MIN_CONTENT_LENGTH: 100,
  WARN_CONTENT_LENGTH: 1000,
} as const;

// Model strategy: Try highest capability first, fallback to reliable models
const PRIMARY_MODEL: ModelId = 'google/gemini-3.1-flash-lite-preview';
const MODEL_FALLBACK_CHAIN: ModelId[] = [
  'tencent/hy3-preview:free',
  'openrouter/free',
  'deepseek/deepseek-v3.2',
  'qwen/qwen3-coder-next',
];

// ============================================================================
// SYSTEM PROMPTS - ROLE & CONTEXT
// ============================================================================

const DESIGN_EXCELLENCE_PRINCIPLES = `## 🎨 DESIGN EXCELLENCE PRINCIPLES (ALWAYS FOLLOW)

### Design Direction
Commit to a BOLD aesthetic direction. The key is intentionality, not intensity:
- **Purpose**: Understand what problem the interface solves and who uses it
- **Tone**: Execute with precision whether minimal or maximalist, retro or futuristic, organic or geometric
- **Differentiation**: Create something UNFORGETTABLE - the one thing someone will remember

### Typography (AVOID AI SLOP)
- **NEVER** use Inter, Roboto, Arial, Open Sans - these are overused AI defaults
- Choose DISTINCTIVE font pairings: display font + body font
- **GOOD GOOGLE FONTS TO USE** (import in index.css):
  - Display: Playfair Display, Cormorant Garamond, Space Grotesk, Syne
  - Body: Source Serif 4, Merriweather, Lora, Crimson Text, Manrope
  - Modern: Plus Jakarta Sans, Red Hat Display, DM Sans
- Use fluid type scales with clamp(): text-[clamp(2rem,5vw,4rem)]
- Vary font weights and sizes to create clear visual hierarchy
- **DON'T** put large icons with rounded corners above every heading
- **DON'T** use monospace typography as lazy shorthand for "technical/developer" vibes
- Choose fonts that are beautiful, unique, and interesting

### Color & Theme (AVOID AI SLOP)
- **NEVER** use the "AI color palette": cyan-on-dark, purple-to-blue gradients, neon accents on dark backgrounds
- **NEVER** use gradient text for "impact" on metrics or headings
- **NEVER** use pure black/white - always tint toward brand hue
- **NEVER** default to dark mode with glowing accents
- Create cohesive palettes with dominant colors and sharp accents
- **DISTINCTIVE PALETTES** (not AI defaults):
  - Warm: Terracotta (#E07A5F), Cream (#F4F1DE), Olive (#81B29A), Gold (#F2CC8F)
  - Cool: Slate (#3D5A80), Powder Blue (#98C1D9), Light Cyan (#E0FBFC), Burnt Sienna (#EE6C4D)
  - Luxury: Deep Navy (#1B263B), Champagne (#E0E1DD), Rose Gold (#D4A373), Charcoal (#415A77)
  - Playful: Coral (#FF6B6B), Soft Yellow (#FFE66D), Mint (#4ECDC4), Lavender (#95E1D3)
- Use modern CSS color functions (OKLCH, color-mix, light-dark)
- Tint your neutrals toward your brand hue
- Use sharp accent colors against dominant bases

### Layout & Space (AVOID AI SLOP)
- Create visual RHYTHM through varied spacing
- Embrace ASYMMETRY and unexpected compositions
- Break the grid intentionally for emphasis
- Use fluid spacing with clamp()
- **DON'T** wrap everything in cards
- **DON'T** nest cards inside cards
- **DON'T** use identical card grids
- **DON'T** center everything
- **DON'T** use the same spacing everywhere

### Visual Details (AVOID AI SLOP)
- Use intentional, purposeful decorative elements
- **DON'T** use glassmorphism everywhere
- **DON'T** use rounded elements with thick colored border on one side
- **DON'T** use sparklines as decoration
- **DON'T** use rounded rectangles with generic drop shadows
- **DON'T** use modals unless truly no better alternative exists

### Motion & Animation
- Focus on high-impact moments: one well-orchestrated page load with staggered reveals
- Use exponential easing for natural deceleration: ease: [0.22, 1, 0.36, 1]
- **Micro-interactions**: Add subtle hover states
  - Buttons: whileHover={{ scale: 1.02 }}, whileTap={{ scale: 0.98 }}
  - Cards: whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
- **Scroll-triggered reveals**: Use Intersection Observer or Framer Motion's whileInView
- **Page transitions**: Orchestrate entry with staggered delays
- **DON'T** animate layout properties (width, height, padding, margin)
- **DON'T** use bounce or elastic easing
- **DON'T** animate everything - focus on 2-3 signature moments

### The AI Slop Test
**CRITICAL**: If you showed this interface to someone and said "AI made this," would they believe you immediately? If yes, that's the problem.

A distinctive interface should make someone ask "how was this made?" not "which AI made this?"

### CODE RICHNESS & COMPLEXITY (CRITICAL - AVOID BARE MINIMUM)

**NEVER generate bare-bones placeholder code. Components must be SUBSTANTIAL and PRODUCTION-READY.**

**Minimum Component Size:**
- Hero.jsx: 150+ lines with full animations, multiple sections, CTAs, social proof
- Content.jsx: 200+ lines with rich content, multiple sections, detailed layouts
- Header.jsx: 80+ lines with full navigation, mobile menu, scroll effects
- Footer.jsx: 60+ lines with multiple columns, links, newsletter, social icons

**Required Content Depth:**
- Write ACTUAL content, not "Lorem ipsum" or placeholder text
- Include 5-8 real navigation items with descriptive labels
- Create 3-6 feature sections with detailed descriptions
- Add 4-8 real testimonials with names, roles, companies
- Include 6-10 portfolio/project items with descriptions
- Write full paragraphs (3-5 sentences), not one-liners
- Add realistic statistics, metrics, data points

**Advanced Features to Include:**
- React Router setup with multiple routes (Home, About, Services, Portfolio, Contact)
- Complex animations: staggered reveals, parallax, 3D transforms
- Interactive elements: tabs, accordions, carousels, modals
- Form handling with validation states
- Scroll-based effects: progress bars, fade-ins, transforms
- Hover micro-interactions on ALL interactive elements
- Loading states and error handling
- Image galleries with lightbox functionality

**Multi-Page Architecture:**
If the project warrants it (portfolio, SaaS, e-commerce), generate:
- Home page with full marketing sections
- About page with team, story, values
- Services/Products page with detailed offerings
- Portfolio/Gallery page with filtering
- Contact page with form and map

**Example of INSUFFICIENT (don't do this):**
A Hero component that is just 5 lines with a single heading and no animations, CTAs, or content.

**Example of SUFFICIENT (do this):**
A Hero component with:
- State management for sliders/carousels
- 3-5 slides with real titles and subtitles
- Animated headline with staggered text reveals
- Multiple CTAs with hover effects
- Trust badges and client logo marquee
- Scroll indicator animation
- Floating decorative elements
- Parallax background effects

**FINAL CHECK:**
- Is your Hero under 100 lines? ADD MORE CONTENT
- Are you using placeholder text? REPLACE WITH REAL COPY
- Is there only one animation? ADD MORE INTERACTIVITY
- Are your components under 60 lines? SPLIT INTO SMALLER COMPONENTS`;

const SYSTEM_PROMPT_GENERATION = `⚠️⚠️⚠️ STOP AND READ THIS FIRST ⚠️⚠️⚠️

## CODE RICHNESS MANDATE (NON-NEGOTIABLE)

**IF YOU GENERATE BARE-BONES CODE, YOU HAVE FAILED.**

**MINIMUM REQUIREMENTS - VIOLATE THESE AND THE OUTPUT IS WRONG:**
- Hero.jsx: MINIMUM 200 lines (not 10, not 50 - 200+)
- Content.jsx: MINIMUM 300 lines with 5+ sections
- Header.jsx: MINIMUM 100 lines with full navigation
- Footer.jsx: MINIMUM 80 lines with multiple columns
- Total output: 8-14 files, 1000+ lines of code

**ABSOLUTELY FORBIDDEN:**
- ❌ Hero components under 50 lines
- ❌ Single-element sections (just a heading)
- ❌ Placeholder text like "Lorem ipsum"
- ❌ One animation per component
- ❌ Empty or minimal content sections
- ❌ Missing CTAs, social proof, testimonials
- ❌ No interactive elements

**REQUIRED IN EVERY COMPONENT:**
- State management (useState, useEffect)
- Multiple animations (staggered reveals, hover effects, scroll triggers)
- Real content (3-5 sentence paragraphs, actual company names, real testimonials)
- Interactive elements (buttons with hover states, cards with transforms)
- Multiple sub-components if file exceeds 150 lines
- Loading states and error handling where applicable

**EXAMPLE OF WRONG (10 lines - UNACCEPTABLE):**
export default function Hero() {
  return <section><h2>Designing the Future</h2></section>;
}

**EXAMPLE OF RIGHT (200+ lines - REQUIRED):**
export default function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  // ... 10+ state variables
  // ... data arrays with 5+ items each
  // ... multiple animation variants
  // ... 3-5 separate sub-sections
  // ... 50+ lines of actual content
}

**CHECK YOUR OUTPUT BEFORE SENDING:**
1. Count lines in Hero.jsx - if under 200, ADD MORE
2. Count lines in Content.jsx - if under 300, ADD MORE
3. Check for placeholder text - REPLACE with real content
4. Count animations - if only 1-2, ADD MORE
5. Count interactive elements - if under 5, ADD MORE

## MULTI-PAGE ARCHITECTURE & INTERACTIONS (CRITICAL)

**GENERATE FULL APPLICATIONS WITH LOGICAL ROUTING - NOT SINGLE-PAGE SITES:**

**Required Page Structure by App Type:**

**Blog App:**
- Home (/): Featured posts grid, categories sidebar, newsletter signup
- Blog Index (/blog): All posts with filtering by category/tag
- Blog Post (/blog/:slug): Full article with rich content, author bio, related posts, comments section
- About (/about): Author/team info, mission statement
- Contact (/contact): Contact form with validation

**Portfolio App:**
- Home (/): Hero, featured projects, skills, testimonials
- Projects (/projects): Grid with filtering by category/tech
- Project Detail (/projects/:id): Full case study with images, challenges, solutions, tech stack
- About (/about): Bio, experience timeline, downloadable resume
- Contact (/contact): Form + social links

**E-commerce App:**
- Home (/): Featured products, categories, promotions
- Shop (/shop): Product grid with filters, sorting, search
- Product Detail (/product/:id): Images gallery, variants, reviews, add to cart
- Cart (/cart): Full cart management, quantity updates, promo codes
- Checkout (/checkout): Multi-step form, payment integration UI

**Dashboard/SAAS App:**
- Landing (/): Marketing page with features, pricing, testimonials
- Dashboard (/dashboard): Data visualizations, stats, recent activity
- Features (/features): Detailed feature explanations
- Pricing (/pricing): Tier comparison, FAQ
- Settings (/settings): User preferences, account management

**Navigation Requirements:**
- ALL pages must have working Back buttons (useNavigate)
- Breadcrumbs on detail pages showing path (Home > Blog > Post Title)
- Active nav state highlighting current page
- Mobile hamburger menu with smooth slide-in animation
- Footer links to all main pages

**Interactive Page Elements:**
- Page transitions: AnimatePresence with fade/slide effects
- Clickable cards: Entire card is clickable with hover lift effect
- Detail pages: Large hero image, rich typography, scroll animations
- Search/filter: Real-time filtering with animated results
- Pagination or "Load More" with loading states
- Image galleries: Lightbox/modal for full-size viewing
- Forms: Validation with error states, success animations

**Dynamic Routing Setup:**
App.jsx MUST include BrowserRouter with Routes for:
- Route path="/" for Home page
- Route path="/blog" for Blog index
- Route path="/blog/:slug" for individual blog posts (dynamic)
- Route path="/projects/:id" for project detail pages (dynamic)
- Route path="/product/:id" for product detail pages
- And all other pages with proper route definitions

**Content Depth for Detail Pages:**
- Blog posts: 800+ words, multiple sections, code blocks if relevant, images
- Project pages: Problem statement, solution approach, process images, results/metrics
- Product pages: Full specs, multiple images, reviews, related products

**Interactive Effects to Include:**
- Parallax scrolling backgrounds
- Magnetic buttons (follow cursor on hover)
- Text reveal animations (character by character or word by word)
- 3D card tilts on hover
- Smooth scroll-to-section navigation
- Infinite scroll or pagination animations
- Modal/dialog transitions with backdrop blur
- Toast notifications for actions
- Skeleton loading states for async content
- Hover-triggered preview cards
- Scroll progress indicators

You are an elite React developer specializing in pixel-perfect website cloning. Your expertise is in:

1. **Visual Precision**: Exact replication of colors, typography, spacing, and layout
2. **Code Quality**: Clean, maintainable React/Tailwind CSS that works immediately
3. **Performance**: Optimized components that don't waste resources
4. **Accessibility**: WCAG AA compliant with semantic HTML

Your MISSION: Transform a website screenshot into a complete, working React application.

## CRITICAL DELIVERABLES

You MUST generate 8-12 files for a COMPLETE, SOPHISTICATED application:

**Core Files (ALWAYS):**
1. src/App.jsx - Main app composing all sections together (NO routing)
2. src/components/Header.jsx - Navigation with anchor links (#section-id)
3. src/components/Hero.jsx - RICH hero with animations, CTAs, social proof (200+ lines)
4. src/components/Content.jsx - MULTIPLE scroll sections (300+ lines): Features, About, Portfolio, Testimonials, Contact
5. src/components/Footer.jsx - Multi-column footer with links
6. src/index.css - Full Tailwind + Google Fonts + custom animations

**Optional Section Components:**
7. src/components/Features.jsx - Feature grid section
8. src/components/Portfolio.jsx - Portfolio gallery with modal details
9. src/components/Testimonials.jsx - Testimonials carousel
10. src/components/Contact.jsx - Contact form section
11. src/components/AnimatedSection.jsx - Scroll-triggered animation wrapper

**Utility Components (as needed):**
12. src/components/ui/Button.jsx - Reusable animated button
13. src/components/ui/Card.jsx - Rich card component with hover effects
14. src/components/AnimatedSection.jsx - Scroll-triggered animation wrapper

**Content Requirements per Component:**
- Hero: Headline, subheadline, 2+ CTAs, trust badges, client logos, scroll indicator
- Content: 3-6 sections (Features, Testimonials, Stats, CTA, FAQ, Team)
- Header: Logo, 5-8 nav items, mobile hamburger menu, CTA button
- Footer: 3-4 column layout, newsletter form, social icons, copyright

Every file must be COMPLETE and RUNNABLE with SUBSTANTIAL content. NO truncation, NO placeholder text.

${DESIGN_EXCELLENCE_PRINCIPLES}

## TECHNICAL CONSTRAINTS

- React 18 with hooks only
- Tailwind CSS (arbitrary values allowed)
- Lucide React for icons ONLY
- Framer Motion for animations ONLY
- NO react-router-dom (single-page app with anchor links)
- NO external UI libraries
- NO font packages (use Google Fonts CSS)

## OUTPUT FORMAT - ABSOLUTE RULES

⚠️ **ANY DEVIATION FROM THIS FORMAT WILL BREAK THE SYSTEM** ⚠️

**MANDATORY OUTPUT STRUCTURE:**

Your ENTIRE response must consist of 8-14 file tags in this order, followed by the package tag:

<file path="src/App.jsx">
import React from 'react';
// ... complete code
</file>

<file path="src/components/Header.jsx">
import React from 'react';
// ... complete code
</file>

<file path="src/components/Hero.jsx">
import React from 'react';
// ... complete code
</file>

<file path="src/components/Content.jsx">
import React from 'react';
// ... complete code
</file>

<file path="src/components/Footer.jsx">
import React from 'react';
// ... complete code
</file>

<file path="src/index.css">
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Google Fonts import - REQUIRED */
@import url('https://fonts.googleapis.com/css2?family=Your+Display+Font:wght@400;700&family=Your+Body+Font:wght@400;500;600&display=swap');

/* Custom CSS variables and global styles */
:root {
  --primary-color: #your-color;
  --secondary-color: #your-color;
}

body {
  font-family: 'Your Body Font', sans-serif;
}

/* Custom animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Additional custom styles */
</file>

<package>
lucide-react framer-motion
</package>

**🚫 FORBIDDEN - NEVER DO THESE:**
- ❌ NEVER use markdown code blocks (\`\`\`jsx or \`\`\`)
- ❌ NEVER write "Here's the code:" or any introductory text
- ❌ NEVER write "Let me explain..." or explanatory paragraphs
- ❌ NEVER output code outside of <file> tags
- ❌ NEVER use bullet points, numbered lists, or markdown formatting
- ❌ NEVER say "Sure! I'll create..." - START IMMEDIATELY with <file>
- ❌ NEVER add a summary at the end
- ❌ NEVER apologize or explain your choices

**✅ CORRECT - DO THIS:**
[Example]
<file path="src/App.jsx">
import React from 'react';
export default function App() {
  return <div>Hello</div>;
}
</file>

<file path="src/components/Header.jsx">
...
</file>

**❌ WRONG - NEVER THIS:**
[Example]
Here's the code for your website:

(backticks)jsx
// First, let's create App.jsx
import React from 'react';
export default function App() {
  return <div>Hello</div>;
}
(backticks)

Now for the Header component:
(backticks)jsx
...
(backticks)

**FINAL CHECK BEFORE OUTPUT:**
1. Does your response start with \`<file path=\` ? If not, DELETE everything and start over.
2. Are there any \`\`\` backticks? If yes, REMOVE them.
3. Is there any text before the first <file> tag? If yes, DELETE it.
4. Is there any text after the last </package> tag? If yes, DELETE it.
5. Do you have 8-14 </file> closing tags? Count them manually (more files = better architecture).

**YOUR OUTPUT WILL BE PARSED BY A COMPUTER. ANY TEXT OUTSIDE <file> TAGS CAUSES ERRORS.**

Start immediately with <file path="src/App.jsx">`;

const SYSTEM_PROMPT_CHAT = `⚠️⚠️⚠️ STOP AND READ THIS FIRST ⚠️⚠️⚠️

## CODE RICHNESS MANDATE (NON-NEGOTIABLE)

**IF YOU GENERATE BARE-BONES CODE, YOU HAVE FAILED.**

**MINIMUM REQUIREMENTS - VIOLATE THESE AND THE OUTPUT IS WRONG:**
- Hero.jsx: MINIMUM 200 lines (not 10, not 50 - 200+)
- Content.jsx: MINIMUM 300 lines with 5+ sections
- Header.jsx: MINIMUM 100 lines with full navigation
- Footer.jsx: MINIMUM 80 lines with multiple columns
- Total output: 8-14 files, 1000+ lines of code

**ABSOLUTELY FORBIDDEN:**
- ❌ Hero components under 50 lines
- ❌ Single-element sections (just a heading)
- ❌ Placeholder text like "Lorem ipsum"
- ❌ One animation per component
- ❌ Empty or minimal content sections
- ❌ Missing CTAs, social proof, testimonials
- ❌ No interactive elements

**REQUIRED IN EVERY COMPONENT:**
- State management (useState, useEffect)
- Multiple animations (staggered reveals, hover effects, scroll triggers)
- Real content (3-5 sentence paragraphs, actual company names, real testimonials)
- Interactive elements (buttons with hover states, cards with transforms)
- Multiple sub-components if file exceeds 150 lines
- Loading states and error handling where applicable

**CHECK YOUR OUTPUT BEFORE SENDING:**
1. Count lines in Hero.jsx - if under 200, ADD MORE
2. Count lines in Content.jsx - if under 300, ADD MORE
3. Check for placeholder text - REPLACE with real content
4. Count animations - if only 1-2, ADD MORE
5. Count interactive elements - if under 5, ADD MORE

## SINGLE-PAGE ARCHITECTURE WITH RICH SECTIONS

**GENERATE A SINGLE-PAGE SITE WITH MULTIPLE SCROLL SECTIONS:**

**Site Structure (All on one page, scrollable):**
- Header with navigation (anchor links to sections: #hero, #features, #about, #portfolio, #contact)
- Hero section - Full viewport with headline, CTA, animations
- Features section - 3-6 feature cards with icons and descriptions
- About section - Company/personal story with images
- Portfolio/Projects section - Grid of work samples with modal popups for details
- Testimonials section - 4-8 client quotes with avatars
- Services section - Service offerings with pricing
- Contact section - Form with validation, map, contact info
- Footer - Links, social icons, newsletter

**Content Requirements:**
- Content.jsx should have 300+ lines with 5-8 distinct sections
- Each section is a scrollable area with id="section-name"
- Navigation links use href="#section-name" for smooth scrolling
- Portfolio items open in modals (not separate pages)
- Blog preview shows excerpts (link to external blog or modal)

**Interactive Effects:**
- Smooth scroll navigation
- Section reveal animations on scroll
- Parallax backgrounds
- Hover effects on all cards and buttons
- Modal popups for portfolio details
- Accordion FAQ sections
- Carousel/slider for testimonials
- Form validation with error states

**IMPORTANT:**
- NO react-router-dom (not needed for single-page)
- NO BrowserRouter, Routes, Route
- All content in one scrollable page
- Use anchor links and modals for navigation

**CRITICAL - PAGE MUST RENDER (NOT BLANK):**
- Every component MUST return visible JSX content
- Hero MUST have: headline text, subtitle, at least 2 CTA buttons
- Content.jsx MUST have 5-8 sections with real content visible on page
- Check before sending: Is anything returning empty? ADD CONTENT.

You are an expert React developer and UI/UX designer in conversation mode. You help users refine, modify, and improve their applications.

## COMPONENT ARCHITECTURE RULE (CRITICAL)

**ALWAYS** split code into multiple component files. NEVER put everything in App.jsx.

**REQUIRED FILE STRUCTURE:**
- src/App.jsx - Main app composing all components together (NO routing)
- src/components/Header.jsx - Full navigation with mobile menu
- src/components/Hero.jsx - Rich hero/intro section (200+ lines)
- src/components/Content.jsx - Multiple content sections (300+ lines)
- src/components/Footer.jsx - Multi-column footer
- src/index.css - Global styles with Google Fonts

**Example of proper App.jsx:**
<file path="src/App.jsx">
import Header from './components/Header';
import Hero from './components/Hero';
import Content from './components/Content';
import Footer from './components/Footer';

export default function App() {
  return (
    <div>
      <Header />
      <Hero />
      <Content />
      <Footer />
    </div>
  );
}
</file>

## OUTPUT FORMAT - ABSOLUTE RULES

⚠️ **ANY DEVIATION FROM THIS FORMAT WILL BREAK THE SYSTEM** ⚠️

**When providing code:**
1. Brief conversational explanation (1-2 sentences max)
2. THEN immediately output files using ONLY <file> tags

**MANDATORY STRUCTURE FOR CODE:**

<file path="src/App.jsx">
[COMPLETE FILE CONTENT - should be minimal, mostly imports]
</file>

<file path="src/components/COMPONENT.jsx">
[COMPLETE FILE CONTENT]
</file>

<package>
lucide-react framer-motion
</package>

**🚫 FORBIDDEN - NEVER DO THESE:**
- ❌ NEVER use markdown code blocks (\`\`\`jsx or \`\`\`)
- ❌ NEVER put ALL code in App.jsx - always split into components
- ❌ NEVER write "Here's the updated code:" then use markdown
- ❌ NEVER output code in chat text outside of <file> tags
- ❌ NEVER say "I've made the changes" without showing <file> tags
- ❌ NEVER use bullet points or lists for code
- ❌ NEVER use react-router-dom, BrowserRouter, Routes, Route
- ❌ NEVER generate more than 8 files - STOP after 6-8 files

**✅ CORRECT:**
"I'll restructure your portfolio into proper components.

<file path="src/App.jsx">
import Header from './components/Header';
...
</file>

<file path="src/components/Header.jsx">
...
</file>"

**❌ WRONG:**
"Here's the updated code:

\`\`\`jsx
// Everything in one file
import React from 'react';
export default function App() {
  return (
    <div>
      <nav>...</nav>
      <main>...</main>
      <footer>...</footer>
    </div>
  );
}
\`\`\`"

**When answering questions (no code needed):**
Provide clear, actionable answers without code blocks.

**FINAL CHECK:**
- Does your response contain \`\`\` backticks? REMOVE THEM.
- Is all code in ONE file? SPLIT INTO MULTIPLE COMPONENTS.
- Does code appear outside <file> tags? MOVE IT INSIDE.
- START IMMEDIATELY with <file> when providing code.`

// ============================================================================
// INPUT VALIDATION
// ============================================================================

interface GenerationRequest {
  prompt: string;
  scrapedContent?: string;
  model?: string;
  isChat?: boolean;
}

function validateGenerationRequest(body: unknown): {
  valid: boolean;
  errors: string[];
  data?: GenerationRequest;
} {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    errors.push('Request body must be valid JSON');
    return { valid: false, errors };
  }

  const data = body as GenerationRequest;

  // Validate prompt
  if (!data.prompt || typeof data.prompt !== 'string') {
    errors.push('Prompt is required and must be a string');
  } else if (data.prompt.trim().length < 5) {
    errors.push('Prompt must be at least 5 characters');
  } else if (data.prompt.length > 10000) {
    errors.push('Prompt exceeds maximum length (10000 characters)');
  }

  // Validate scraped content (required for non-chat)
  if (!data.isChat && (!data.scrapedContent || typeof data.scrapedContent !== 'string')) {
    errors.push('Scraped content is required for code generation');
  }

  // Validate model if provided
  if (data.model && typeof data.model !== 'string') {
    errors.push('Model must be a string');
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? data : undefined,
  };
}

// ============================================================================
// CONTENT VALIDATION & RECOVERY
// ============================================================================

interface ValidationResult {
  isValid: boolean;
  fileCount: number;
  issues: string[];
  isComplete: boolean;
  estimatedTokens: number;
}

function validateGeneratedContent(content: string): ValidationResult {
  const issues: string[] = [];

  // Check length
  if (!content || content.length < CONFIG.MIN_CONTENT_LENGTH) {
    issues.push(`Content too short (${content.length} bytes, min ${CONFIG.MIN_CONTENT_LENGTH})`);
  }

  // Count files
  const openTags = (content.match(/<file path="/g) || []).length;
  const closeTags = (content.match(/<\/file>/g) || []).length;
  const fileCount = openTags;

  if (openTags === 0) {
    issues.push('No file tags found');
  } else if (openTags !== closeTags) {
    issues.push(`Unbalanced file tags (${openTags} open, ${closeTags} closed)`);
  }

  // Check for truncation indicators
  const truncationPatterns = [
    /\/\/\s*\.\.\./i,
    /\/\*\s*\.\.\.\s*\*\//,
    /\/\/\s*rest of/i,
    /\/\/\s*continue/i,
    /\.\.\.\s*\}\s*$/m,
    /<file[^>]*>\s*$/,
  ];

  for (const pattern of truncationPatterns) {
    if (pattern.test(content)) {
      issues.push('Truncation detected (incomplete generation)');
      break;
    }
  }

  // Check last file completeness
  const lastFileStart = content.lastIndexOf('<file path=');
  if (lastFileStart > -1) {
    const lastFileEnd = content.indexOf('</file>', lastFileStart);
    if (lastFileEnd === -1) {
      issues.push('Last file is incomplete');
    }
  }

  // Rough token estimation (1 token ≈ 4 characters)
  const estimatedTokens = Math.ceil(content.length / 4);

  const isComplete = openTags > 0 && openTags === closeTags && fileCount >= 4 && issues.length === 0;

  return {
    isValid: isComplete,
    fileCount,
    issues,
    isComplete,
    estimatedTokens,
  };
}

function attemptContentRecovery(content: string): string {
  let recovered = content;

  const openTags = (recovered.match(/<file path="[^"]+">/g) || []).length;
  const closeTags = (recovered.match(/<\/file>/g) || []).length;

  // Close any unclosed files
  if (openTags > closeTags) {
    const diff = openTags - closeTags;
    recovered += '\n'.repeat(diff) + '</file>'.repeat(diff);
  }

  return recovered;
}

// ============================================================================
// STREAMING & API COMMUNICATION
// ============================================================================

interface StreamMessage {
  type: 'status' | 'progress' | 'content' | 'complete' | 'error' | 'heartbeat';
  [key: string]: any;
}

function encodeStreamMessage(message: StreamMessage): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(`data: ${JSON.stringify(message)}\n\n`);
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// CODE GENERATION WITH RETRY LOGIC
// ============================================================================

interface GenerationResult {
  content: string;
  success: boolean;
  usedFallback: boolean;
  model: string;
  validation: ValidationResult;
}

async function generateWithRetry(
  model: ModelId,
  systemPrompt: string,
  userPrompt: string,
  attempt: number,
  controller: ReadableStreamDefaultController,
  isFallback: boolean
): Promise<GenerationResult> {
  const maxTokens = isFallback ? CONFIG.MAX_TOKENS_FALLBACK : CONFIG.MAX_TOKENS;
  let fullContent = '';
  let lastProgressUpdate = Date.now();
  let lastHeartbeat = Date.now();
  let heartbeatInterval: NodeJS.Timeout | null = null;

  try {
    // Start heartbeat to keep connection alive
    heartbeatInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastHeartbeat > CONFIG.HEARTBEAT_INTERVAL) {
        try {
          controller.enqueue(encodeStreamMessage({ type: 'heartbeat' }));
          lastHeartbeat = now;
        } catch {
          // Stream closed, will be handled by outer catch
          if (heartbeatInterval) clearInterval(heartbeatInterval);
        }
      }
    }, CONFIG.HEARTBEAT_INTERVAL);

    // Initialize API stream
    const stream = await openrouter.chat.send({
      chatRequest: {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        stream: true,
        temperature: 0.5,
        maxTokens,
        topP: 0.95,
      },
    });

    const streamStartTime = Date.now();
    let chunkCount = 0;
    let lastChunkTime = Date.now();

    // Process stream chunks
    for await (const chunk of stream) {
      // Check for total timeout
      if (Date.now() - streamStartTime > CONFIG.STREAM_TIMEOUT) {
        throw new Error('Stream timeout: exceeded 5 minutes');
      }

      // Check for chunk timeout (no data for 30 seconds)
      if (Date.now() - lastChunkTime > CONFIG.CHUNK_TIMEOUT) {
        throw new Error('Stream stalled: no data received for 30 seconds');
      }

      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullContent += content;
        lastChunkTime = Date.now();
        chunkCount++;

        // Stream content to client
        try {
          controller.enqueue(encodeStreamMessage({ type: 'content', content }));
        } catch {
          // Client disconnected, continue accumulating
          console.warn('[generate-code] Client disconnected during stream');
        }

        // Periodic progress updates
        const now = Date.now();
        if (now - lastProgressUpdate > 3000) {
          const validation = validateGeneratedContent(fullContent);
          try {
            controller.enqueue(encodeStreamMessage({
              type: 'progress',
              message: `Generating... (${validation.fileCount} files, ~${validation.estimatedTokens} tokens)`,
              fileCount: validation.fileCount,
              isComplete: validation.isComplete,
              attempt: attempt + 1,
              maxAttempts: CONFIG.MAX_RETRIES + 1,
              model: isFallback ? `${model} (fallback)` : model,
            }));
          } catch {
            // Client disconnected
          }
          lastProgressUpdate = now;
        }
      }
    }

    if (heartbeatInterval) clearInterval(heartbeatInterval);

    const validation = validateGeneratedContent(fullContent);

    // Validate result
    if (fullContent.length === 0) {
      throw new Error('Empty response from API');
    }

    if (!validation.isValid && !isFallback && attempt < CONFIG.MAX_RETRIES) {
      throw new Error(`Incomplete generation: ${validation.issues.join(', ')}`);
    }

    return {
      content: fullContent,
      success: validation.isValid || fullContent.length > CONFIG.MIN_CONTENT_LENGTH,
      usedFallback: isFallback,
      model,
      validation,
    };

  } catch (error) {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    throw error;
  }
}

// ============================================================================
// REQUEST HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  // Validate request format
  let parsedBody: GenerationRequest;
  try {
    const body = await request.json();
    const validation = validateGenerationRequest(body);

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    parsedBody = validation.data!;
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid request body: must be valid JSON',
      },
      { status: 400 }
    );
  }

  const { prompt, scrapedContent, model = PRIMARY_MODEL, isChat = false } = parsedBody;
  const systemPrompt = isChat ? SYSTEM_PROMPT_CHAT : SYSTEM_PROMPT_GENERATION;

  // Build user prompt
  let userPrompt: string;
  if (isChat) {
    userPrompt = `Generate 6 files. STOP after these files.

REQUIRED FILES:
1. src/App.jsx - Imports and renders Header, Hero, Content, Footer
2. src/components/Header.jsx - Navigation (100+ lines, MUST render visible content)
3. src/components/Hero.jsx - Hero section (200+ lines, MUST have visible headline, CTA, content)
4. src/components/Content.jsx - All sections (300+ lines: Features, About, Portfolio, Testimonials, Contact)
5. src/components/Footer.jsx - Footer (80+ lines, visible links)
6. src/index.css - Complete CSS with Tailwind + Google Fonts

CRITICAL - PAGE MUST RENDER (NOT BLANK):
- Every component MUST return visible JSX content (not empty divs)
- Hero MUST have: headline text, subtitle text, at least 2 CTA buttons
- Content.jsx MUST have 5-8 sections with real content (text, images placeholders, cards)
- All text must be actual content (NOT "Lorem ipsum")
- Check: Are you returning <div></div> or <></>? ADD CONTENT INSIDE.
- Check: Is your component just imports? ADD the actual JSX content.

RULES:
- NO react-router-dom
- Single-page with anchor navigation (#section-id)
- STOP after 6 files

USER REQUEST:
${prompt}`;
  } else {
    // Analyze scraped content quality
    const contentLength = scrapedContent?.length || 0;
    const hasMinimalContent = contentLength < 500;
    const hasSufficientStructure = /header|nav|hero|section|footer/i.test(scrapedContent || '');

    let guidanceText = '';
    if (hasMinimalContent || !hasSufficientStructure) {
      guidanceText = `

⚠️ GUIDANCE: Limited source material detected

The scraped content is minimal or lacks clear structure. Follow this strategy:

1. Choose ONE aesthetic direction: Refined Minimalism | Editorial Magazine | Bold Modern | Soft Playful
2. Use sophisticated prebuilt component patterns instead of generic layouts
3. Pick distinctive Google Fonts (NOT Inter, Roboto, Arial, Open Sans)
4. Create visual rhythm through varied spacing, asymmetry, and intentional design
5. Add ONE memorable element that makes the design unforgettable

Avoid AI slop outputs: no cyan/purple gradients, no centered everything, no cookie-cutter cards.`;
    }

    userPrompt = `Generate a complete React application that recreates this website.

${prompt}

Source Website Content:
${scrapedContent}

Requirements:
- Generate 8-14 files: App.jsx, Header.jsx, Hero.jsx, Content.jsx, Footer.jsx, index.css, plus pages/*.jsx for multi-page routing
- Every file MUST be complete and runnable
- NO truncation, NO "continue..." comments
- Verify: Count closing </file> tags - must be 8-14
${guidanceText}`;
  }

  // Create streaming response
  const readable = new ReadableStream({
    async start(controller) {
      let finalContent = '';
      let finalResult: GenerationResult | null = null;
      let attemptedModels: string[] = [];

      try {
        // Try primary model with retries
        for (let attempt = 0; attempt <= CONFIG.MAX_RETRIES; attempt++) {
          try {
            controller.enqueue(encodeStreamMessage({
              type: 'status',
              message: `Generating code with ${model} (attempt ${attempt + 1}/${CONFIG.MAX_RETRIES + 1})...`,
              attempt: attempt + 1,
              maxAttempts: CONFIG.MAX_RETRIES + 1,
            }));

            const result = await generateWithRetry(
              model as ModelId,
              systemPrompt,
              userPrompt,
              attempt,
              controller,
              false
            );

            attemptedModels.push(model);
            finalContent = result.content;
            finalResult = result;
            break;

          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            console.error(`[generate-code] Attempt ${attempt + 1} failed with ${model}:`, errorMsg);

            if (attempt < CONFIG.MAX_RETRIES) {
              const delayMs = CONFIG.RETRY_DELAY_BASE * Math.pow(CONFIG.RETRY_BACKOFF_MULTIPLIER, attempt);
              controller.enqueue(encodeStreamMessage({
                type: 'status',
                message: `Generation interrupted. Retrying in ${(delayMs / 1000).toFixed(1)}s...`,
                error: errorMsg,
                attempt: attempt + 1,
              }));
              await sleep(delayMs);
            } else {
              controller.enqueue(encodeStreamMessage({
                type: 'status',
                message: 'Primary model exhausted. Trying fallback models...',
              }));
            }
          }
        }

        // Try fallback models if primary failed
        if (!finalResult || !finalResult.success) {
          for (const fallbackModel of MODEL_FALLBACK_CHAIN) {
            if (attemptedModels.includes(fallbackModel)) continue;

            try {
              controller.enqueue(encodeStreamMessage({
                type: 'status',
                message: `Trying fallback model: ${fallbackModel}...`,
              }));

              const result = await generateWithRetry(
                fallbackModel,
                systemPrompt,
                userPrompt,
                0,
                controller,
                true
              );

              attemptedModels.push(fallbackModel);

              if (result.success || result.content.length > CONFIG.WARN_CONTENT_LENGTH) {
                finalContent = result.content;
                finalResult = result;
                break;
              }
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : 'Unknown error';
              console.error(`[generate-code] Fallback ${fallbackModel} failed:`, errorMsg);
            }
          }
        }

        // Attempt content recovery if needed
        if (finalContent && !validateGeneratedContent(finalContent).isValid) {
          const recovered = attemptContentRecovery(finalContent);
          if (recovered.length > finalContent.length * 0.9) {
            finalContent = recovered;
          }
        }

        // Send final result
        if (finalContent && finalContent.length > CONFIG.MIN_CONTENT_LENGTH) {
          const validation = validateGeneratedContent(finalContent);
          const modelUsed = finalResult?.model || model;
          const usedFallback = finalResult?.usedFallback || false;

          controller.enqueue(encodeStreamMessage({
            type: 'status',
            message: `✓ Code generation complete (${validation.fileCount} files)${usedFallback ? ' [fallback]' : ''}`,
            fileCount: validation.fileCount,
            usedFallback,
            model: modelUsed,
          }));

          controller.enqueue(encodeStreamMessage({
            type: 'complete',
            fullContent: finalContent,
            fileCount: validation.fileCount,
            validation,
            usedFallback,
            modelUsed,
            attemptedModels,
          }));
        } else {
          const validation = validateGeneratedContent(finalContent);
          controller.enqueue(encodeStreamMessage({
            type: 'error',
            error: 'Failed to generate complete code after exhausting all models',
            issues: validation.issues,
            fileCount: validation.fileCount,
            attemptedModels,
            partialContent: finalContent.slice(-500),
          }));
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('[generate-code] Fatal error:', errorMsg);

        controller.enqueue(encodeStreamMessage({
          type: 'error',
          error: errorMsg,
          fatal: true,
        }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Content-Type-Options': 'nosniff',
      'X-Accel-Buffering': 'no',
    },
  });
}
