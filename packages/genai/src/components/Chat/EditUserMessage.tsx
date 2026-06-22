import React from 'react';

import { Button } from '../ui/button';

interface EditUserMessageProps {
    value: string;
    onChange: (value: string) => void;
    onCancel: () => void;
    onSubmit: () => void;
}

export const EditUserMessage: React.FC<EditUserMessageProps> = ({ value, onChange, onCancel, onSubmit }) => {
    return (
        <div className='gai:flex gai:w-full gai:flex-col gai:gap-2'>
            <textarea
                className='gai:max-h-[160px] gai:w-full gai:resize-none gai:overflow-y-auto gai:border-0 gai:bg-transparent gai:text-base gai:text-secondary-gray-900 gai:outline-0'
                rows={3}
                value={value}
                onChange={e => onChange(e.target.value)}
            />
            <div className='gai:flex gai:justify-end gai:gap-2'>
                <Button variant='outline' size='sm' className='gai:h-8 gai:px-3' onClick={onCancel}>
                    Cancel
                </Button>
                <Button size='sm' className='gai:h-8 gai:px-3' onClick={onSubmit} disabled={!value.trim()}>
                    Send
                </Button>
            </div>
        </div>
    );
};
