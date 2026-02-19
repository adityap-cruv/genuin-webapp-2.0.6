import { Skeleton } from '@/components/ui/skeleton';
import type { BrandAssetsJsonData } from '@/types';

const BrandAssets = ({ jsonData }: { jsonData: BrandAssetsJsonData; messageId?: string }) => {
    console.log("jsonData", jsonData);
    if (!jsonData || Object.keys(jsonData).length === 0) {
        return (
            <>
                {/* no brand assets found */}
                <div className='gai:flex gai:w-full gai:flex-col gai:overflow-hidden gai:rounded-xl gai:border gai:border-[#E6ECFF]'>
                    <div className='gai:flex gai:h-9 gai:items-center gai:justify-center gai:border-b gai:border-[#E6ECFF] gai:bg-[#F7F9FF] gai:px-4 gai:py-2'>
                        <span className='gai:text-sm gai:font-medium gai:text-[#3B3E40]'>No brand assets found</span>
                    </div>
                </div>
            </>
        );
    }

    // const [isInserting, setIsInserting] = useState(false);
    // const [inserted, setInserted] = useState(jsonData?.inserted || false);
    const hasData = jsonData && Object.keys(jsonData).length > 0;
    // const { updateAgentMessageContent, currentSessionId } = useAgentsContext();

    // const handleInsert = async () => {
    //     if (!jsonData) return;

    //     setIsInserting(true);
    //     try {
    //         await updateBrandAssets(jsonData);

    //         // Update the agent message with inserted: true
    //         if (messageId && currentSessionId) {
    //             const updatedJsonData = { ...jsonData, inserted: true };
    //             const updatedContent = JSON.stringify(updatedJsonData);

    //             await updateAgentMessage({
    //                 chat_id: messageId,
    //                 agent_message: updatedContent,
    //             });

    //             // Update the message in local state
    //             updateAgentMessageContent(currentSessionId, messageId, updatedContent);
    //         }

    //         setInserted(true);
    //         toast.success('Brand assets inserted successfully');
    //         window.dispatchEvent(
    //             new CustomEvent('genai:onboardingStepUpdate', {
    //                 detail: { step: 'brand_assets' },
    //             })
    //         );
    //     } catch (error) {
    //         toast.error('Failed to insert brand assets');
    //     } finally {
    //         setIsInserting(false);
    //     }
    // };
    if (!hasData) {
        return (
            <div className='gai:flex gai:flex-col gai:gap-4'>
                {/* Generating assets message */}
                <div className='gai:flex gai:items-center'>
                    <span
                        className='gai:mb-1 gai:font-body-2-med gai:text-secondary-gray-600'
                        style={{ fontSize: '14px', color: '#6b7280' }}
                    >
                        Generating brand assets...
                    </span>
                </div>
                {/* Brand Logo Skeleton */}
                <div className='gai:flex gai:w-full gai:flex-col gai:gap-4 gai:rounded-xl gai:border gai:border-secondary-gray-150 gai:p-4'>
                    <span className='gai:font-body-1-bold'>Brand Logo</span>
                    <div className='gai:flex gai:flex-row gai:gap-4'>
                        <div className='gai:flex gai:flex-col gai:gap-2'>
                            <span className='gai:font-body-1-med gai:text-secondary-gray-600'>Favicon</span>
                            <Skeleton className='gai:h-24 gai:w-24' />
                        </div>
                        <div className='gai:flex gai:flex-col gai:gap-2'>
                            <span className='gai:font-body-1-med gai:text-secondary-gray-600'>Profile</span>
                            <Skeleton className='gai:h-24 gai:w-24' />
                        </div>
                        <div className='gai:flex gai:flex-col gai:gap-2'>
                            <span className='gai:font-body-1-med gai:text-secondary-gray-600'>Banner</span>
                            <Skeleton className='gai:h-24 gai:w-72' />
                        </div>
                    </div>
                </div>

                {/* Brand Slogan Skeleton */}
                <div className='gai:flex gai:w-full gai:flex-col gai:gap-4 gai:rounded-xl gai:border gai:border-secondary-gray-150 gai:p-4'>
                    <span className='gai:font-body-1-bold'>Brand Slogan</span>
                    <Skeleton className='gai:h-5 gai:w-20' />
                </div>

                {/* Mobile App URLs Skeleton */}
                <div className='gai:flex gai:w-full gai:flex-col gai:gap-4 gai:rounded-xl gai:border gai:border-secondary-gray-150 gai:p-4'>
                    <span className='gai:font-body-1-bold'>Mobile App URLs</span>
                    <div className='gai:flex gai:flex-col gai:gap-2'>
                        <span className='gai:font-body-1-med gai:text-secondary-gray-600'>Play Store URL</span>
                        <Skeleton className='gai:h-5 gai:w-64' />
                    </div>
                    <div className='gai:flex gai:flex-col gai:gap-2'>
                        <span className='gai:font-body-1-med gai:text-secondary-gray-600'>App Store URL</span>
                        <Skeleton className='gai:h-5 gai:w-64' />
                    </div>
                </div>

                {/* Policy URLs Skeleton */}
                <div className='gai:flex gai:w-full gai:flex-col gai:gap-4 gai:rounded-xl gai:border gai:border-secondary-gray-150 gai:p-4'>
                    <span className='gai:font-body-1-bold'>Policy URLs</span>
                    <div className='gai:flex gai:flex-col gai:gap-2'>
                        <span className='gai:font-body-1-med gai:text-secondary-gray-600'>Privacy Policy URL</span>
                        <Skeleton className='gai:h-5 gai:w-64' />
                    </div>
                    <div className='gai:flex gai:flex-col gai:gap-2'>
                        <span className='gai:font-body-1-med gai:text-secondary-gray-600'>Terms of Use URL</span>
                        <Skeleton className='gai:h-5 gai:w-64' />
                    </div>
                </div>

                {/* Shared URL Metadata Skeleton */}
                <div className='gai:flex gai:w-full gai:flex-col gai:gap-4 gai:rounded-xl gai:border gai:border-secondary-gray-150 gai:p-4'>
                    <span className='gai:font-body-1-bold'>Shared URL Metadata</span>
                    <div className='gai:flex gai:flex-col gai:gap-2'>
                        <span className='gai:font-body-1-med gai:text-secondary-gray-600'>Page Title</span>
                        <Skeleton className='gai:h-5 gai:w-48' />
                    </div>
                    <div className='gai:flex gai:flex-col gai:gap-2'>
                        <span className='gai:font-body-1-med gai:text-secondary-gray-600'>Meta Description</span>
                        <Skeleton className='gai:h-5 gai:w-3/4' />
                    </div>
                    <div className='gai:flex gai:flex-col gai:gap-2'>
                        <span className='gai:font-body-1-med gai:text-secondary-gray-600'>Image</span>
                        <Skeleton className='gai:h-24 gai:w-72' />
                    </div>
                </div>

                {/* Brand Colors Skeleton */}
                <div className='gai:flex gai:w-full gai:flex-col gai:gap-4 gai:rounded-xl gai:border gai:border-secondary-gray-150 gai:p-4'>
                    <span className='gai:font-body-1-bold'>Brand Color</span>
                    <div className='gai:flex gai:w-full gai:flex-row gai:gap-4'>
                        {/* Primary Color */}
                        <div className='gai:flex gai:flex-1 gai:flex-col gai:gap-2'>
                            <span className='gai:font-body-1-med gai:text-secondary-gray-600'>Primary</span>
                            <div className='gai:flex gai:h-[52px] gai:flex-row gai:items-center gai:gap-2 gai:rounded-lg gai:border gai:border-secondary-gray-150 gai:p-2'>
                                <Skeleton className='gai:h-9 gai:w-9 gai:rounded gai:border gai:border-secondary-gray-150' />
                                <Skeleton className='gai:h-5 gai:w-20' />
                            </div>
                        </div>
                        {/* Secondary Color */}
                        <div className='gai:flex gai:flex-1 gai:flex-col gai:gap-2'>
                            <span className='gai:font-body-1-med gai:text-secondary-gray-600'>Secondary</span>
                            <div className='gai:flex gai:h-[52px] gai:flex-row gai:items-center gai:gap-2 gai:rounded-lg gai:border gai:border-secondary-gray-150 gai:p-2'>
                                <Skeleton className='gai:h-9 gai:w-9 gai:rounded gai:border gai:border-secondary-gray-150' />
                                <Skeleton className='gai:h-5 gai:w-20' />
                            </div>
                        </div>
                        {/* Tertiary Color */}
                        <div className='gai:flex gai:flex-1 gai:flex-col gai:gap-2'>
                            <span className='gai:font-body-1-med gai:text-secondary-gray-600'>Tertiary</span>
                            <div className='gai:flex gai:h-[52px] gai:flex-row gai:items-center gai:gap-2 gai:rounded-lg gai:border gai:border-secondary-gray-150 gai:p-2'>
                                <Skeleton className='gai:h-9 gai:w-9 gai:rounded gai:border gai:border-secondary-gray-150' />
                                <Skeleton className='gai:h-5 gai:w-20' />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='gai:flex gai:flex-col gai:gap-4'>
            {/* brand logo card */}
            {jsonData.brand_logo &&
                (jsonData.brand_logo.favicon || jsonData.brand_logo.profile || jsonData.brand_logo.banner) && (
                    <div className='gai:flex gai:w-full gai:flex-col gai:gap-4 gai:rounded-xl gai:border gai:border-secondary-gray-150 gai:p-4'>
                        <span className='gai:font-body-1-bold'>Brand Logo</span>
                        <div className='gai:flex gai:flex-row gai:gap-4'>
                            {jsonData.brand_logo.favicon && (
                                <div className='gai:flex gai:flex-col gai:gap-2'>
                                    <span className='gai:font-body-1-med gai:text-secondary-gray-600'>Favicon</span>
                                    <img
                                        src={jsonData.brand_logo.favicon}
                                        alt='Favicon'
                                        className='gai:h-24 gai:w-24 gai:rounded gai:border gai:border-secondary-gray-150 gai:object-contain'
                                    />
                                </div>
                            )}
                            {jsonData.brand_logo.profile && (
                                <div className='gai:flex gai:flex-col gai:gap-2'>
                                    <span className='gai:font-body-1-med gai:text-secondary-gray-600'>Profile</span>
                                    <img
                                        src={jsonData.brand_logo.profile}
                                        alt='Profile'
                                        className='gai:h-24 gai:w-24 gai:rounded gai:border gai:border-secondary-gray-150 gai:object-contain'
                                    />
                                </div>
                            )}
                            {jsonData.brand_logo.banner && (
                                <div className='gai:flex gai:flex-col gai:gap-2'>
                                    <span className='gai:font-body-1-med gai:text-secondary-gray-600'>Banner</span>
                                    <div
                                        className='gai:w-72 gai:overflow-hidden gai:rounded gai:border gai:border-secondary-gray-150'
                                        style={{
                                            height: '96px',
                                            maxHeight: '96px',
                                        }}
                                    >
                                        <img
                                            src={jsonData.brand_logo.banner}
                                            alt='Banner'
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            {/* brand slogan */}
            {jsonData.brand_slogan && jsonData.brand_slogan.slogan && (
                <div className='gai:flex gai:w-full gai:flex-col gai:gap-4 gai:rounded-xl gai:border gai:border-secondary-gray-150 gai:p-4'>
                    <span className='gai:font-body-1-bold'>Brand Slogan</span>
                    <span className='gai:font-body-1-med gai:text-secondary-gray-900'>
                        {jsonData.brand_slogan.slogan}
                    </span>
                </div>
            )}

            {/* app urls */}
            {jsonData.mobile_app_urls &&
                (jsonData.mobile_app_urls.app_store_url || jsonData.mobile_app_urls.play_store_url) && (
                    <div className='gai:flex gai:w-full gai:flex-col gai:gap-4 gai:rounded-xl gai:border gai:border-secondary-gray-150 gai:p-4'>
                        <span className='gai:font-body-1-bold'>Mobile App URLs</span>
                        {jsonData.mobile_app_urls.app_store_url && (
                            <div className='gai:flex gai:flex-col gai:gap-2'>
                                <span className='gai:font-body-3-med gai:text-secondary-gray-600'>App Store URL</span>
                                <a
                                    href={jsonData.mobile_app_urls.app_store_url}
                                    className='gai:font-body-1-med gai:text-primary-500'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                >
                                    {jsonData.mobile_app_urls.app_store_url}
                                </a>
                            </div>
                        )}
                        {jsonData.mobile_app_urls.play_store_url && (
                            <div className='gai:flex gai:flex-col gai:gap-2'>
                                <span className='gai:font-body-3-med gai:text-secondary-gray-600'>Play Store URL</span>
                                <a
                                    href={jsonData.mobile_app_urls.play_store_url}
                                    className='gai:font-body-1-med gai:text-primary-500'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                >
                                    {jsonData.mobile_app_urls.play_store_url}
                                </a>
                            </div>
                        )}
                    </div>
                )}

            {/* privacy urls */}
            {jsonData.policy_urls && (jsonData.policy_urls.privacy_policy || jsonData.policy_urls.terms_of_service) && (
                <div className='gai:flex gai:w-full gai:flex-col gai:gap-4 gai:rounded-xl gai:border gai:border-secondary-gray-150 gai:p-4'>
                    <span className='gai:font-body-1-bold'>Policy URLs</span>
                    {jsonData.policy_urls.privacy_policy && (
                        <div className='gai:flex gai:flex-col gai:gap-2'>
                            <span className='gai:font-body-3-med gai:text-secondary-gray-600'>Privacy Policy URL</span>
                            <a
                                href={jsonData.policy_urls.privacy_policy}
                                className='gai:font-body-1-med gai:text-primary-500'
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                {jsonData.policy_urls.privacy_policy}
                            </a>
                        </div>
                    )}
                    {jsonData.policy_urls.terms_of_service && (
                        <div className='gai:flex gai:flex-col gai:gap-2'>
                            <span className='gai:font-body-3-med gai:text-secondary-gray-600'>
                                Terms of Service URL
                            </span>
                            <a
                                href={jsonData.policy_urls.terms_of_service}
                                className='gai:font-body-1-med gai:text-primary-500'
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                {jsonData.policy_urls.terms_of_service}
                            </a>
                        </div>
                    )}
                </div>
            )}

            {/* Shared URL Metadata */}
            {jsonData.shared_url_metadata &&
                (jsonData.shared_url_metadata.page_title ||
                    jsonData.shared_url_metadata.meta_description ||
                    jsonData.shared_url_metadata.image) && (
                    <div className='gai:flex gai:w-full gai:flex-col gai:gap-4 gai:rounded-xl gai:border gai:border-secondary-gray-150 gai:p-4'>
                        <span className='gai:font-body-1-bold'>Shared URL Metadata</span>
                        {jsonData.shared_url_metadata.page_title && (
                            <div className='gai:flex gai:flex-col gai:gap-2'>
                                <span className='gai:font-body-3-med gai:text-secondary-gray-600'>Page Title</span>
                                <span className='gai:font-body-1-semi gai:text-secondary-gray-900'>
                                    {jsonData.shared_url_metadata.page_title}
                                </span>
                            </div>
                        )}
                        {jsonData.shared_url_metadata.meta_description && (
                            <div className='gai:flex gai:flex-col gai:gap-2'>
                                <span className='gai:font-body-3-med gai:text-secondary-gray-600'>
                                    Meta Description
                                </span>
                                <span className='gai:font-body-1-med gai:text-secondary-gray-900'>
                                    {jsonData.shared_url_metadata.meta_description}
                                </span>
                            </div>
                        )}

                        {jsonData.shared_url_metadata.image && (
                            <div className='gai:flex gai:flex-col gai:gap-2'>
                                <span className='gai:font-body-3-med gai:text-secondary-gray-600'>Image</span>
                                <div
                                    className='gai:w-72 gai:overflow-hidden gai:rounded gai:border gai:border-secondary-gray-150'
                                    style={{
                                        height: '96px',
                                        maxHeight: '96px',
                                    }}
                                >
                                    <img
                                        src={jsonData.shared_url_metadata.image}
                                        alt='Banner'
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain',
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

            {/* Brand Color */}
            {jsonData.brand_colors &&
                (jsonData.brand_colors.primary_color ||
                    jsonData.brand_colors.secondary_color ||
                    jsonData.brand_colors.tertiary_color) && (
                    <div className='gai:flex gai:w-full gai:flex-col gai:gap-4 gai:rounded-xl gai:border gai:border-secondary-gray-150 gai:p-4'>
                        <span className='gai:font-body-1-bold'>Brand Color</span>
                        <div className='gai:flex gai:w-full gai:flex-row gai:gap-4'>
                            {/* Primary Color */}
                            {jsonData.brand_colors.primary_color && (
                                <div className='gai:flex gai:flex-1 gai:flex-col gai:gap-2'>
                                    <span className='gai:font-body-3-med gai:text-secondary-gray-600'>Primary</span>
                                    <div className='gai:flex gai:h-[52px] gai:flex-row gai:items-center gai:gap-2 gai:rounded-lg gai:border gai:border-secondary-gray-150 gai:p-2'>
                                        <div
                                            className='gai:h-9 gai:w-9 gai:rounded-lg'
                                            style={{
                                                background: jsonData.brand_colors.primary_color,
                                            }}
                                        ></div>
                                        <span className='gai:font-body-1-med gai:text-secondary-gray-900'>
                                            {jsonData.brand_colors.primary_color}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Secondary Color */}
                            {jsonData.brand_colors.secondary_color && (
                                <div className='gai:flex gai:flex-1 gai:flex-col gai:gap-2'>
                                    <span className='gai:font-body-3-med gai:text-secondary-gray-600'>Secondary</span>
                                    <div className='gai:flex gai:h-[52px] gai:flex-row gai:items-center gai:gap-2 gai:rounded-lg gai:border gai:border-secondary-gray-150 gai:p-2'>
                                        <div
                                            className='gai:h-9 gai:w-9 gai:rounded-lg'
                                            style={{
                                                background: jsonData.brand_colors.secondary_color,
                                            }}
                                        ></div>
                                        <span className='gai:font-body-1-med gai:text-secondary-gray-900'>
                                            {jsonData.brand_colors.secondary_color}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {/* Tertiary Color */}
                            {jsonData.brand_colors.tertiary_color && (
                                <div className='gai:flex gai:flex-1 gai:flex-col gai:gap-2'>
                                    <span className='gai:font-body-3-med gai:text-secondary-gray-600'>Tertiary</span>
                                    <div className='gai:flex gai:h-[52px] gai:flex-row gai:items-center gai:gap-2 gai:rounded-lg gai:border gai:border-secondary-gray-150 gai:p-2'>
                                        <div
                                            className='gai:h-9 gai:w-9 gai:rounded-lg'
                                            style={{
                                                background: jsonData.brand_colors.tertiary_color,
                                            }}
                                        ></div>
                                        <span className='gai:font-body-1-med gai:text-secondary-gray-900'>
                                            {jsonData.brand_colors.tertiary_color}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            {/* Insert Button or Inserted Text */}
            {/* <div className='gai:flex gai:w-full gai:justify-end'>
                {inserted ? (
                    <span className='gai:font-body-1-med gai:text-primary-500'>Inserted</span>
                ) : (
                    <Button
                        onClick={handleInsert}
                        disabled={isInserting}
                        className='gai:hover:bg-primary-600 gai:bg-primary-500 gai:text-white'
                    >
                        {isInserting ? 'Inserting...' : 'Insert'}
                    </Button>
                )}
            </div> */}
        </div>
    );
};

export default BrandAssets;
