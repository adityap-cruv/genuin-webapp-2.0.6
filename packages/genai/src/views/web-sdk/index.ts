import type { ViewModule } from '../types';

import { WebSdkView } from './WebSdkView';

const mod: ViewModule = {
    name: 'web-sdk',
    Shell: WebSdkView,
    mountStrategy: { kind: 'inline-container' },
};

export default mod;
