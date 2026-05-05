import React from 'react';

import type { BrandGuidelinesData } from '@/types';

interface BrandGuidelinesProps {
    jsonData?: BrandGuidelinesData;
    messageId?: string;
}

const BrandGuidelines: React.FC<BrandGuidelinesProps> = ({ jsonData }) => {
    if (!jsonData || !jsonData.guidelines || jsonData.guidelines.length === 0) {
        return (
            <>
                {/* no brand guidelines found */}
                <div className='gai:flex gai:w-full gai:flex-col gai:overflow-hidden gai:rounded-xl gai:border gai:border-[#E6ECFF]'>
                    <div className='gai:flex gai:h-9 gai:items-center gai:justify-center gai:border-b gai:border-[#E6ECFF] gai:bg-[#F7F9FF] gai:px-4 gai:py-2'>
                        <span className='gai:text-sm gai:font-medium gai:text-[#3B3E40]'>
                            No brand guidelines found
                        </span>
                    </div>
                </div>
            </>
        );
    }

    // const [isInserting, setIsInserting] = useState(false);
    // const [inserted, setInserted] = useState(jsonData?.inserted || false);
    // const { updateAgentMessageContent, currentSessionId } = useAgentsContext();

    if (!jsonData || !jsonData.guidelines || jsonData.guidelines.length === 0) {
        return null;
    }

    // const handleInsert = async () => {
    //     if (!jsonData) return;

    //     setIsInserting(true);
    //     try {
    //         await insertBrandGuidelines(jsonData);

    //         // Update the agent message with inserted: true
    //         if (messageId && currentSessionId) {
    //             const updatedJsonData = { ...jsonData, inserted: true };
    //             const updatedContent = JSON.stringify(updatedJsonData);

    //             await updateAgentMessage({
    //                 chat_id: messageId,
    //                 agent_message: updatedContent,
    //             });

    //             // Update the message in local state
    //             updateAgentMessageContent(currentSessionId, messageId, updatedContent);
    //         }

    //         setInserted(true);
    //         toast.success('Brand guidelines inserted successfully');
    //         window.dispatchEvent(
    //             new CustomEvent('genai:onboardingStepUpdate', {
    //                 detail: { step: 'brand_guidelines' },
    //             })
    //         );
    //     } catch (error) {
    //         toast.error('Failed to insert brand guidelines');
    //     } finally {
    //         setIsInserting(false);
    //     }
    // };

    return (
        <div className='gai:flex gai:w-full gai:max-w-[920px] gai:flex-col gai:gap-4'>
            <div className='gai:flex gai:w-full gai:flex-col gai:items-start gai:gap-4 gai:rounded-xl gai:border gai:border-secondary-gray-150 gai:bg-white gai:p-3 gai:pr-3 gai:pl-4'>
                {/* Guidelines List */}
                {jsonData.guidelines.map((guideline, index) => (
                    <div key={index} className='gai:flex gai:w-full gai:flex-col gai:items-start gai:gap-2'>
                        {/* Title */}
                        <span className='gai:font-body-1-bold gai:text-secondary-gray-900'>
                            {index + 1}. {guideline.title}
                        </span>
                        {/* Description */}
                        <span className='gai:font-body-2-med gai:text-secondary-gray-900'>{guideline.description}</span>
                    </div>
                ))}
            </div>

            {/* Insert Button or Inserted Text */}
            {/* <div className='gai:flex gai:w-full gai:justify-end'>
                {inserted ? (
                    <span className='gai:font-body-1-med gai:text-primary-500'>Inserted</span>
                ) : (
                    <Button
                        onClick={handleInsert}
                        disabled={isInserting}
                        className='gai:hover:bg-primary-600 gai:bg-primary-500 gai:text-white'
                    >
                        {isInserting ? 'Inserting...' : 'Insert'}
                    </Button>
                )}
            </div> */}
        </div>
    );
};

export default BrandGuidelines;
