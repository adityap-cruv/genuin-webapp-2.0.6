import { X } from 'lucide-react';
import type { Agent } from '@/types';

interface AgentChipsProps {
    agents: Agent[];
    currentAgentId: string;
    onSelectAgent: (agentId: string) => void;
}

export function AgentChips({ agents, currentAgentId, onSelectAgent }: AgentChipsProps) {
    return (
        <div className='gai:flex gai:items-center gai:gap-2 gai:overflow-x-auto gai:scrollbar-hide'>
            {/* Agent chips */}
            {agents.map(agent => {
                const isSelected = agent.id === currentAgentId;
                return (
                    <div
                        key={agent.id}
                        onClick={() => onSelectAgent(agent.id)}
                        className='gai:flex gai:flex-shrink-0 gai:cursor-pointer gai:items-center gai:gap-1 gai:rounded-full gai:border gai:border-primary-100 gai:bg-white gai:transition-colors hover:gai:bg-primary-50'
                        style={{
                            maxWidth: '156px',
                            paddingTop: '2px',
                            paddingBottom: '2px',
                            paddingLeft: '4px',
                            paddingRight: isSelected ? '4px' : '8px'
                        }}
                    >
                        <img
                            src={agent.image}
                            alt={agent.name}
                            className='gai:h-6 gai:w-6 gai:flex-shrink-0 gai:rounded-full gai:object-cover'
                        />
                        <span className='gai:flex-1 gai:truncate gai:text-sm gai:font-normal gai:text-secondary-gray-600'>
                            {agent.name}
                        </span>
                        {isSelected && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                                className='gai:flex gai:h-5 gai:w-5 gai:flex-shrink-0 gai:items-center gai:justify-center gai:text-secondary-gray-600 gai:transition-colors hover:gai:text-secondary-gray-900'
                                title={`Selected ${agent.name}`}
                            >
                                <X className='gai:h-5 gai:w-5' />
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
