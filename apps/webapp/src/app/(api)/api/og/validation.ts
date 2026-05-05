// Function to validate request URL parameters for OG image generation
export function validateRequestUrl({ type, slug, brandId }: { type: any; slug: any; brandId: any }) {
  if (!slug || !type) {
    return Response.json({ error: "Bad Request" }, { status: 400 });
  }

  if (isNaN(Number(type))) {
    return Response.json({ error: 'Invalid "type": must be a valid integer' }, { status: 400 });
  }

  if (isNaN(Number(brandId))) {
    return Response.json({ error: 'Invalid "brandId": must be a valid integer' }, { status: 400 });
  }

  // If valid, return null (no errors)
  return null;
}
