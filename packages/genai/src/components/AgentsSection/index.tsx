import ChevronLeft from '@/assets/SvgIcons/ChevronLeft';
import ChevronRight from '@/assets/SvgIcons/ChevronRight';
import { Button } from '@/components/ui/button';
import { useAgentsContext } from '@/context/app/context';
import { useEffect, useRef, useState } from 'react';
import AgentCards from './AgentCards';
import AgentPills from './AgentPills';

const AgentsSection = () => {
    const { agents, showAllObjectives, isMaya } = useAgentsContext();
    
    // Hide AgentsSection when isMaya is true (Maya-only mode)
    if (isMaya) {
        return null;
    }
    
    const agentsToShow = agents.filter(agent => agent.type !== 'octo_head');
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScrollButtons = () => {
        const container = scrollContainerRef.current;
        if (container) {
            // Add a small threshold (1px) to account for floating point precision
            setCanScrollLeft(container.scrollLeft > 1);
            setCanScrollRight(
                Math.ceil(container.scrollLeft) < Math.floor(container.scrollWidth - container.clientWidth - 1)
            );
        }
    };

    useEffect(() => {
        checkScrollButtons();
        window.addEventListener('resize', checkScrollButtons);
        return () => window.removeEventListener('resize', checkScrollButtons);
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (container) {
            const cards = container.children;
            const scrollLeft = container.scrollLeft;

            // Find the first fully visible card's index
            let currentIndex = -1;
            for (let i = 0; i < cards.length; i++) {
                const card = cards[i] as HTMLElement;
                const cardLeft = card.offsetLeft - container.offsetLeft;
                if (cardLeft >= scrollLeft - 1) {
                    // Add small threshold
                    currentIndex = i;
                    break;
                }
            }

            // Calculate target index based on direction
            const targetIndex =
                direction === 'left' ? Math.max(0, currentIndex - 1) : Math.min(cards.length - 1, currentIndex + 1);

            // If we're already at the first/last card, force scroll to the extreme
            if (direction === 'left' && targetIndex === 0) {
                container.scrollTo({ left: 0, behavior: 'smooth' });
            } else if (direction === 'right' && targetIndex === cards.length - 1) {
                container.scrollTo({
                    left: container.scrollWidth - container.clientWidth,
                    behavior: 'smooth',
                });
            } else {
                // Normal case: scroll to target card
                cards[targetIndex]?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'start',
                });
            }

            // Update scroll buttons after animation
            setTimeout(checkScrollButtons, 500);
        }
    };

    return (
        <div className='gai:flex gai:w-full gai:flex-col gai:items-start'>
            {/* title */}
            <div className='gai:flex gai:flex-col gai:items-start gai:justify-center gai:gap-2 gai:self-stretch'>
                <span className='gai:self-stretch gai:font-body-0-semi gai:text-secondary-gray-900 gai:md:font-headline-4-semi'>
                    GenAI Agents
                </span>
                <p className='gai:hidden gai:self-stretch gai:font-body-1-med gai:text-secondary-gray-700 gai:md:block'>
                    Meet the intelligent GenAI Agents powering strategy, storytelling, and scale across your Community
                    Media Network.
                </p>
            </div>
            {/* agents carousel */}
            <div className='gai:relative gai:w-full'>
                <div
                    ref={scrollContainerRef}
                    className='gai:scrollbar-hide gai:flex gai:items-start gai:gap-3 gai:self-stretch gai:overflow-x-auto gai:px-1.5 gai:py-4'
                    style={{
                        maskImage: 'linear-gradient(to right, transparent, black 1%, black 98%, transparent)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent, black 1%, black 98%, transparent)',
                    }}
                    onScroll={checkScrollButtons}
                >
                    {/* card */}
                    <AgentPills agents={agentsToShow} />
                    <AgentCards agents={agentsToShow} />
                </div>
                {/* Navigation buttons */}
                {canScrollLeft && (
                    <Button
                        variant='ghost'
                        size='icon'
                        className={`gai:absolute gai:top-1/2 gai:left-0 gai:-translate-y-1/2 gai:rounded-full gai:border gai:border-gray-200 gai:bg-white gai:shadow-md ${showAllObjectives && 'gai:md:hidden'}`}
                        onClick={() => scroll('left')}
                    >
                        <ChevronLeft />
                    </Button>
                )}
                {canScrollRight && (
                    <Button
                        variant='ghost'
                        size='icon'
                        className={`gai:absolute gai:top-1/2 gai:right-0 gai:-translate-y-1/2 gai:rounded-full gai:border gai:border-gray-200 gai:bg-white gai:shadow-md ${showAllObjectives && 'gai:md:hidden'}`}
                        onClick={() => scroll('right')}
                    >
                        <ChevronRight />
                    </Button>
                )}
            </div>
        </div>
    );
};

export default AgentsSection;
