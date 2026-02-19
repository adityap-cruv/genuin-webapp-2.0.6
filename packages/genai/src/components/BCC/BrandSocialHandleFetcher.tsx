import { Add } from '@/assets/SvgIcons/icons';
import Spinner from '@/components/ui/spinner';
import { useAgentsContext } from '@/context/app/context';
import { insertSocialHandle, updateAgentMessage, validateSocialHandle } from '@/lib/api';
import { useState } from 'react';
import { toast } from 'sonner';

type SocialHandle = {
    platform: string;
    handle: string;
    inserted: boolean;
    social_id?: string;
};

type BrandSocialHandleFetcherProps = {
    jsonData: {
        social_handles: SocialHandle[];
    };
    messageId: string;
};

const BrandSocialHandleFetcher = ({ jsonData, messageId }: BrandSocialHandleFetcherProps) => {
    const social_handles = jsonData?.social_handles || [];
    const [selectedHandles, setSelectedHandles] = useState<Set<string>>(new Set());
    const [loadingHandles, setLoadingHandles] = useState<Set<string>>(new Set());
    // const [isImporting, setIsImporting] = useState(false);
    const { currentSessionId, updateAgentMessageContent } = useAgentsContext();
    if (!jsonData?.social_handles || jsonData?.social_handles.length === 0) {
        return (
            <div className='gai:flex gai:w-full gai:flex-col gai:overflow-hidden gai:rounded-xl gai:border gai:border-[#E6ECFF]'>
                <div className='gai:flex gai:h-9 gai:items-center gai:justify-center gai:border-b gai:border-[#E6ECFF] gai:bg-[#F7F9FF] gai:px-4 gai:py-2'>
                    <span className='gai:text-sm gai:font-medium gai:text-[#3B3E40]'>No social handles found</span>
                </div>
            </div>
        );
    }

    const getSocialIconUrl = (platform: string) => {
        const lowerPlatform = platform.toLowerCase();
        if (lowerPlatform.includes('tiktok')) {
            return 'https://media.qa.begenuin.com/genai-sdk/assets/social-icons/tiktok.png';
        } else if (lowerPlatform.includes('instagram')) {
            return 'https://media.qa.begenuin.com/genai-sdk/assets/social-icons/instagram.png';
        } else if (lowerPlatform.includes('youtube')) {
            return 'https://media.qa.begenuin.com/genai-sdk/assets/social-icons/youtube.png';
        }
        return null;
    };

    const handleCheckboxChange = (platform: string, handle: string) => {
        const key = `${platform}-${handle}`;
        setSelectedHandles(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    // const handleImport = async () => {
    //     setIsImporting(true);
    //     const selectedHandlesList = social_handles.filter(sh => selectedHandles.has(`${sh.platform}-${sh.handle}`));
    //     try {
    //         const social_ids = selectedHandlesList.map(sh => sh.social_id).filter(Boolean) as string[];
    //         if (social_ids.length > 0) {
    //             await SocialImport(social_ids);
    //             toast.success('Social import started successfully');
    //             setSelectedHandles(new Set());
    //         }
    //     } catch (error) {
    //         toast.error('Failed to import social handles');
    //     } finally {
    //         setIsImporting(false);
    //     }
    // };

    // const hasSelectedHandles = selectedHandles.size > 0;

    const handleInsert = async (platform: string, handle: string) => {
        const key = `${platform}-${handle}`;
        setLoadingHandles(prev => new Set(prev).add(key));

        // first validate the handle
        try {
            const response = await validateSocialHandle({ platform, handle });
            if (response.code === 200) {
                // insert the handle
                const response = await insertSocialHandle({ platform, handle });
                if (response.code === 200) {
                    toast.success('Social handle inserted successfully');
                    updateAgentMessageContent(
                        currentSessionId || '',
                        messageId,
                        JSON.stringify({
                            social_handles: jsonData.social_handles.map(h =>
                                h.handle === handle && h.platform === platform
                                    ? { ...h, inserted: true, social_id: response.data.added_socials[0] }
                                    : h
                            ),
                        })
                    );
                    updateAgentMessage({
                        chat_id: messageId,
                        agent_message: JSON.stringify({
                            social_handles: jsonData.social_handles.map(h =>
                                h.handle === handle && h.platform === platform
                                    ? { ...h, inserted: true, social_id: response.data.added_socials[0] }
                                    : h
                            ),
                        }),
                    });
                } else {
                    toast.error(response.data.message);
                }
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('Failed to insert social handle');
        } finally {
            setLoadingHandles(prev => {
                const newSet = new Set(prev);
                newSet.delete(key);
                return newSet;
            });
        }
    };

    return (
        <div className='gai:flex gai:w-full gai:flex-col gai:gap-4'>
            {/* Table */}
            <div className='gai:flex gai:w-full gai:flex-col gai:overflow-hidden gai:rounded-xl gai:border gai:border-[#E6ECFF]'>
                {/* Header */}
                <div className='gai:flex gai:h-9 gai:items-center gai:border-b gai:border-[#E6ECFF] gai:bg-[#F7F9FF] gai:px-4 gai:py-2'>
                    <div className='gai:flex gai:w-12 gai:items-center gai:justify-center'>
                        <span className='gai:text-sm gai:font-medium gai:text-[#3B3E40]'>Select</span>
                    </div>
                    <div className='gai:flex gai:flex-1 gai:items-center gai:justify-center'>
                        <span className='gai:text-sm gai:font-medium gai:text-[#3B3E40]'>Social Handle</span>
                    </div>
                    <div className='gai:flex gai:w-24 gai:items-center gai:justify-center'>
                        <span className='gai:text-sm gai:font-medium gai:text-[#3B3E40]'>Action</span>
                    </div>
                </div>

                {/* Rows */}
                {social_handles.filter(handle => handle.handle !==null && handle.handle !=='' && handle.handle !==undefined).map((handle, index) => {
                    const key = `${handle.platform}-${handle.handle}`;
                    const isChecked = selectedHandles.has(key);
                    const isLoading = loadingHandles.has(key);
                    const iconUrl = getSocialIconUrl(handle.platform);

                    return (
                        <div
                            key={`handle-${index}`}
                            className='last:gai:border-b-0 gai:flex gai:h-[60px] gai:items-center gai:border-b gai:border-[#E6ECFF] gai:bg-white gai:px-4 gai:py-3'
                        >
                            {/* Checkbox */}
                            <div className='gai:flex gai:w-12 gai:items-center gai:justify-center'>
                                <input
                                    type='checkbox'
                                    checked={isChecked}
                                    onChange={() => handleCheckboxChange(handle.platform, handle.handle)}
                                    disabled={!handle.inserted}
                                    className='gai:focus:ring-2 gai:focus:ring-[#0645FF] gai:focus:ring-offset-0 gai:disabled:cursor-not-allowed gai:disabled:opacity-50 gai:h-4 gai:w-4 gai:cursor-pointer gai:rounded gai:border-[#CBD5E0] gai:text-[#0645FF]'
                                />
                            </div>

                            {/* Social Handle (Platform + Handle merged) */}
                            <div className='gai:flex gai:flex-1 gai:items-center gai:justify-center gai:gap-2'>
                                {iconUrl && <img src={iconUrl} alt={handle.platform} className='gai:h-5 gai:w-5' />}
                                <span className='gai:text-sm gai:font-semibold gai:text-[#1D1F20]'>
                                    @{handle.handle}
                                </span>
                            </div>

                            {/* Action */}
                            <div className='gai:flex gai:w-24 gai:items-center gai:justify-center'>
                                {!handle.inserted ? (
                                    <button
                                        onClick={() => handleInsert(handle.platform, handle.handle)}
                                        disabled={isLoading}
                                        className='gai:hover:bg-[#0539DD] gai:disabled:cursor-not-allowed gai:disabled:opacity-50 gai:gai:disabled:hover:bg-[#0645FF] gai:flex gai:items-center gai:gap-1.5 gai:rounded-lg gai:bg-[#0645FF] gai:px-3 gai:py-1.5 gai:text-white gai:transition-colors'
                                    >
                                        {isLoading ? (
                                            <>
                                                <Spinner size='sm' color='secondary' />
                                                Inserting...
                                            </>
                                        ) : (
                                            <>
                                                <Add width='12' height='12' stroke='white' />
                                                Insert
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <span className='gai:text-center gai:text-sm gai:font-medium gai:text-[#1D1F20]'>
                                        Inserted
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Import Button */}
            {/* <div className='gai:flex gai:w-full gai:items-center gai:justify-end'>
                <button
                    onClick={handleImport}
                    disabled={!hasSelectedHandles || isImporting}
                    className='gai:hover:bg-[#0539DD] gai:disabled:cursor-not-allowed gai:disabled:opacity-50 gai:gai:disabled:hover:bg-[#0645FF] gai:flex gai:items-center gai:gap-2 gai:rounded-lg gai:bg-[#0645FF] gai:px-4 gai:py-2.5 gai:text-sm gai:font-semibold gai:text-white gai:transition-colors'
                >
                    {isImporting ? (
                        <>
                            <Spinner size='sm' color='secondary' />
                            Importing...
                        </>
                    ) : (
                        <>
                            <Upload />
                            Import Selected ({selectedHandles.size})
                        </>
                    )}
                </button>
            </div> */}
        </div>
    );
};

export default BrandSocialHandleFetcher;
