/**
 * LoadIframeIntoDiv function loads an iframe into a specified div element.
 * @param targetDiv - The target div element.
 * @param iframeSrc - The source URL for the iframe.
 */
function loadIframeIntoDiv(targetDiv: HTMLElement, iframeSrc: string): void {
  // Check if the div exists
  if (targetDiv) {
    // Create an iframe element
    const iframeElement = document.createElement('iframe')

    // Set attributes for the iframe
    iframeElement.src = iframeSrc // Set your iframe source URL
    iframeElement.width = '100%'
    iframeElement.height = '100%'
    iframeElement.frameBorder = '0'
    iframeElement.scrolling = 'no'
    iframeElement.allow = 'clipboard-read; clipboard-write;'

    // Style the iframe to make it blend with the parent page
    iframeElement.style.border = 'none'
    iframeElement.style.overflow = 'hidden'

    // Clear existing content in the div
    targetDiv.innerHTML = ''

    // Append the iframe to the specified div
    targetDiv.appendChild(iframeElement)
  } else {
    console.error('Div with ID', targetDiv, 'not found.')
  }
}

export default loadIframeIntoDiv
