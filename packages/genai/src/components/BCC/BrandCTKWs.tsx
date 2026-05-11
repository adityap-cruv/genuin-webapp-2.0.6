import React, { useState } from 'react';

import { EditUserMessage } from '@/components/Chat/EditUserMessage';
import { useAgentsContext } from '@/context/app/context';
import type { BrandCTKWsData, Category } from '@/types';

interface BrandCTKWsProps {
    jsonData?: BrandCTKWsData;
    messageId?: string;
}

interface CategoryCardProps {
    category: Category;
    selected: boolean;
    onToggleSelect: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, selected, onToggleSelect }) => {
    const borderClass = selected
        ? category.inserted
            ? 'gai:border-secondary-gray-500' // selected + inserted -> dark grey
            : 'gai:border-primary-500' // selected + not inserted -> blue
        : 'gai:border-secondary-gray-150'; // not selected -> light grey

    const containerClasses = [
        'gai:flex',
        'gai:cursor-pointer',
        'gai:flex-col',
        'gai:items-start',
        'gai:gap-4',
        'gai:rounded-xl',
        'gai:border',
        borderClass,
        selected ? 'gai:bg-primary-25' : 'gai:bg-white',
        'gai:p-3',
        'gai:pr-3',
        'gai:pl-4',
    ].join(' ');

    return (
        <div onClick={onToggleSelect} className={containerClasses}>
            {/* Header: Select + Category Title */}
            <div className='gai:flex gai:w-full gai:items-center gai:justify-between gai:gap-2'>
                <div className='gai:flex gai:items-center gai:gap-2'>
                    <input
                        disabled={category.inserted}
                        type='checkbox'
                        checked={category.inserted || selected}
                        className='focus:gai:ring-2 focus:gai:ring-[#0645FF] focus:gai:ring-offset-0 gai:h-4 gai:w-4 gai:cursor-pointer gai:rounded gai:border-[#CBD5E0] gai:text-[#0645FF]'
                    />
                    <span className='gai:font-body-1-bold gai:text-secondary-gray-900'>{category.name}</span>
                </div>
            </div>

            {category.topics.map((topic, idx) => (
                <div
                    key={idx}
                    className='gai:flex gai:flex-col gai:items-start gai:justify-center gai:gap-4 gai:self-stretch gai:rounded-xl gai:border gai:border-[#DEE2E6] gai:bg-white gai:p-3'
                >
                    {/* Topic Name */}
                    <span className='gai:self-stretch gai:font-body-3-med gai:text-secondary-gray-900'>
                        {topic.name}
                    </span>

                    {/* Keywords Section */}
                    <div className='gai:flex gai:flex-col gai:items-start gai:gap-2 gai:self-stretch'>
                        <span className='gai:font-body-3-med gai:text-secondary-gray-600'>Keywords</span>
                        <span className='gai:self-stretch gai:font-body-3-med gai:text-secondary-gray-900'>
                            {topic.keywords.join(', ')}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

const BrandCTKWs: React.FC<BrandCTKWsProps> = ({ jsonData, messageId }) => {
    // const [isInserting, setIsInserting] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
    const [regenerationPrompt, setRegenerationPrompt] = useState<string>('');
    const [showRegeneratePrompt, setShowRegeneratePrompt] = useState(false);
    const { currentSessionId, handleSendMessage, agents } = useAgentsContext();

    if (!jsonData || !jsonData.categories || jsonData.categories.length === 0) {
        return (
            <>
                {/* no categories found */}
                <div className='gai:flex gai:w-full gai:flex-col gai:overflow-hidden gai:rounded-xl gai:border gai:border-[#E6ECFF]'>
                    <div className='gai:flex gai:h-9 gai:items-center gai:justify-center gai:border-b gai:border-[#E6ECFF] gai:bg-[#F7F9FF] gai:px-4 gai:py-2'>
                        <span className='gai:text-sm gai:font-medium gai:text-[#3B3E40]'>No categories found</span>
                    </div>
                </div>
            </>
        );
    }

    const categories = jsonData.categories;

    const toggleCategorySelection = (name: string) => {
        const category = categories.find(cat => cat.name === name);
        if (!category) return;

        if (category.inserted) {
            return;
        }

        setSelectedCategories(prev => {
            const next = new Set(prev);
            if (next.has(name)) {
                next.delete(name);
            } else {
                next.add(name);
            }
            return next;
        });
    };

    // const handleBulkInsert = async () => {
    //     if (!jsonData) return;

    //     const toInsert = jsonData.categories.filter(cat => selectedCategories.has(cat.name));
    //     if (toInsert.length === 0) {
    //         return;
    //     }

    //     setIsInserting(true);
    //     try {
    //         const payload: { categories: Category[] } = {
    //             categories: toInsert,
    //         };
    //         await insertCTKWs(payload);
    //         // clear the selected categories
    //         setSelectedCategories(new Set());

    //         if (messageId && currentSessionId) {
    //             const updatedCategories = categories.map(cat =>
    //                 selectedCategories.has(cat.name) ? { ...cat, inserted: true } : cat
    //             );
    //             const updatedJsonData: BrandCTKWsData = {
    //                 ...jsonData,
    //                 categories: updatedCategories,
    //             };
    //             const updatedContent = JSON.stringify(updatedJsonData);

    //             await updateAgentMessage({
    //                 chat_id: messageId,
    //                 agent_message: updatedContent,
    //             });

    //             updateAgentMessageContent(currentSessionId, messageId, updatedContent);
    //         }

    //         toast.success('Selected categories inserted successfully');
    //         window.dispatchEvent(
    //             new CustomEvent('genai:onboardingStepUpdate', {
    //                 detail: { step: 'brand_ctkws' },
    //             })
    //         );
    //     } catch (error) {
    //         toast.error('Failed to insert selected categories');
    //     } finally {
    //         setIsInserting(false);
    //     }
    // };

    const handleBulkRegenerate = () => {
        const selected = Array.from(selectedCategories);
        if (selected.length === 0) return;

        // mark selected categories as regenerating locally
        const regeneratingCategories = categories.filter(
            cat => selectedCategories.has(cat.name) && !cat.regenerating && !cat.inserted
        );
        if (regeneratingCategories.length === 0) return;

        const context = categories.filter(cat => !regeneratingCategories.map(c => c.name).includes(cat.name));

        handleSendMessage({
            targetSessionId: currentSessionId,
            messageInput: regenerationPrompt,
            agent_id: agents.find(a => a.id === '695cefa2c19e333c687787f4')?.id,
            editedChatId: messageId || null,
            metadata: {
                context: JSON.stringify(context),
                to_regenerate: JSON.stringify(regeneratingCategories),
            },
        });
    };

    // const handleOpenRegeneratePrompt = () => {
    //     if (!hasSelection) return;
    //     setShowRegeneratePrompt(true);
    // };

    const handleCancelRegeneration = () => {
        setShowRegeneratePrompt(false);
        setRegenerationPrompt('');
    };

    const handleSubmitRegeneration = () => {
        handleBulkRegenerate();
        setShowRegeneratePrompt(false);
        setRegenerationPrompt('');
    };

    // const hasSelection = selectedCategories.size > 0;

    return (
        <div className='gai:flex gai:w-full gai:flex-col gai:gap-4'>
            <div className='gai:grid gai:w-full gai:grid-cols-2 gai:items-start gai:gap-4'>
                {categories.map((category, idx) => (
                    <CategoryCard
                        key={category.name + idx}
                        category={category}
                        selected={selectedCategories.has(category.name)}
                        onToggleSelect={() => toggleCategorySelection(category.name)}
                    />
                ))}
            </div>

            {/* Global actions */}
            {/* <div className='gai:flex gai:w-full gai:items-center gai:justify-between'>
                <span className='gai:text-sm gai:font-medium gai:text-secondary-gray-600'>
                    {selectedCategories.size} selected
                </span>
                <div className='gai:flex gai:items-center gai:gap-2'>
                    <Button
                        variant='outline'
                        disabled={!hasSelection}
                        onClick={handleOpenRegeneratePrompt}
                        className='gai:flex gai:items-center gai:gap-1 gai:text-secondary-gray-900'
                    >
                        <RegenerateIcon width={16} height={16} />
                        Regenerate
                    </Button>
                    <Button
                        onClick={handleBulkInsert}
                        disabled={!hasSelection || isInserting}
                        className='gai:hover:bg-primary-600 gai:bg-primary-500 gai:text-white'
                    >
                        {isInserting ? 'Inserting...' : 'Insert'}
                    </Button>
                </div>
            </div> */}

            {showRegeneratePrompt && (
                <div className='gai:sticky gai:bottom-0 gai:w-full gai:rounded-xl gai:border gai:border-secondary-gray-150 gai:bg-white gai:p-4 gai:shadow-sm'>
                    <EditUserMessage
                        value={regenerationPrompt}
                        onChange={setRegenerationPrompt}
                        onCancel={handleCancelRegeneration}
                        onSubmit={handleSubmitRegeneration}
                    />
                </div>
            )}
        </div>
    );
};

export default BrandCTKWs;
