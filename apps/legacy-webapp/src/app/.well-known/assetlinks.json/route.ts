import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Get the API URL from the header that was set in middleware
  const apiUrl = request.headers.get('x-assetlinks-api-url')

  if (!apiUrl) {
    return NextResponse.json({ error: 'API URL not found' }, { status: 500 })
  }

  try {
    // Fetch the assetlinks.json content from the API
    console.log('Fetching assetlinks.json from:', apiUrl)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(apiUrl, {
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`API responded with status: ${response.status} for assetlinks.json`)
      throw new Error(`API responded with status: ${response.status}`)
    }

    // Get the content from the API response
    let content
    const contentType = response.headers.get('content-type')

    if (contentType && contentType.includes('application/json')) {
      content = await response.json()
      // Return the content with the proper JSON content type
      return NextResponse.json(content, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      })
    } else {
      // Handle as text if not JSON
      content = await response.text()
      try {
        // Try to parse as JSON anyway
        const jsonContent = JSON.parse(content)
        return NextResponse.json(jsonContent, {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        })
      } catch (e) {
        // If it's not valid JSON, return as plain text
        return new NextResponse(content, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
          },
        })
      }
    }
  } catch (error) {
    console.error('Error fetching assetlinks.json:', error)
    // Return an empty array with 200 status if the API is having issues
    // This prevents issues with Android app linking verification
    return NextResponse.json([], {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    })
  }
}
