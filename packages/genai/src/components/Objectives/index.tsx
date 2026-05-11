import { useEffect } from 'react';

import { useAgentsContext } from '@/context/app/context';
import { useInputContext } from '@/context/input/context';
import { useRudderEvents } from '@/services/analytics/useRudderAnalytics';
import type { Agent, AgentPreset } from '@/types';

import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select';

const Objectives = () => {
    const {
        agents,
        showAllObjectives,
        setShowAllObjectives,
        isSuggestionsOpen,
        enteredInChatMode,
        currentAgent,
        brand_id,
        textAreaRef,
        setIsSuggestionsOpen,
        ipInfo,
    } = useAgentsContext();
    const { track } = useRudderEvents();
    const { setInput, input } = useInputContext();
    useEffect(() => {
        if (textAreaRef) {
            textAreaRef.style.height = 'auto';
            textAreaRef.style.height = Math.min(textAreaRef.scrollHeight, 120) + 'px';
        }
    }, [input]);

    const objectives: { prompt: string; objective: string }[] = [];
    if (enteredInChatMode) {
        const agent = agents.find((agent: Agent) => agent.id === currentAgent);
        if (agent && agent.presets) {
            agent.presets.forEach((preset: AgentPreset) => {
                if (preset.prompt && preset.objective) {
                    objectives.push({
                        prompt: preset.prompt,
                        objective: preset.objective,
                    });
                }
            });
        }
    } else {
        agents.forEach((agent: Agent) => {
            if (agent.presets) {
                agent.presets.forEach((preset: AgentPreset) => {
                    if (preset.prompt && preset.objective) {
                        objectives.push({
                            prompt: preset.prompt,
                            objective: preset.objective,
                        });
                    }
                });
            }
        });
    }

    // const displayedObjectives =
    //     enteredInChatMode || showAllObjectives
    //         ? objectives
    //         : objectives.slice(0, 4);

    const handleClick = (objective: { prompt: string; objective: string }) => {
        trackEvent(objective);
        if (brand_id !== -1) {
            setInput(objective.prompt.replace('{o}', objective.objective) + ' my brand.');
        } else {
            setInput(objective.prompt.replace('{o}', objective.objective));
            setIsSuggestionsOpen(true);
        }
    };

    const focusInput = () => {
        if (textAreaRef) {
            textAreaRef.focus();
        }
    };

    const trackEvent = (objective: { prompt: string; objective: string }) => {
        if (ipInfo) {
            const payload = {
                ipInfo,
                objective: objective.objective,
                prompt: objective.prompt,
            };
            track('genai:objective_prompt', payload);
        }
    };

    return (
        !(isSuggestionsOpen && showAllObjectives) && (
            <div className='gai:flex gai:items-start gai:gap-2 gai:self-stretch gai:overflow-auto gai:md:flex-wrap gai:md:justify-center'>
                {/* First 4 objectives shown in both mobile and desktop */}
                {objectives.slice(0, 4).map((objective, index) => (
                    <Button
                        key={index}
                        onClick={() => {
                            handleClick(objective);
                            focusInput();
                        }}
                        variant={'objective'}
                    >
                        {objective.objective}
                    </Button>
                ))}

                {/* Additional objectives */}
                {!enteredInChatMode && objectives.length > 4 && (
                    <>
                        {/* Desktop: Show remaining objectives as buttons when showAllObjectives is true */}
                        {showAllObjectives && (
                            <div className='gai:hidden gai:flex-wrap gai:items-start gai:justify-center gai:gap-2 gai:md:flex'>
                                {objectives.slice(4).map((objective, index) => (
                                    <Button
                                        key={index + 4}
                                        onClick={() => {
                                            handleClick(objective);
                                            focusInput();
                                        }}
                                        variant={'objective'}
                                    >
                                        {objective.objective}
                                    </Button>
                                ))}
                            </div>
                        )}

                        {/* Desktop: Show More button */}
                        <Button
                            onClick={() => setShowAllObjectives(!showAllObjectives)}
                            variant={'objective'}
                            className='gai:hidden gai:md:flex'
                        >
                            {showAllObjectives ? 'Less' : 'More'}
                        </Button>

                        {/* Mobile: Show Select dropdown for remaining objectives */}
                        <div className='gai:flex gai:flex-shrink-0 gai:md:hidden'>
                            <Select
                                onValueChange={value => {
                                    const selectedObj = objectives.find((_, idx) => (idx + 4).toString() === value);
                                    if (selectedObj) {
                                        handleClick(selectedObj);
                                        focusInput();
                                    }
                                }}
                            >
                                <SelectTrigger className='gai:border-none gai:p-0 gai:text-gray-700 gai:[&>svg]:hidden'>
                                    <div className='gai:rounded-2xl gai:border gai:border-primary-100 gai:bg-utility-white gai:px-4 gai:py-2 gai:font-body-2-med gai:text-secondary-gray-700'>
                                        More
                                    </div>
                                </SelectTrigger>
                                <SelectContent
                                    side='top'
                                    className='gai:max-h-[300px] gai:overflow-y-auto gai:rounded-2xl gai:border gai:border-[#E6ECFF] gai:bg-white gai:shadow-lg gai:[&_svg]:hidden gai:[&>svg]:hidden'
                                >
                                    {objectives.slice(4).map((obj, idx) => (
                                        <SelectItem
                                            key={idx + 4}
                                            value={(idx + 4).toString()}
                                            className='gai:m-1 gai:max-w-fit gai:rounded-[24px] gai:border gai:border-[#E6ECFF] gai:px-3 gai:[&_svg]:hidden gai:[&>svg]:hidden'
                                        >
                                            <span className='gai:truncate gai:font-body-2-med gai:text-secondary-gray-700'>
                                                {obj.objective}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </>
                )}
            </div>
        )
    );
};

export default Objectives;
