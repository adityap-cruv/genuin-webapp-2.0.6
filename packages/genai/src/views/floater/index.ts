import type { ViewModule } from '../types';

import { FloaterView } from './FloaterView';
import { loadDraggabillyScript } from './floaterDraggable';

const mod: ViewModule = {
    name: 'floater',
    Shell: FloaterView,
    mountStrategy: { kind: 'floater' },
    onBeforeMount: async config => {
        if (!config.draggable) return;
        try {
            await loadDraggabillyScript();
        } catch (err) {
            console.warn('[GenAI] Failed to load draggabilly, floater will be static:', err);
        }
    },
};

export default mod;
