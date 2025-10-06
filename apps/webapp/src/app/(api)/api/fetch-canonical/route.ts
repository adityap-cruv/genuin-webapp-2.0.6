import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route to fetch canonical URL from a given URL.
 * Used to bypass CORS restrictions.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    // Fetch HTML from target URL
    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Genuin/1.0)' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json({ canonicalUrl: null });
    }

    const html = await response.text();

    // Extract canonical URL
    const match = 
      html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i) ||
      html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i);

    return NextResponse.json({
      canonicalUrl: match?.[1] || null,
    });

  } catch (error) {
    console.error('Fetch canonical error:', error);
    return NextResponse.json({ canonicalUrl: null });
  }
}
