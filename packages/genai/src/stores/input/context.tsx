import { createContext, useContext } from 'react';

interface InputContextType {
    input: string;
    setInput: (input: string) => void;
}

export const InputContext = createContext<InputContextType | undefined>(undefined);

export const useInputContext = () => {
    const context = useContext(InputContext);
    if (context === undefined) {
        throw new Error('useInputContext must be used within an InputProvider');
    }
    return context;
};
