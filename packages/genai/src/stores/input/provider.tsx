import { useState, type ReactNode } from 'react';

import { InputContext } from './context';

interface InputProviderProps {
    children: ReactNode;
}

export function InputProvider({ children }: InputProviderProps) {
    const [input, setInput] = useState<string>('');
    return <InputContext.Provider value={{ input, setInput }}>{children}</InputContext.Provider>;
}
