// Fixed AgentCard Component
import { useState } from 'react';

import { useAgentsContext } from '@/context/app/context';
import type { Agent } from '@/types';

import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';


const AgentCards = ({ agents }: { agents: Agent[] }) => {
    const [focusedAgent, setFocusedAgent] = useState<Agent | null>(null);
    const { setCurrentAgent, showAllObjectives } = useAgentsContext();

    if (agents.length === 0) {
        return Array.from({ length: 4 }).map((_, i) => (
            <div
                key={i}
                className='gai:box-shadow gai:flex gai:min-w-[330px] gai:flex-col gai:items-start gai:gap-3 gai:self-stretch gai:rounded-2xl gai:border gai:border-primary-100 gai:px-4 gai:py-3'
            >
                {/* photo + name + cta skeleton */}
                <div className='gai:flex gai:items-center gai:gap-3 gai:self-stretch'>
                    {/* photo + name skeleton */}
                    <div className='gai:flex gai:flex-[1_0_0] gai:items-center gai:gap-2'>
                        <Skeleton className='gai:h-12 gai:w-12 gai:rounded-full' />
                        <Skeleton className='gai:h-6 gai:w-24' />
                    </div>
                    {/* cta skeleton */}
                    <Skeleton className='gai:h-9 gai:w-16' />
                </div>
                {/* description skeleton */}
                <div className='gai:flex gai:flex-col gai:gap-1 gai:self-stretch'>
                    <Skeleton className='gai:h-20 gai:w-full' />
                </div>
            </div>
        ));
    }

    return agents.filter(agent => agent.type !== 'octo_head').map(agent => (
        <div
            key={agent.id}
            className={`gai:gradient-border gai:box-shadow gai:self-stretch gai:rounded-2xl ${
                focusedAgent?.id === agent.id
                    ? 'gai:gradient-border gai:p-[1px]'
                    : 'gai:border gai:border-primary-100 gai:bg-primary-100'
            } ${showAllObjectives && 'gai:md:hidden'}`}
            onMouseEnter={() => setFocusedAgent(agent)}
            onMouseLeave={() => setFocusedAgent(null)}
        >
            {/* Inner container with white background */}
            <div className='gai:flex gai:h-full gai:min-w-[330px] gai:flex-col gai:items-start gai:gap-3 gai:rounded-[15px] gai:bg-utility-white gai:px-4 gai:py-3'>
                {/* photo + name + cta */}
                <div className='gai:flex gai:items-center gai:gap-3 gai:self-stretch'>
                    {/* photo + name */}
                    <div className='gai:flex gai:flex-[1_0_0] gai:items-center gai:gap-2'>
                        <img
                            className='gai:h-8 gai:w-8 gai:rounded-full gai:object-cover gai:md:h-12 gai:md:w-12'
                            src={agent.image}
                            alt={agent.name}
                        />
                        <span className='gai:overflow-hidden gai:font-body-1-semi gai:text-secondary-gray-900'>
                            {agent.name}
                        </span>
                    </div>
                    {/* cta */}
                    <Button
                        className='gai:cursor-pointer gai:font-body-1-semi'
                        onClick={() => setCurrentAgent(agent.id)}
                    >
                        Start
                    </Button>
                </div>
                {/* description */}
                <p className='gai:flex-1 gai:self-stretch gai:font-body-2-med gai:text-secondary-gray-700 gai:md:font-body-1-med gai:line-clamp-4'>
                    {agent.description}
                </p>
            </div>
        </div>
    ));
};

export default AgentCards;
