import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from '@/components/ui/select';
import { useAgentContext } from '@/stores/agent/context';
import { useSessionContext } from '@/stores/session/context';
import type { AgentType } from '@/types';

import AgentsDropdownSkeleton from './skeleton';

const AgentsDropdown = () => {
    const { filteredAgents: agents, setCurrentAgent, currentAgent, isMaya } = useAgentContext();
    const { enteredInChatMode } = useSessionContext();

    // Find the current agent object
    if (isMaya) {
        agents.push({
            type: 'maya' as AgentType,
            id: 'maya',
            name: 'Maya',
            description: 'Maya is a chatbot that can help you with your questions.',
            image: 'https://ds-dataset-rvc.s3.us-west-2.amazonaws.com/agents/sub_agents/maya.png',
        });
    }
    const currentAgentObj = agents.find(agent => agent.id === currentAgent);

    if (!currentAgentObj) {
        return <AgentsDropdownSkeleton />;
    }

    const showChevron = !isMaya && enteredInChatMode;

    return (
        <Select
            value={currentAgent}
            onValueChange={value => {
                if (showChevron) {
                    setCurrentAgent(value);
                }
            }}
            // open={true}
            open={showChevron ? undefined : false}
        >
            <SelectTrigger
                className='gai:box-shadow gai:flex gai:items-center gai:gap-2 gai:rounded-full gai:border gai:border-primary-100 gai:bg-utility-white gai:p-1 gai:pr-2 gai:outline-none'
                style={{ cursor: showChevron ? 'pointer' : 'default' }}
                showChevron={showChevron}
            >
                <SelectValue>
                    <div className='gai:flex gai:h-8 gai:w-8 gai:items-center gai:justify-center'>
                        <img
                            src={currentAgentObj.image}
                            alt={`${currentAgentObj.name} Avatar`}
                            className='gai:h-full gai:w-full gai:rounded-full gai:object-cover'
                            loading='lazy'
                            decoding='async'
                        />
                    </div>
                    <span className='gai:font-body-1-semi gai:text-secondary-gray-900'>{currentAgentObj.name}</span>
                </SelectValue>
            </SelectTrigger>
            {showChevron && (
                <SelectContent className='gai:box-shadow gai:z-[9999] gai:w-[330px] gai:rounded-2xl gai:border gai:border-primary-100 gai:bg-white gai:p-1 gai:px-0'>
                    <div className='gai:agents-dropdown-scrollbar gai:px-1'>
                        {agents.map(agent => (
                            <SelectItem
                                key={agent.id}
                                value={agent.id}
                                className='gai:flex gai:cursor-pointer gai:items-center gai:rounded-xl gai:px-3 gai:py-2 gai:transition-colors gai:outline-none gai:hover:bg-gray-100 gai:focus:bg-primary-50'
                            >
                                <div className='gai:flex gai:flex-col gai:gap-2'>
                                    <div className='gai:flex gai:items-center gai:justify-between'>
                                        <div className='gai:flex gai:items-center gai:justify-center gai:gap-2'>
                                            <img
                                                src={agent.image}
                                                alt={`${agent.name} Avatar`}
                                                className='gai:h-8 gai:w-8 gai:rounded-full gai:object-cover'
                                                loading='lazy'
                                                decoding='async'
                                                referrerPolicy='no-referrer'
                                            />
                                            <span className='gai:font-body-1-semi gai:text-secondary-gray-900'>
                                                {agent.name}
                                            </span>
                                        </div>
                                        <div className='gai:flex gai:items-center gai:gap-2'>
                                            {agent.id === currentAgent && (
                                                <span className='gai:self-end gai:rounded-md gai:border gai:border-primary-100 gai:px-2 gai:py-0.5 gai:font-body-2-med gai:text-primary-300'>
                                                    Current
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className='gai:font-body-2-med gai:text-secondary-gray-700'>
                                        {agent.description}
                                    </p>
                                </div>
                            </SelectItem>
                        ))}
                    </div>
                </SelectContent>
            )}
        </Select>
    );
};

export default AgentsDropdown;
