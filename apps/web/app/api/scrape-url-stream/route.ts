import { NextRequest, NextResponse } from 'next/server';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

// Function to sanitize smart quotes and problematic characters
function sanitizeQuotes(text: string): string {
  return text
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u00AB\u00BB]/g, '"')
    .replace(/[\u2039\u203A]/g, "'")
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2026]/g, '...')
    .replace(/[\u00A0]/g, ' ');
}

// Function to extract visual design information from HTML
function extractVisualDesign(html: string): string {
  const design: string[] = [];

  // Extract colors from inline styles and CSS
  const colorMatches = html.match(/(?:color|background|bg-):\s*([^;)}]+)/gi);
  if (colorMatches) {
    const uniqueColors = Array.from(new Set(colorMatches.map(c => c.split(':')[1]?.trim()))).filter(Boolean);
    if (uniqueColors.length > 0) {
      design.push(`Colors detected: ${uniqueColors.slice(0, 10).join(', ')}`);
    }
  }

  // Extract font families
  const fontMatches = html.match(/font-family:\s*([^;)}]+)/gi);
  if (fontMatches) {
    const uniqueFonts = Array.from(new Set(fontMatches.map((f) => f.split(':')[1]?.trim().replace(/['"]/g, '')))).filter((f) => Boolean(f));
    if (uniqueFonts.length > 0) {
      design.push(`Fonts: ${uniqueFonts.slice(0, 5).join(', ')}`);
    }
  }

  // Extract Google Fonts
  const googleFontMatches = html.match(/fonts\.googleapis\.com\/css\?family=([^&"')]+)/gi);
  if (googleFontMatches) {
    const fonts = googleFontMatches.map(f => f.split('family=')[1]?.split('&')[0]?.replace(/\+/g, ' ')).filter(Boolean);
    if (fonts.length > 0) {
      design.push(`Google Fonts: ${fonts.join(', ')}`);
    }
  }

  // Detect layout patterns
  if (html.includes('flex') || html.includes('grid')) {
    design.push('Layout: Modern CSS (Flexbox/Grid detected)');
  }
  if (html.includes('container') || html.includes('wrapper')) {
    design.push('Layout: Container-based layout');
  }
  if (html.includes('hero') || html.includes('banner')) {
    design.push('Sections: Hero/Banner section detected');
  }
  if (html.includes('navbar') || html.includes('header')) {
    design.push('Components: Navigation bar');
  }
  if (html.includes('footer')) {
    design.push('Components: Footer');
  }
  if (html.includes('card') || html.includes('grid')) {
    design.push('Components: Card/Grid layout');
  }

  // Detect color scheme
  const hasDarkMode = html.includes('dark') || html.includes('bg-black') || html.includes('bg-gray-900');
  const hasLightMode = html.includes('bg-white') || html.includes('bg-gray-50');
  if (hasDarkMode && hasLightMode) {
    design.push('Theme: Dark/Light mode support');
  } else if (hasDarkMode) {
    design.push('Theme: Dark theme');
  } else if (hasLightMode) {
    design.push('Theme: Light theme');
  }

  // Detect gradients
  if (html.includes('gradient') || html.includes('linear-gradient') || html.includes('radial-gradient')) {
    design.push('Effects: Gradients used');
  }

  // Detect shadows
  if (html.includes('shadow') || html.includes('box-shadow')) {
    design.push('Effects: Shadows/depth');
  }

  // Detect rounded corners
  if (html.includes('rounded') || html.includes('border-radius')) {
    design.push('Style: Rounded corners');
  }

  return design.length > 0 ? design.join('\n') : 'No specific design patterns detected';
}

async function scrapeWithRetry(
  url: string, 
  sendProgress: (data: any) => void,
  attempt = 1
): Promise<any> {
  const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
  
  if (!FIRECRAWL_API_KEY) {
    throw new Error('FIRECRAWL_API_KEY environment variable is not set');
  }

  try {
    sendProgress({
      type: 'progress',
      stage: 'scraping',
      message: `Scraping website content (attempt ${attempt}/${MAX_RETRIES})...`,
      attempt,
      maxAttempts: MAX_RETRIES
    });

    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url,
        formats: ['markdown', 'html', 'screenshot', 'branding'],
        waitFor: 5000,
        timeout: 45000,
        blockAds: true,
        maxAge: 3600000,
        onlyMainContent: false,
        includeTags: ['style', 'link', 'script', 'meta'],
        actions: [
          { type: 'wait', milliseconds: 3000 },
          { type: 'screenshot', fullPage: true }
        ]
      })
    });

    if (!firecrawlResponse.ok) {
      const errorText = await firecrawlResponse.text();
      throw new Error(`Firecrawl API error (${firecrawlResponse.status}): ${errorText}`);
    }

    const data = await firecrawlResponse.json();

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to scrape website');
    }

    sendProgress({
      type: 'progress',
      stage: 'analyzing',
      message: 'Analyzing website structure and content...'
    });

    const { markdown, metadata, screenshot, actions, html, branding } = data.data;
    const screenshotUrl = screenshot || actions?.screenshots?.[0] || null;
    const sanitizedMarkdown = sanitizeQuotes(markdown || '');
    const title = metadata?.title || '';
    const description = metadata?.description || '';

    // Extract visual design information from HTML
    const visualDesign = extractVisualDesign(html || '');

    // Analyze screenshot with vision model for detailed design extraction
    let visionAnalysis = '';
    if (screenshotUrl) {
      try {
        sendProgress({
          type: 'progress',
          stage: 'vision-analysis',
          message: 'Analyzing visual design with AI...'
        });

        const visionResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/extract-design`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: screenshotUrl })
        });

        if (visionResponse.ok) {
          const visionData = await visionResponse.json();
          if (visionData.success) {
            visionAnalysis = visionData.designAnalysis;
          }
        }
      } catch (error) {
        console.error('[scrape-url-stream] Vision analysis failed:', error);
        // Continue without vision analysis if it fails
      }
    }

    // Format Firecrawl branding data if available
    const brandingAnalysis = branding ? `
Color Scheme: ${branding.colorScheme || 'N/A'}
Primary Colors: ${branding.colors?.primary || 'N/A'}
Secondary Colors: ${branding.colors?.secondary || 'N/A'}
Accent Colors: ${branding.colors?.accent || 'N/A'}
Background: ${branding.colors?.background || 'N/A'}
Text Colors: ${branding.colors?.textPrimary || 'N/A'}
Fonts: ${branding.fonts?.map((f: any) => f.family).join(', ') || 'N/A'}
Typography Scale: ${JSON.stringify(branding.typography?.fontSizes || {})}
Spacing: ${JSON.stringify(branding.spacing || {})}
    `.trim() : 'No branding data available from Firecrawl';

    const formattedContent = `
Title: ${sanitizeQuotes(title)}
Description: ${sanitizeQuotes(description)}
URL: ${url}

=== FIRECRAWL BRANDING ANALYSIS ===
${brandingAnalysis}

=== AI VISION DESIGN ANALYSIS ===
${visionAnalysis || 'No vision analysis available'}

=== HTML-EXTRACTED DESIGN PATTERNS ===
${visualDesign}

=== WEBSITE CONTENT ===
${sanitizedMarkdown}
    `.trim();

    sendProgress({
      type: 'progress',
      stage: 'complete',
      message: 'Website scraped successfully!'
    });

    return {
      success: true,
      url,
      content: formattedContent,
      screenshot: screenshotUrl,
      structured: {
        title: sanitizeQuotes(title),
        description: sanitizeQuotes(description),
        content: sanitizedMarkdown,
        url,
        screenshot: screenshotUrl,
        branding: branding || null
      },
      metadata: {
        scraper: 'firecrawl-stream',
        timestamp: new Date().toISOString(),
        contentLength: formattedContent.length,
        cached: data.data.cached || false,
        ...metadata
      }
    };

  } catch (error: any) {
    console.error(`[scrape-url-stream] Attempt ${attempt} failed:`, error.message);
    
    if (attempt < MAX_RETRIES) {
      sendProgress({
        type: 'progress',
        stage: 'retrying',
        message: `Scraping failed, retrying in ${RETRY_DELAY/1000}s...`,
        error: error.message,
        attempt,
        maxAttempts: MAX_RETRIES
      });
      
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return scrapeWithRetry(url, sendProgress, attempt + 1);
    }
    
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({
      success: false,
      error: 'URL is required'
    }, { status: 400 });
  }

  // Normalize URL
  let normalizedUrl = url.trim();
  if (!normalizedUrl.match(/^https?:\/\//i)) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const sendProgress = (data: any) => {
        try {
          if (controller.desiredSize === null) {
            console.log('[scrape-url-stream] Controller closed, skipping progress update');
            return;
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (error) {
          console.log('[scrape-url-stream] Error sending progress:', error);
        }
      };

      try {
        console.log('[scrape-url-stream] Starting stream for:', normalizedUrl);

        // Send initial progress
        sendProgress({
          type: 'progress',
          stage: 'connecting',
          message: 'Connecting to Firecrawl API...'
        });

        const result = await scrapeWithRetry(normalizedUrl, sendProgress);
        
        // Send success result
        sendProgress({
          type: 'complete',
          data: result
        });

        controller.close();

      } catch (error: any) {
        console.error('[scrape-url-stream] Final error:', error);
        
        try {
          sendProgress({
            type: 'error',
            error: error.message || 'Failed to scrape website after multiple attempts',
            message: 'Failed to scrape website. Please ensure the URL is correct and try again.'
          });
        } catch (sendError) {
          console.log('[scrape-url-stream] Error sending error message:', sendError);
        }

        controller.close();
      }
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
