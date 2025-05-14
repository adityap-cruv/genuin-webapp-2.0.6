import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Get the API URL from the header that was set in middleware
  const apiUrl = request.headers.get('x-robots-api-url')

  if (!apiUrl) {
    return NextResponse.json({ error: 'API URL not found' }, { status: 500 })
  }

  try {
    // Fetch the robots.txt content from the API
    console.log('Fetching robots.txt from:', apiUrl)
    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    // Get the content from the API response
    const text = await response.text()

    // Return the content with the proper content type
    return new NextResponse(text, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error fetching robots.txt:', error)
    return NextResponse.json({ error: 'Failed to fetch robots.txt' }, { status: 500 })
  }
}
