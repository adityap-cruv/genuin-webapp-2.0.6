import { useAgentsContext } from '@/context/app/context';
import Objectives from '../Objectives';

const AgentIntro = () => {
    const { currentAgent, agents } = useAgentsContext();
    const currentAgentObj = agents.find(agent => agent.id === currentAgent);
    if (!currentAgentObj) return null;
    return (
        <div className='gai:flex gai:w-full gai:max-w-5xl gai:flex-col gai:items-center gai:gap-[72px] gai:py-10'>
            {/* photo+name+description */}
            <div className='gai:flex gai:flex-col gai:items-center gai:gap-6'>
                <div className='gai:flex gai:flex-col gai:items-center gai:justify-center gai:gap-4'>
                    <img
                        className='gai:h-16 gai:w-16 gai:rounded-full gai:object-cover'
                        src={currentAgentObj?.image}
                        alt={currentAgentObj?.name}
                    />
                    <span className='gai:text-center gai:font-headline-4-semi gai:text-secondary-gray-900 gai:md:font-headline-3-semi'>
                        {currentAgentObj.name}
                    </span>
                    <span className='gai:font-body-1-med gai:text-secondary-gray-500'>By Genuin AI</span>
                    <span className='gai:text-center gai:font-body-1-med gai:text-secondary-gray-900'>
                        {currentAgentObj.description}
                    </span>
                </div>
            </div>
            {/* greeting + objectives */}
            <div className='gai:flex gai:w-full gai:flex-col gai:items-center gai:gap-3'>
                <span className='gai:text-center gai:font-headline-4-semi gai:text-secondary-gray-900 gai:md:font-headline-2-semi'>
                    {currentAgentObj.question}
                </span>
                <Objectives />
            </div>
        </div>
    );
};

export default AgentIntro;
