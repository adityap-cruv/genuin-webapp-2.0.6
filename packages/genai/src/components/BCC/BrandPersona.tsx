import type { BrandPersonaData } from '@/types';

interface BrandPersonaProps {
    jsonData?: BrandPersonaData;
    messageId?: string;
}

const BrandPersona: React.FC<BrandPersonaProps> = ({ jsonData }) => {
    if (!jsonData || Object.keys(jsonData).length === 0) {
        return (
            <>
                {/* no brand persona found */}
                <div className='gai:flex gai:w-full gai:flex-col gai:overflow-hidden gai:rounded-xl gai:border gai:border-[#E6ECFF]'>
                    <div className='gai:flex gai:h-9 gai:items-center gai:justify-center gai:border-b gai:border-[#E6ECFF] gai:bg-[#F7F9FF] gai:px-4 gai:py-2'>
                        <span className='gai:text-sm gai:font-medium gai:text-[#3B3E40]'>No brand persona found</span>
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
    //         await insertBrandDetails(jsonData);

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
    //         toast.success('Brand persona inserted successfully');
    //         window.dispatchEvent(
    //             new CustomEvent('genai:onboardingStepUpdate', {
    //                 detail: { step: 'brand_persona' },
    //             })
    //         );
    //     } catch (error) {
    //         toast.error('Failed to insert brand persona');
    //     } finally {
    //         setIsInserting(false);
    //     }
    // };

    // Transform the API data into display format
    const personaData = [
        {
            headline: 'Mission',
            content: jsonData.mission,
        },
        {
            headline: 'Vision',
            content: jsonData.vision,
        },
        {
            headline: 'Values',
            content: jsonData.values.join('\n'),
        },
        {
            headline: 'Policies',
            content: jsonData.policies,
        },
        {
            headline: 'Procedures',
            content: jsonData.procedures,
        },
        {
            headline: 'Working Conditions',
            content: jsonData.working_conditions,
        },
        {
            headline: 'Code of Conduct/Behavioral Expectations',
            content: jsonData.code_of_conduct,
        },
        {
            headline: "Do's",
            content: jsonData.dos.join('\n'),
        },
        {
            headline: "Don'ts",
            content: jsonData.donts.join('\n'),
        },
    ];

    // Helper function to render content as list or text
    const renderContent = (headline: string, content: string) => {
        const isListType = headline === 'Values' || headline === "Do's" || headline === "Don'ts";

        if (isListType) {
            const items = content.split('\n').filter(item => item.trim());
            return (
                <ul className='gai:list-inside gai:list-disc gai:space-y-1 gai:self-stretch gai:font-body-1-med gai:text-secondary-gray-900'>
                    {items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                    ))}
                </ul>
            );
        }

        return (
            <p className='gai:self-stretch gai:font-body-1-med gai:whitespace-pre-line gai:text-secondary-gray-900'>
                {content}
            </p>
        );
    };

    return (
        <div className='gai:flex gai:w-full gai:max-w-[920px] gai:flex-col gai:items-start gai:gap-4'>
            {/* Persona Cards */}
            {personaData
                .filter(item => item.content && item.content.trim())
                .map((item, index) => (
                    <div
                        key={index}
                        className='gai:box-border gai:flex gai:w-full gai:flex-col gai:items-start gai:gap-4 gai:self-stretch gai:rounded-xl gai:border gai:border-secondary-gray-150 gai:bg-white gai:p-3 gai:pr-3 gai:pl-4'
                    >
                        {/* Card Headline */}
                        <span className='gai:font-body-1-bold gai:text-secondary-gray-900'>{item.headline}</span>

                        {/* Card Content */}
                        {renderContent(item.headline, item.content)}
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

export default BrandPersona;
