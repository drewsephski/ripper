import { NextRequest, NextResponse } from 'next/server';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

async function scrapeWithRetry(url: string, attempt = 1): Promise<any> {
  const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
  
  if (!FIRECRAWL_API_KEY) {
    throw new Error('FIRECRAWL_API_KEY environment variable is not set');
  }

  try {
    console.log(`[scrape-screenshot] Attempt ${attempt}/${MAX_RETRIES} for: ${url}`);
    
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url,
        formats: ['screenshot'],
        waitFor: 5000,
        timeout: 45000,
        blockAds: true,
        actions: [
          { type: 'wait', milliseconds: 3000 },
          { type: 'screenshot', fullPage: false }
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

    // Get screenshot from either direct field or actions result
    const screenshot = data.data.screenshot || data.data.actions?.screenshots?.[0];
    
    if (!screenshot) {
      throw new Error('No screenshot captured');
    }

    return {
      success: true,
      screenshot,
      metadata: data.data.metadata || {},
      url
    };

  } catch (error: any) {
    console.error(`[scrape-screenshot] Attempt ${attempt} failed:`, error.message);
    
    // Retry logic
    if (attempt < MAX_RETRIES) {
      console.log(`[scrape-screenshot] Retrying in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return scrapeWithRetry(url, attempt + 1);
    }
    
    // Final failure after all retries
    throw new Error(`Failed after ${MAX_RETRIES} attempts: ${error.message}`);
  }
}

export async function POST(request: NextRequest) {
  try {
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

    console.log('[scrape-screenshot] Starting screenshot capture for:', normalizedUrl);

    const result = await scrapeWithRetry(normalizedUrl);
    
    console.log('[scrape-screenshot] Successfully captured screenshot');

    return NextResponse.json({
      success: true,
      screenshot: result.screenshot,
      metadata: result.metadata,
      url: normalizedUrl,
      message: 'Screenshot captured successfully'
    });

  } catch (error: any) {
    console.error('[scrape-screenshot] Final error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to capture screenshot after multiple attempts'
    }, { status: 500 });
  }
}
