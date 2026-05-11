const FALLBACK_GENAI_ASSETS_BASE_URL = 'https://media.begenuin.com/webapp_assets/assets/genai/';

const memoisedBaseUrl = (() => {
    const envValue = import.meta.env.VITE_GENAI_ASSETS_BASE_URL;
    const trimmed = typeof envValue === 'string' ? envValue.trim() : '';
    const base = trimmed.length > 0 ? trimmed : FALLBACK_GENAI_ASSETS_BASE_URL;
    return base.endsWith('/') ? base : `${base}/`;
})();

type LottieAsset = {
    p?: unknown;
    u?: unknown;
    [key: string]: unknown;
};

type LottieJson = {
    assets?: unknown;
    [key: string]: unknown;
};

const lottieCache = new Map<string, LottieJson>();
const pendingRequests = new Map<string, Promise<LottieJson>>();

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function sanitiseAssetPath(path: string) {
    return path
        .replace(/^\/+/u, '')
        .replace(/^(\.\/)+/u, '')
        .replace(/^(\.\.\/)+/u, '');
}

function normaliseLottieAssets(rawData: LottieJson, imagesBaseUrl: string): LottieJson {
    const normalisedAssets = Array.isArray(rawData.assets)
        ? (rawData.assets as unknown[]).map(assetCandidate => {
              if (!isObject(assetCandidate)) {
                  return assetCandidate;
              }

              const asset = assetCandidate as LottieAsset;
              const path = asset.p;

              if (typeof path !== 'string') {
                  return assetCandidate;
              }

              if (path.startsWith('data:') || path.startsWith('http')) {
                  return assetCandidate;
              }

              const assetFolder = typeof asset.u === 'string' && asset.u.length > 0 ? asset.u : '';
              const combined = sanitiseAssetPath(`${assetFolder}${path}`);
              const absoluteUrl = new URL(combined, imagesBaseUrl).toString();

              return {
                  ...asset,
                  u: '',
                  p: absoluteUrl,
              };
          })
        : rawData.assets;

    return {
        ...rawData,
        assets: normalisedAssets,
    };
}

function buildCacheKey(animationPath: string, imagesPath: string) {
    return `${animationPath}::${imagesPath}`;
}

function resolveAnimationUrl(relativePath: string) {
    return new URL(relativePath, memoisedBaseUrl).toString();
}

export function getCachedRemoteLottie(animationPath: string, imagesPath: string): LottieJson | null {
    const key = buildCacheKey(animationPath, imagesPath);
    return lottieCache.get(key) ?? null;
}

export async function loadRemoteLottie(animationPath: string, imagesPath: string): Promise<LottieJson> {
    const key = buildCacheKey(animationPath, imagesPath);

    if (lottieCache.has(key)) {
        return lottieCache.get(key)!;
    }

    if (pendingRequests.has(key)) {
        return pendingRequests.get(key)!;
    }

    const animationUrl = resolveAnimationUrl(animationPath);
    const imagesBaseUrl = resolveAnimationUrl(imagesPath);

    const request: Promise<LottieJson> = fetch(animationUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load Lottie animation: ${animationUrl}`);
            }
            return response.json();
        })
        .then((data: unknown) => {
            if (!isObject(data)) {
                throw new Error('Lottie animation response must be an object');
            }
            const normalised = normaliseLottieAssets(data as LottieJson, imagesBaseUrl);
            lottieCache.set(key, normalised);
            return normalised;
        })
        .finally(() => {
            pendingRequests.delete(key);
        });

    pendingRequests.set(key, request);

    return request;
}
