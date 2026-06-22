import { SDKLifecycle, type SDKConfig } from './core/SDKLifecycle';
import './styles/index.css';

const lifecycle = new SDKLifecycle();

export function init(config: SDKConfig) {
    return lifecycle.init(config);
}

export function destroy() {
    lifecycle.destroy();
}

export function setWebSdkRenderMode(mode: 'compact' | 'full') {
    lifecycle.setWebSdkRenderMode(mode);
}

// Attach to window for script tag usage
if (typeof window !== 'undefined') {
    (window as any).GenAISDK = {
        init,
        destroy,
        setWebSdkRenderMode,
    };
}
