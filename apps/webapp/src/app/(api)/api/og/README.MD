# 🖼️ OG Image API Route

## Overview

This API route dynamically generates **Open Graph (OG) images** for meta tags used in social sharing.  
It integrates with **Bunny CDN** for caching and performance optimization, ensuring OG images are served efficiently and quickly.

---

## 🔄 Workflow

1. **When a web page includes an `og:image` meta tag**, the image URL points to the Bunny CDN endpoint in the following format:

   ```
   https://<bunny-cdn-domain>/api/og/<brandId>/<type>/<slug>
   ```

2. **Bunny CDN Handling:**
   - Bunny first checks if the image exists in its cache for the requested path.
   - If found → Bunny serves the cached image immediately.
   - If not found → Bunny forwards the request to our **Web App OG Image API** to generate the image.

3. **Web App OG Image API:**
   - The request is handled by the route:
     ```
     /api/og/[brandId]/[type]/[slug]
     ```
   - The API:
     - Validates that `brandId` and `type` are **numeric** values.
     - Validates that `type` is **numeric** values.
     - If any validation fails → returns:
       ```http
       HTTP 404 Not Found
       ```
     - Generates an OG image conditionally based on the brand and type.
     - Uses brand/type-specific HTML templates to render the OG image.
     - Responds with the generated image:
       ```
       Content-Type: image/png
       ```
   - Bunny CDN then **caches the generated image** for future requests.

4. **Subsequent Requests:**
   - Any later requests for the same URL are **served directly from Bunny’s cache**, without hitting the API again.

---

## 🧩 Template Structure

All OG image templates are stored inside the `/template` folder, organized by brand and type with shared components.

```
/template
│
├── shared/                    # Shared components used across all templates
│   ├── layout.tsx            # Base layout with common styling
│   ├── typography.tsx        # Text styling components
│   └── elements/             # Reusable UI elements
│       ├── avatar.tsx
│       ├── badge.tsx
│       └── card.tsx
│
├── profile.tsx              # Type 1: Default profile template
├── community.tsx            # Type 2: Default community template
├── group.tsx               # Type 3: Default group template
├── video.tsx               # Type 4: Default video template
│
├── 1729/                    # Brand-specific templates (example)
│   ├── video.tsx           # Custom video template for brand 1729
│   └── profile.tsx         # Custom profile template for brand 1729
│
└── brandB/                  # Another brand's templates
    ├── profile.tsx          # Custom profile template for brandB
    └── community.tsx        # Custom community template for brandB
```

### Template Components

1. **Default Templates (`/template/`)**

   ```typescript
   // profile.tsx - Default profile template
   import { PlayIcon } from './components'

   export function ProfileTemplate({ data }: ProfileData) {
     return (
       <div>
         <PlayIcon />
         <h1>{data.name}</h1>
       </div>
     )
   }
   ```

2. **Brand-Specific Templates (`/template/[brandId]/`)**

   ```typescript
   // 1729/video.tsx - Custom video template

   export function VideoTemplate({ data }: VideoData) {
     return (
       <div>
         <video poster={data.thumbnail} />
         <div className="overlay">
           {data.title}
         </div>
       </div>
     )
   }
   ```

### 🧱 Template Selection Logic

The template selection follows a hierarchical approach:

1. **Custom Response Handler**

   ```typescript
   // handlers/shared-og-handler.ts
   if (options.getCustomResponse) {
     const { shouldHandle, response } = await options.getCustomResponse(params, data)
     if (shouldHandle && response) return response
   }
   ```

2. **Brand-Specific Template**
   - Looks for template in brand folder:
     ```
     /template/<brandId>/<type>.tsx
     ```
   - Example: `/template/1729/video.tsx`

3. **Default Template Fallback**
   - Uses default template if no brand-specific one exists:
     ```
     /template/<type>.tsx
     ```
   - Example: `/template/profile.tsx`

### 🎨 Creating New Templates

1. **Add Components** (if needed)

   ```typescript
   // template/components/myComponent.tsx
   export function MyComponent({ props }) {
     return <div className="my-component">...</div>
   }
   ```

2. **Create Brand-Specific Template**

   ```typescript
   // template/myBrand/profile.tsx
   import { SharedLayout } from '../shared/layout'
   import { MyComponent } from '../shared/elements/myComponent'

   export function ProfileTemplate({ data }) {
     return (
       <div>
         <MyComponent {...data} />
         <div>...</div>
       </div>
     )
   }
   ```

3. **Add Custom Response Handler**
   ```typescript
   // myBrand/handlers.ts
   export async function getCustomResponse(params, data) {
     if (params.type === 1) { // Profile type
       return {
         shouldHandle: true,
         response: new ImageResponse(
           <ProfileTemplate data={data} />,
           { width: 1200, height: 630 }
         )
       }
     }
     return { shouldHandle: false, response: null }
   }
   ```

---

## ⚙️ Supported Types

| Type | Name      | Description                  |
| ---- | --------- | ---------------------------- |
| `1`  | Profile   | OG image for user profiles   |
| `2`  | Community | OG image for community pages |
| `3`  | Group     | OG image for group pages     |
| `4`  | Video     | OG image for video pages     |

> Any request with a `type` outside of `1–4` will return **404 Not Found**.

### 🖼️ Preview Image Handling

For type `4` (Video), the API supports an additional feature to fetch and return a specific preview image:

1. **Preview Image Flow**:

   ```
   /api/og/[brandId]/4/[slug]?share_image_id=123
   ```

   When `share_image_id` is provided in the URL:
   - The API includes it in the `og_meta_data` request
   - Backend returns a `preview_image` URL in the response
   - If `preview_image` exists, it's fetched and returned directly
   - If fetch fails, falls back to default video template

2. **Example Usage**:

   ```
   /api/og/101/4/my-video?share_image_id=123
   ```

3. **API Response Flow**:

   ```javascript
   // 1. og_meta_data response includes preview_image
   {
     code: 200,
     data: {
       preview_image: "https://example.com/image.png",
       // ... other video data
     }
   }

   // 2. API fetches and returns the preview_image directly
   HTTP/1.1 200 OK
   Content-Type: image/png
   ```

4. **Fallback Behavior**:
   - If `preview_image` URL is missing → Uses default video template
   - If image fetch fails → Uses default video template
   - If `share_image_id` is not provided → Uses default video template

---

## 🧩 Route Structure

| Path                              | Description                                                     |
| --------------------------------- | --------------------------------------------------------------- |
| `/api/og/[brandId]/[type]/[slug]` | Default OG image route handler                                  |
| `/api/og/[brandId]/`              | (Optional) Brand-specific route for handling custom brand logic |
| `/api/og/`                        | Root route for handling default fallback logic                  |

### Example URLs and Validation

| Example URL                                 | Valid? | Description                                          |
| ------------------------------------------- | ------ | ---------------------------------------------------- |
| `/api/og/101/1/john-doe`                    | ✅ Yes | Valid: Integer brandId (101), type (1), string slug  |
| `/api/og/101/4/123456`                      | ✅ Yes | Valid: Integer brandId (101), type (4), numeric slug |
| `/api/og/101/4/intro-video`                 | ✅ Yes | Valid: Integer brandId (101), type (4), string slug  |
| `/api/og/101/4/my-video?share_image_id=123` | ✅ Yes | Valid: With optional share_image_id parameter        |
| `/api/og/abc/3/my-group`                    | ❌ No  | Invalid: Non-integer brandId                         |
| `/api/og/101/5/test`                        | ❌ No  | Invalid: Type not between 1-4                        |
| `/api/og/101/1/`                            | ❌ No  | Invalid: Missing slug                                |
| `/api/og/101/`                              | ❌ No  | Invalid: Missing type and slug                       |

---

## 🚫 URL Parameters and Validation

### Required Parameters

All OG image URLs **must** include these three parameters in the path:

```
/api/og/:brandId/:type/:slug
```

| Parameter | Required | Type    | Description                          |
| --------- | -------- | ------- | ------------------------------------ |
| `brandId` | ✅ Yes   | Integer | Brand identifier                     |
| `type`    | ✅ Yes   | Integer | Content type (1-4)                   |
| `slug`    | ✅ Yes   | String  | Resource identifier (string/integer) |

### Validation Rules

Before generating or serving an image, the API validates the parameters:

| Parameter | Validation Rules                              | On Failure      |
| --------- | --------------------------------------------- | --------------- |
| `brandId` | • Must be present in URL                      | `404 Not Found` |
|           | • Must be a valid integer (`!isNaN(brandId)`) | `404 Not Found` |
| `type`    | • Must be present in URL                      | `404 Not Found` |
|           | • Must be a valid integer (`!isNaN(type)`)    | `404 Not Found` |
|           | • Must be between `1–4`                       | `404 Not Found` |
| `slug`    | • Must be present in URL                      | `404 Not Found` |
|           | • Can be string or integer                    | N/A             |
|           | • Cannot be empty                             | `404 Not Found` |

---

## 🧠 Caching Behavior

- **First Request:**  
  Image is dynamically generated by the API → returned to Bunny CDN → cached.
- **Subsequent Requests:**  
  Bunny serves the cached image directly without re-calling the API.
- **Cache Invalidation (optional):**  
  If an image needs regeneration (e.g., after content changes), Bunny cache can be manually purged.

---

## 🧰 Response Examples

### ✅ Success (Default Template)

```
HTTP/1.1 200 OK
Content-Type: image/png
Cache-Control: public, max-age=31536000
```

### ✅ Success (Preview Image)

```
HTTP/1.1 200 OK
Content-Type: image/png
Cache-Control: public, max-age=31536000
```

### ❌ Invalid Parameters

```
HTTP/1.1 404 Not Found
Content-Type: application/json
{
  "error": "Invalid brandId or type"
}
```

### ❌ Preview Image Fetch Failed

```
HTTP/1.1 200 OK
Content-Type: image/png
Cache-Control: public, max-age=31536000
// Falls back to default video template
```

---

## 🪄 Notes

- Designed for **SEO and social media sharing previews**.
- Supports **dynamic brand-specific customization**.
- **Extendable** — new brands or view templates can easily be added to `/template`.
- **Highly cache-efficient** using **Bunny CDN** integration.
- Only supports `type` values from **1 to 4** (Profile, Community, Group, Video).
