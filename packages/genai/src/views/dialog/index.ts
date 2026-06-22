import type { ViewModule } from '../types';

import { DialogView } from './DialogView';

const mod: ViewModule = {
    name: 'dialog',
    Shell: DialogView,
    mountStrategy: { kind: 'auto-container', className: 'genai-sdk-container' },
};

export default mod;
