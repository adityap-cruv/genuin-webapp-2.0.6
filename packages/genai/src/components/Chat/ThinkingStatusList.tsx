import type { ThinkingStep } from '@/types';

interface ThinkingStatusListProps {
    steps: ThinkingStep[];
}

const ThinkingStatusList = ({ steps }: ThinkingStatusListProps) => {
    if (!steps || steps.length === 0) return null;

    return (
        <div className='gai:flex gai:max-w-xs gai:flex-col gai:gap-2'>
            {steps.map(step => (
                <div key={step.id} className='gai:flex gai:items-start gai:gap-2'>
                    <span className='gai:mt-1 gai:h-1.5 gai:w-1.5 gai:flex-shrink-0 gai:rounded-full gai:bg-primary-500' />
                    <div className='gai:flex-1'>
                        <p className='gai:font-body-2-med gai:text-[12px] gai:text-secondary-gray-700'>{step.title}</p>
                        {step.detail && (
                            <p
                                className='gai:text-[11px] gai:text-secondary-gray-500'
                                style={{
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                }}
                            >
                                {step.detail}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ThinkingStatusList;
