const ThinkingIndicator = () => (
    <div className='gai:mb-3 gai:flex gai:flex-col gai:gap-1.5'>
        <span
            className='gai:mb-1 gai:font-body-2-med gai:text-secondary-gray-600'
            style={{ fontSize: '14px', color: '#6b7280' }}
        >
            Thinking...
        </span>
        <div className='gai:flex gai:w-full gai:flex-col gai:gap-1.5'>
            <div
                className='gai:gradient-bar-1 gai:h-[15px] gai:w-full gai:rounded'
                style={{
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative',
                }}
            ></div>
            <div
                className='gai:gradient-bar-2 gai:h-[15px] gai:w-full gai:rounded'
                style={{
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative',
                }}
            ></div>
            <div
                className='gai:gradient-bar-3 gai:h-[15px] gai:w-1/2 gai:rounded'
                style={{
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative',
                }}
            ></div>
        </div>
        <style>{`
            @keyframes shimmer {
                0% {
                    transform: translateX(-100%);
                }
                100% {
                    transform: translateX(100%);
                }
            }
            
            .gai\\:gradient-bar-1,
            .gai\\:gradient-bar-2,
            .gai\\:gradient-bar-3 {
                background: linear-gradient(90deg, rgba(147, 149, 255, 0.25) 0%, rgba(22, 133, 253, 0.25) 100%);
                position: relative;
            }
            
            .gai\\:gradient-bar-1::after,
            .gai\\:gradient-bar-2::after,
            .gai\\:gradient-bar-3::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, 
                    transparent 0%, 
                    rgba(147, 149, 255, 0.6) 40%,
                    rgba(22, 133, 253, 0.8) 50%,
                    rgba(147, 149, 255, 0.6) 60%,
                    transparent 100%
                );
                animation: shimmer 2.5s ease-in-out infinite;
            }
            
            .gai\\:gradient-bar-2::after {
                animation-delay: 0.2s;
            }
            
            .gai\\:gradient-bar-3::after {
                animation-delay: 0.4s;
            }
        `}</style>
    </div>
);

export default ThinkingIndicator;
