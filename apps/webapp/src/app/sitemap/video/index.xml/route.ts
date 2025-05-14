import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Get the API URL from the header that was set in middleware
  const apiUrl = request.headers.get('x-sitemap-video-api-url')

  if (!apiUrl) {
    return NextResponse.json({ error: 'API URL not found' }, { status: 500 })
  }

  try {
    // Fetch the sitemap content from the API
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, 5000) // 5 second timeout
    console.log('Fetching sitemap from:', apiUrl)
    const response = await fetch(apiUrl, {
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    // Get the content from the API response
    const text = await response.text()

    // Return the content with the proper XML content type for sitemaps
    return new NextResponse(text, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    })
  } catch (error) {
    // Return a minimal valid sitemap XML with 200 status if the API is having issues
    const fallbackSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`

    return new NextResponse(fallbackSitemapXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    })
  }
}
