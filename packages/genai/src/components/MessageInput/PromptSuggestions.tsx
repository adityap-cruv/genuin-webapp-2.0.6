import { useEffect, useRef } from 'react';

import { useAgentsContext } from '@/context/app/context';
import { useInputContext } from '@/context/input/context';

const PromptSuggestions = ({
    brands,
    setIsSuggestionsOpen,
}: {
    brands: string[];
    setIsSuggestionsOpen: (isSuggestionsOpen: boolean) => void;
}) => {
    const { enteredInChatMode, showAllObjectives } = useAgentsContext();
    const { input, setInput } = useInputContext();
    const suggestionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setIsSuggestionsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div
            ref={suggestionsRef}
            className={`gai:absolute gai:right-0 ${showAllObjectives ? 'gai:top-full gai:bottom-auto gai:mt-3' : 'gai:bottom-full gai:mb-3'} gai:left-0 gai:border-0 ${enteredInChatMode ? 'gai:bg-utility-white' : 'gai:bg-primary-50'}`}
        >
            {brands.map((brand, index) => (
                <div
                    key={index}
                    className={`gai:cursor-pointer gai:border-b gai:border-b-secondary-gray-150 gai:px-4 gai:py-3 gai:font-body-1-med gai:text-secondary-gray-900 gai:last:border-b-0 ${enteredInChatMode ? 'gai:hover:bg-primary-50' : 'gai:hover:bg-primary-100'}`}
                    onClick={() => {
                        setInput(input + ' ' + brand);
                        setIsSuggestionsOpen(false);
                    }}
                >
                    <span className='gai:text-secondary-gray-500'>{input + ' '}</span>
                    <span className='gai:text-secondary-gray-900'>{brand}</span>
                </div>
            ))}
        </div>
    );
};

export default PromptSuggestions;
