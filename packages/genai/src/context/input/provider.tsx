import React, { useState, type ReactNode } from 'react';

import { InputContext } from './context';

interface InputProviderProps {
    children: ReactNode;
}

export const InputProvider: React.FC<InputProviderProps> = ({ children }) => {
    const [input, setInput] = useState<string>('');

    const contextValue = {
        input,
        setInput,
    };

    return <InputContext.Provider value={contextValue}>{children}</InputContext.Provider>;
};
