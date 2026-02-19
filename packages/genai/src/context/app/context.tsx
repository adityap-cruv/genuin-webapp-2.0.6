import { createContext, useContext } from 'react';
import type { AgentsContextType } from './types';

export const AgentsContext = createContext<AgentsContextType | undefined>(undefined);

export const useAgentsContext = () => {
    const context = useContext(AgentsContext);
    if (context === undefined) {
        throw new Error('useAgentsContext must be used within a AgentsContextProvider');
    }
    return context;
};

export type { AgentsContextType, VideoStyle, VideoStyleOption } from './types';
