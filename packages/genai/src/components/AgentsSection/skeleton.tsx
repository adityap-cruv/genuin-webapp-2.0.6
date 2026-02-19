import AgentCard from './AgentCards';

const AgentsSectionSkeleton = () => {
    const skeletonCards = Array.from({ length: 4 }, (_, index) => index);

    return (
        <>
            {skeletonCards.map(index => (
                <AgentCard agents={[]} key={index} />
            ))}
        </>
    );
};

export default AgentsSectionSkeleton;
