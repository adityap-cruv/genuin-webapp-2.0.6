import { useAgentContext } from '@/stores/agent/context';
import { useUIContext } from '@/stores/ui/context';
import type { Agent } from '@/types';

const AgentPill = ({ agents }: { agents: Agent[] }) => {
    const { setCurrentAgent } = useAgentContext();
    const { showAllObjectives } = useUIContext();
    return agents.map(agent => (
        <div
            key={agent.id}
            className={`gai:box-shadow gai:hidden gai:cursor-pointer gai:items-center gai:gap-1 gai:rounded-full gai:border gai:border-primary-100 gai:bg-utility-white gai:p-1 gai:pr-3 gai:font-body-1-semi gai:text-secondary-gray-900 gai:select-none gai:hover:border-primary-200 ${showAllObjectives && 'gai:md:flex'}`}
            onClick={() => setCurrentAgent(agent.id)}
        >
            <img className='gai:h-8 gai:w-8 gai:rounded-full gai:object-cover' src={agent.image} />
            <span>{agent.name}</span>
        </div>
    ));
};

export default AgentPill;
