import type { ViewModule } from '../types';

import { PageView } from './PageView';

const mod: ViewModule = {
    name: 'page',
    Shell: PageView,
    mountStrategy: { kind: 'inline-container' },
};

export default mod;
