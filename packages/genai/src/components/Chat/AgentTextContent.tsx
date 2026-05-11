import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import type { ChatHistoryEvent } from '@/types';

import BrandAssets from '../BCC/BrandAssets';
import BrandCTKWs from '../BCC/BrandCTKWs';
import BrandConsumerBrands from '../BCC/BrandConsumerBrands';
import BrandGuidelines from '../BCC/BrandGuidelines';
import BrandIndustryType from '../BCC/BrandIndustryType';
import BrandPersona from '../BCC/BrandPersona';
import BrandSocialHandleFetcher from '../BCC/BrandSocialHandleFetcher';

import Markdown from './Markdown';
import ThinkingIndicator from './ThinkingIndicator';
import VideoMetadata from './VideoMetadata';
import VideoPlayer from './VideoPlayer';

interface AgentTextContentProps {
    event: ChatHistoryEvent;
    displayText: string;
    normalizedContent: string;
    isAnimating: boolean;
    hasFinished: boolean;
    isLastMessage: boolean;
    sessionThinking?: boolean;
}

const ThinkingMessages = () => {
    return (
        <div className='gai:font-body-2-med gai:text-secondary-gray-600 gai:italic'>
            <ThinkingIndicator />
        </div>
    );
};

const AgentTextContent: React.FC<AgentTextContentProps> = ({
    event,
    displayText,
    normalizedContent,
    isAnimating,
    hasFinished,
    isLastMessage,
    sessionThinking,
}) => {
    const content = event.message.content;
    const functionName = event.message.function_name;
    const functionResponse = event.message.function_response;

    // Show thinking indicator if this is the last agent message and session is thinking but no content
    if (isLastMessage && sessionThinking && !content?.trim()) {
        return <ThinkingMessages />;
    }

    // Handle specific function responses
    if (functionName === 'video_generator_agent') {
        return (
            <>
                <VideoMetadata content={content} metadata={event.metadata} />
                {event.metadata?.video_meta?.url && event.metadata?.video_meta?.thumbnail && (
                    <VideoPlayer
                        videoUrl={event.metadata?.video_meta?.url}
                        thumbnailUrl={event.metadata?.video_meta?.thumbnail}
                    />
                )}
            </>
        );
    }

    if (functionName === 'consumer_brands_agent') {
        return (
            <BrandConsumerBrands
                messageId={event.id}
                existing={functionResponse?.existing}
                new={functionResponse?.new}
            />
        );
    }

    if (functionName === 'get_ctkws') {
        return <BrandCTKWs jsonData={functionResponse?.result} messageId={event.id} />;
    }

    if (functionName === 'get_brand_asset') {
        return <BrandAssets jsonData={functionResponse ?? {}} messageId={event.id} />;
    }

    if (functionName === 'get_brand_guidelines_') {
        return <BrandGuidelines jsonData={functionResponse?.result} messageId={event.id} />;
    }

    if (functionName === 'get_brand_persona_') {
        return <BrandPersona jsonData={functionResponse?.result} messageId={event.id} />;
    }

    if (functionName === 'industry_type_agent') {
        return <BrandIndustryType jsonData={functionResponse ?? {}} messageId={event.id} />;
    }

    if (functionName === 'social_handle_fetcher_agent') {
        return <BrandSocialHandleFetcher jsonData={functionResponse ?? {}} messageId={event.id} />;
    }

    // Default: render markdown content
    return (
        <div className='markdown-content'>
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={Markdown}>
                {displayText || (event.isCompleted ? normalizedContent : '')}
            </ReactMarkdown>
            {isAnimating || !hasFinished ? (
                <span className='gai:inline-block gai:animate-pulse gai:text-secondary-gray-600'>|</span>
            ) : null}
            {event.metadata?.wasStopped && event.isCompleted ? (
                <span className='gai:mt-2 gai:block gai:text-xs gai:font-medium gai:text-secondary-gray-500'>
                    Response stopped
                </span>
            ) : null}
        </div>
    );
};

export default AgentTextContent;
