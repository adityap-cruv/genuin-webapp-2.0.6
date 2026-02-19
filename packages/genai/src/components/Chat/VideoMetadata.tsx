import type { MessageMetadata } from '@/types';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import Markdown from './Markdown';

const VideoMetadata: React.FC<{ content: string; metadata?: MessageMetadata }> = ({ content, metadata }) => {
    const video_meta = metadata?.video_meta;
    if (!video_meta)
        return (
            <div className='markdown-content'>
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={Markdown}>
                    {content}
                </ReactMarkdown>
            </div>
        );

    if (metadata?.status === false) {
        return (
            <div className='gai:rounded-lg gai:border gai:border-red-400 gai:bg-red-50 gai:p-3 gai:font-medium gai:text-red-700'>
                {content}
            </div>
        );
    }

    const { community_meta, loop_meta } = video_meta;

    // Don't render if we don't have at least community metadata
    if (!community_meta) return null;

    const communityName = community_meta.community_name;
    const communityIcon = community_meta.community_dp_url;
    const loopName = loop_meta?.loop_name;

    return (
        <div className='gai:flex gai:w-full gai:max-w-1/2 gai:flex-col gai:items-start gai:gap-3 gai:p-0'>
            {/* Inserted Message */}
            <div className='gai:font-body-2-med gai:text-secondary-gray-600'>
                Video inserted in {communityName}
                {loopName && ` + ${loopName}`}
            </div>
            {/* Parent Item - Source */}
            <div className='gai:flex gai:w-full gai:flex-col gai:items-start gai:p-0'>
                {/* Source Container */}
                <div
                    className='gai:flex gai:w-full gai:flex-row gai:items-center gai:gap-2 gai:rounded-lg gai:border gai:border-solid gai:px-2 gai:py-1.5'
                    style={{
                        borderColor: '#DFE1E3',
                    }}
                >
                    <div className='gai:flex gai:flex-1 gai:flex-row gai:items-center gai:gap-1'>
                        {/* Community Icon */}
                        {communityIcon && (
                            <img
                                src={communityIcon}
                                alt={communityName}
                                className='gai:h-6 gai:w-6 gai:flex-shrink-0 gai:rounded-full'
                            />
                        )}
                        {/* Community Name */}
                        <span
                            className='gai:flex gai:flex-1 gai:items-center'
                            style={{
                                fontFamily: 'Inter',
                                fontStyle: 'normal',
                                fontWeight: 500,
                                fontSize: '14px',
                                lineHeight: '20px',
                                color: '#1D1F20',
                            }}
                        >
                            {communityName}
                        </span>
                    </div>
                </div>

                {/* Child Item - Loop Name with Connector */}
                {loopName && (
                    <div className='gai:flex gai:w-full gai:flex-row gai:items-start'>
                        {/* Connector Line */}
                        <div className='gai:ml-5 gai:flex gai:w-8 gai:flex-shrink-0 gai:flex-col gai:items-start'>
                            <div
                                className='gai:h-8 gai:w-8'
                                style={{
                                    borderLeft: '1px solid #DFE1E3',
                                    borderBottom: '1px solid #DFE1E3',
                                    borderBottomLeftRadius: '8px',
                                }}
                            />
                        </div>
                        {/* Loop Container */}
                        <div
                            className='gai:mt-3 gai:flex gai:flex-1 gai:flex-row gai:items-center gai:gap-2 gai:rounded-lg gai:border gai:border-solid gai:px-3 gai:py-2'
                            style={{
                                borderColor: '#DFE1E3',
                            }}
                        >
                            <span
                                className='gai:flex gai:flex-1 gai:items-center'
                                style={{
                                    fontFamily: 'Inter',
                                    fontStyle: 'normal',
                                    fontWeight: 500,
                                    fontSize: '14px',
                                    lineHeight: '20px',
                                    color: '#1D1F20',
                                }}
                            >
                                {loopName}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoMetadata;
