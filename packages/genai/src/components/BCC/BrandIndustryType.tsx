import type { BrandIndustryTypeData } from '@/types';
import React from 'react';

interface BrandIndustryTypeProps {
    jsonData?: BrandIndustryTypeData;
    messageId?: string;
}

const BrandIndustryType: React.FC<BrandIndustryTypeProps> = ({ jsonData }) => {
    if (
        !jsonData ||
        Object.keys(jsonData).length === 0 ||
        (jsonData.industry_type === undefined &&
            jsonData.bussiness_category === undefined &&
            jsonData.traffic_range === undefined)
    ) {
        return (
            <>
                {/* no brand industry type found */}
                <div className='gai:flex gai:w-full gai:flex-col gai:overflow-hidden gai:rounded-xl gai:border gai:border-[#E6ECFF]'>
                    <div className='gai:flex gai:h-9 gai:items-center gai:justify-center gai:border-b gai:border-[#E6ECFF] gai:bg-[#F7F9FF] gai:px-4 gai:py-2'>
                        <span className='gai:text-sm gai:font-medium gai:text-[#3B3E40]'>
                            No brand industry type found
                        </span>
                    </div>
                </div>
            </>
        );
    }
    // const [isInserting, setIsInserting] = useState(false);
    // const [inserted, setInserted] = useState(jsonData?.inserted || false);
    // const { updateAgentMessageContent, currentSessionId } = useAgentsContext();

    // const handleInsert = async () => {
    //     if (!jsonData) return;

    //     setIsInserting(true);
    //     try {
    //         await insertBrandIndustryType(jsonData);

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
    //         toast.success('Brand industry type inserted successfully');
    //         window.dispatchEvent(
    //             new CustomEvent('genai:onboardingStepUpdate', {
    //                 detail: { step: 'brand_industry_type' },
    //             })
    //         );
    //     } catch (error) {
    //         toast.error('Failed to insert brand industry type');
    //     } finally {
    //         setIsInserting(false);
    //     }
    // };

    // Helper function to safely get string value
    const getStringValue = (value: any): string | undefined => {
        if (typeof value === 'string') {
            return value;
        }
        if (typeof value === 'object' && value !== null) {
            // If it's an object, try to get a meaningful string representation
            // For industry_type object like { industry: 132 }, return the industry number as string
            return Object.values(value)
                .filter(v => v !== null && v !== undefined)
                .join(', ');
        }
        if (typeof value === 'number') {
            return String(value);
        }
        return undefined;
    };

    const categories = [
        { headline: 'Industry Type', value: getStringValue(jsonData.industry_type) },
        { headline: 'Business Category', value: getStringValue(jsonData.bussiness_category) },
        { headline: 'Traffic Range', value: getStringValue(jsonData.traffic_range) },
    ].filter(item => item.value); // Only show items that have values

    return (
        <div className='gai:flex gai:w-full gai:max-w-[920px] gai:flex-col gai:items-start gai:gap-4'>
            {/* Header */}
            <div className='gai:flex gai:flex-col gai:items-start gai:gap-4 gai:self-stretch'>
                <span className='gai:text-secondary-500 gai:font-body-1-bold'>Headline</span>
                <span className='gai:self-stretch gai:font-body-1-med gai:text-secondary-gray-900'>
                    Industry type, business category, and traffic range have been identified. Your brand is eligible to
                    launch and build media network.
                </span>
            </div>

            {/* Category Cards */}
            {categories.map((category, index) => (
                <div
                    key={index}
                    className='gai:flex gai:flex-col gai:items-start gai:gap-4 gai:self-stretch gai:rounded-xl gai:border gai:border-secondary-gray-150 gai:bg-white gai:p-3 gai:pr-3 gai:pl-4'
                >
                    {/* Headline */}
                    <span className='gai:text-secondary-500 gai:font-body-1-bold'>{category.headline}</span>

                    {/* Value */}
                    <span className='gai:self-stretch gai:font-body-1-med gai:text-secondary-gray-900'>
                        {category.value}
                    </span>
                </div>
            ))}

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

export default BrandIndustryType;
