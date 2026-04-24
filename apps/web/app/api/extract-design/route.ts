import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const VISION_SYSTEM_PROMPT = `You are an expert visual design analyst specializing in extracting detailed design specifications from website screenshots. Your task is to analyze the provided screenshot and extract precise design information that can be used to recreate the website with exceptional visual quality.

## DESIGN DIRECTION ANALYSIS
First, identify the overall design approach:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Is it brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, or industrial/utilitarian?
- **Differentiation**: What makes this design UNFORGETTABLE? What's the one visual element someone will remember?

## EXTRACT THE FOLLOWING:

=== COLOR PALETTE ===
- Primary colors (exact hex codes - be precise)
- Secondary colors (exact hex codes)
- Accent colors (exact hex codes)
- Background colors (exact hex codes)
- Text colors (exact hex codes)
- ANY gradients (exact hex codes, direction, stops)
- **AVOID AI SLOP COLORS**: Note if design uses cyan-on-dark, purple-to-blue gradients, neon accents on dark, or gradient text on metrics
- Check if neutrals are tinted toward a brand hue (not pure gray)
- NEVER use pure black (#000) or pure white (#fff) - note if design uses tinted blacks/whites

=== TYPOGRAPHY ===
- Font families detected (be SPECIFIC - exact font names if identifiable)
- **Font pairings**: Display font + body font combination
- Font sizes for different elements (headings H1-H6, body, captions, etc.)
- Font weights (light, normal, medium, semibold, bold)
- Line heights (tight, normal, relaxed)
- Letter spacing if visible (tracking-tight, tracking-wide, etc.)
- **AVOID AI SLOP FONTS**: Note if using Inter, Roboto, Arial, Open Sans (overused defaults)
- Look for distinctive font choices that make the design memorable
- Check if monospace is used as lazy "technical" shorthand

=== LAYOUT STRUCTURE ===
- Overall layout pattern (grid, flex, container-based, asymmetric, broken-grid, etc.)
- Section breakdown (hero, navigation, content, footer, sidebar, etc.)
- **Spacing rhythm**: Varied spacing (tight groupings vs generous separations) or monotonous?
- **SPACING SCALE TO USE**: 4px, 8px, 16px, 24px, 32px, 48px, 64px, 96px
- Container widths and max-width constraints (px or rem values)
- Column structures and grid layouts (note exact grid configurations like 'grid-cols-3 gap-6')
- **Section padding**: Note vertical padding between sections (e.g., 'py-24' = 96px)
- **Card padding**: Note internal spacing within cards (e.g., 'p-8' = 32px)
- **AVOID AI SLOP LAYOUTS**: Note if design relies on:
  - Identical card grids repeated endlessly
  - Hero metric layout template (big number, small label, supporting stats, gradient accent)
  - Everything centered (left-aligned often feels more designed)
  - Cards inside cards (visual noise)

=== COMPONENTS ===
- Navigation bar style and layout (sticky, fixed, transparent, glassmorphism?)
- Hero section composition (what makes it distinctive?)
- Card/grid layouts (are cards identical or varied?)
- Button styles (primary, secondary, ghost - are they varied?)
- Form elements (inputs, selects, checkboxes, radio buttons)
- Any distinctive UI components (what's UNIQUE here?)
- **Check for generic elements**: Rounded rectangles with generic drop shadows, thick colored borders on one side

=== VISUAL EFFECTS ===
- **Shadows**: Note specific shadow intensities:
  - Small: shadow-sm (subtle, 0 1px 2px)
  - Medium: shadow-md/shadow-lg (cards, 0 4px 6px to 0 10px 15px)
  - Large: shadow-xl/shadow-2xl (modals, hero elements, 0 20px 25px to 0 25px 50px)
  - Colored: shadow-[color]/20 (tinted shadows for depth)
- Rounded corners (exact radius: none, sm(2px), md(6px), lg(8px), xl(12px), 2xl(16px), 3xl(24px), full)
- Borders (thickness: 1px, 2px, 4px; style: solid, dashed; note exact colors)
- Gradients (colors, direction: to-r, to-b, to-br, to-tr; type: linear, radial)
- **Glassmorphism** (backdrop-blur: sm, md, lg, xl; bg-opacity: 80, 90, 95)
- **AVOID DECORATIVE EFFECTS**: Note if using:
  - Glassmorphism everywhere without purpose
  - Sparklines as decoration
  - Rounded elements with thick colored border on one side
  - Modals used unnecessarily

=== MOTION & INTERACTION ===
- Detect any animations (subtle entrance, hover effects, transitions)
- Animation style (fade, slide, scale, stagger)
- **Micro-interactions to detect**:
  - Button hover: scale(1.02), slight shadow increase, color shift
  - Card hover: translateY(-4px), shadow-xl, 200-300ms transition
  - Link hover: underline animation, color change, opacity shift
  - Focus states: visible rings, outline styles
- Interaction patterns (progressive disclosure, hover reveals)
- **Easing functions**: Linear, ease-out, ease-in-out, or custom cubic-bezier
- **Transition durations**: Fast(150ms), normal(300ms), slow(500ms)
- Hover states on interactive elements
- Loading states or skeleton screens

=== THEME ===
- Light mode, dark mode, or both
- Overall aesthetic style (minimal, bold, playful, professional, editorial, brutalist, luxury, etc.)
- Color temperature (warm, cool, neutral)
- **AI SLOP TEST**: If you said "AI made this," would they believe you immediately? If yes, the design has AI slop fingerprints.

=== RESPONSIVE DESIGN ===
- Mobile vs desktop differences visible?
- Breakpoint behavior
- How does layout adapt? (don't just shrink, actually adapt)

=== COMPONENT PATTERN RECOMMENDATIONS ===
Based on the design analysis above, recommend specific component patterns:

**Header Pattern:**
- Recommended: [Floating Glass / Asymmetric Bold / Editorial Magazine]
- Reasoning: Why this pattern fits the design direction

**Hero Pattern:**
- Recommended: [Split Asymmetric / Typographic Bold / Editorial Magazine / Product Showcase / Minimalist Center]
- Reasoning: Why this pattern captures the design's essence

**Content Pattern:**
- Recommended: [Bento Grid / Numbered Features / Editorial Article / Testimonial Cards]
- Reasoning: How this pattern fits the content structure

**Footer Pattern:**
- Recommended: [Newsletter / Editorial / Minimal]
- Reasoning: Why this pattern completes the design

**Design Direction Summary:**
- Style: [minimal / bold / editorial / playful / luxury / technical]
- Color Scheme: [light / dark / warm / cool / vibrant]
- Typography: [serif / sans / mixed / display]
- Complexity: [simple / moderate / complex]

Provide this information in a clear, structured format that can be easily parsed and used for code generation. Be as specific and detailed as possible with measurements, color values, and design intent. Focus on what makes this design DISTINCTIVE and MEMORABLE.

If the screenshot is incomplete, blurry, or shows minimal content, explicitly state this and recommend the FALLBACK DESIGN SYSTEM approach from the refined minimalism, editorial magazine, bold modern, or soft playful directions.`;

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({
        success: false,
        error: 'Image URL is required'
      }, { status: 400 });
    }

    // Use direct API call for vision model - Gemini Flash for image analysis
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-lite-preview',
        messages: [
          {
            role: 'system',
            content: VISION_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this website screenshot and extract detailed design specifications including colors, typography, layout, components, and visual effects. Be as specific as possible with measurements and color values.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vision API error: ${errorText}`);
    }

    const data = await response.json();
    const designAnalysis = data.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      designAnalysis,
      model: 'google/gemini-3.1-flash-lite-preview'
    });

  } catch (error) {
    console.error('[extract-design] Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
