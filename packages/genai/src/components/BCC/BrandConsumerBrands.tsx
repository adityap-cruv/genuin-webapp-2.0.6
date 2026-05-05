import { useEffect, useState, useCallback, useRef } from 'react';

import { Add, Verified } from '@/assets/SvgIcons/icons';
import { useAgentsContext } from '@/context/app/context';
import { updateAgentMessage, insertExistingBrandAsConsumerBrand, insertNewBrandAsConsumerBrand } from '@/lib/api';
import type { BrandConsumerBrand } from '@/types';

const BrandConsumerBrands = ({
    messageId,
    existing = [],
    new: new_brands = [],
}: {
    messageId: string;
    existing: BrandConsumerBrand[];
    new: BrandConsumerBrand[];
}) => {
    const { updateAgentMessageContent, currentSessionId } = useAgentsContext();

    // Initialize state with proper isNew flags
    const [existingBrands, setExistingBrands] = useState<BrandConsumerBrand[]>(
        existing.map(b => ({ ...b, isNew: false }))
    );
    const [newBrands, setNewBrands] = useState<BrandConsumerBrand[]>(new_brands.map(b => ({ ...b, isNew: true })));
    const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
    const [isInserting, setIsInserting] = useState(false);

    // Use refs to track latest state for synchronous updates
    const existingBrandsRef = useRef<BrandConsumerBrand[]>(existing.map(b => ({ ...b, isNew: false })));
    const newBrandsRef = useRef<BrandConsumerBrand[]>(new_brands.map(b => ({ ...b, isNew: true })));

    // Update state when props change
    useEffect(() => {
        const updatedExisting = existing.map(b => ({ ...b, isNew: false }));
        const updatedNew = new_brands.map(b => ({ ...b, isNew: true }));
        setExistingBrands(updatedExisting);
        setNewBrands(updatedNew);
        existingBrandsRef.current = updatedExisting;
        newBrandsRef.current = updatedNew;
    }, [existing, new_brands]);

    const updateMessageContent = useCallback(
        (updatedExisting: BrandConsumerBrand[], updatedNew: BrandConsumerBrand[]) => {
            if (currentSessionId) {
                console.log('updated');
                const content = JSON.stringify({ existing: updatedExisting, new: updatedNew });
                updateAgentMessageContent(currentSessionId, messageId, content);
                updateAgentMessage({
                    chat_id: messageId,
                    agent_message: content,
                });
            }
        },
        [currentSessionId, messageId, updateAgentMessageContent]
    );

    if ((!existing && !new_brands) || (existing.length === 0 && new_brands.length === 0)) {
        return (
            <>
                {/* no consumer brands found */}
                <div className='gai:flex gai:w-full gai:flex-col gai:overflow-hidden gai:rounded-xl gai:border gai:border-[#E6ECFF]'>
                    <div className='gai:flex gai:h-9 gai:items-center gai:justify-center gai:border-b gai:border-[#E6ECFF] gai:bg-[#F7F9FF] gai:px-4 gai:py-2'>
                        <span className='gai:text-sm gai:font-medium gai:text-[#3B3E40]'>No consumer brands found</span>
                    </div>
                </div>
            </>
        );
    }

    const handleToggleSelect = (brandName: string) => {
        setSelectedBrands(prev => {
            const newSet = new Set(prev);
            if (newSet.has(brandName)) {
                newSet.delete(brandName);
            } else {
                newSet.add(brandName);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        const allBrands = [...existingBrands, ...newBrands];
        const pendingBrands = allBrands.filter(b => !b.inserted);
        if (pendingBrands.length === 0) return;

        const allSelected = pendingBrands.every(b => selectedBrands.has(b.brand_name));
        if (allSelected) {
            // Deselect all
            setSelectedBrands(new Set());
        } else {
            // Select all pending
            setSelectedBrands(new Set(pendingBrands.map(b => b.brand_name)));
        }
    };

    const handleInsertAllSelected = async () => {
        if (selectedBrands.size === 0) return;

        setIsInserting(true);
        const allBrands = [...existingBrands, ...newBrands];
        const brandsToInsert = allBrands.filter(b => selectedBrands.has(b.brand_name) && !b.inserted);

        try {
            // Create promises for all insertions with immediate state updates
            const insertionPromises = brandsToInsert.map(brand => {
                const insertPromise = brand.isNew
                    ? insertNewBrandAsConsumerBrand(brand)
                    : insertExistingBrandAsConsumerBrand(brand);

                return insertPromise
                    .then(() => {
                        // Update refs and state immediately after each successful insertion
                        if (brand.isNew) {
                            newBrandsRef.current = newBrandsRef.current.map(b =>
                                b.brand_name === brand.brand_name ? { ...b, inserted: true } : b
                            );
                            setNewBrands([...newBrandsRef.current]);
                        } else {
                            existingBrandsRef.current = existingBrandsRef.current.map(b =>
                                b.brand_name === brand.brand_name ? { ...b, inserted: true } : b
                            );
                            setExistingBrands([...existingBrandsRef.current]);
                        }

                        // Update message content immediately with latest ref values
                        updateMessageContent(existingBrandsRef.current, newBrandsRef.current);

                        return { success: true, brand };
                    })
                    .catch(error => {
                        console.error(`Failed to insert brand ${brand.brand_name}:`, error);
                        return { success: false, brand, error };
                    });
            });

            // Wait for all insertions to complete
            await Promise.all(insertionPromises);

            // Clear selection after all insertions complete
            setSelectedBrands(new Set());
        } catch (error) {
            console.error('Error during bulk insertion:', error);
        } finally {
            setIsInserting(false);
        }
    };

    const allBrands = [...existingBrands, ...newBrands];
    const pendingBrands = allBrands.filter(b => !b.inserted);
    const allPendingSelected = pendingBrands.length > 0 && pendingBrands.every(b => selectedBrands.has(b.brand_name));

    return (
        <div className='gai:flex gai:w-full gai:flex-col gai:overflow-hidden gai:rounded-xl gai:border gai:border-[#E6ECFF]'>
            {/* Table Container */}
            <div className='gai:flex gai:flex-row gai:overflow-auto'>
                {/* Checkbox Column */}
                <div className='gai:flex gai:w-12 gai:flex-col'>
                    {/* Header */}
                    <div className='gai:flex gai:h-9 gai:items-center gai:justify-center gai:border-b gai:border-[#E6ECFF] gai:bg-[#F7F9FF] gai:px-2 gai:py-2'>
                        <input
                            type='checkbox'
                            checked={allPendingSelected}
                            onChange={handleSelectAll}
                            className='gai:h-4 gai:w-4 gai:cursor-pointer gai:rounded gai:border gai:border-[#D1D5DB] gai:text-[#0645FF] gai:focus:ring-2 gai:focus:ring-[#0645FF]'
                        />
                    </div>
                    {/* Rows */}
                    {allBrands.map((brand, index) => (
                        <div
                            key={`checkbox-${index}`}
                            className='gai:flex gai:h-[60px] gai:items-center gai:justify-center gai:border-b gai:border-[#E6ECFF] gai:bg-white gai:px-2 gai:py-2.5'
                        >
                            {!brand.inserted && (
                                <input
                                    type='checkbox'
                                    checked={selectedBrands.has(brand.brand_name)}
                                    onChange={() => handleToggleSelect(brand.brand_name)}
                                    className='gai:h-4 gai:w-4 gai:cursor-pointer gai:rounded gai:border gai:border-[#D1D5DB] gai:text-[#0645FF] gai:focus:ring-2 gai:focus:ring-[#0645FF]'
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Brand Column */}
                <div className='gai:flex gai:flex-1 gai:flex-col'>
                    {/* Header */}
                    <div className='gai:flex gai:h-9 gai:items-center gai:justify-center gai:border-b gai:border-[#E6ECFF] gai:bg-[#F7F9FF] gai:px-4 gai:py-2'>
                        <span className='gai:flex-1 gai:text-center gai:text-sm gai:font-medium gai:text-[#3B3E40]'>
                            Brand
                        </span>
                    </div>
                    {/* Rows */}
                    {allBrands.map((brand, index) => (
                        <div
                            key={`brand-${index}`}
                            className='gai:flex gai:h-[60px] gai:items-center gai:justify-center gai:gap-2 gai:border-b gai:border-[#E6ECFF] gai:bg-white gai:px-4 gai:py-3'
                        >
                            {/* Brand Info */}
                            <div className='gai:flex gai:flex-col gai:items-center gai:justify-center gai:gap-0.5'>
                                <div className='gai:flex gai:items-center gai:gap-1'>
                                    <span className='gai:text-sm gai:font-semibold gai:text-[#1D1F20]'>
                                        {brand.brand_name}
                                    </span>
                                    {!brand.isNew && <Verified />}
                                </div>
                                {brand.website && (
                                    <span className='gai:text-xs gai:font-medium gai:text-[#6C757D]'>
                                        {brand.website.replace(/^https?:\/\/(www\.)?/, '')}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Status Column */}
                <div className='gai:flex gai:flex-1 gai:flex-col'>
                    {/* Header */}
                    <div className='gai:flex gai:h-9 gai:items-center gai:justify-center gai:border-b gai:border-[#E6ECFF] gai:bg-[#F7F9FF] gai:px-4 gai:py-2'>
                        <span className='gai:text-sm gai:font-medium gai:text-[#3B3E40]'>Status</span>
                    </div>
                    {/* Rows */}
                    {allBrands.map((brand, index) => (
                        <div
                            key={`status-${index}`}
                            className='gai:flex gai:h-[60px] gai:items-center gai:justify-center gai:border-b gai:border-[#E6ECFF] gai:bg-white gai:px-4 gai:py-2.5'
                        >
                            {brand.inserted ? (
                                <div className='gai:flex gai:items-center gai:justify-center gai:gap-1 gai:rounded-lg gai:border gai:border-[#34C759] gai:bg-[#E8F5E9] gai:px-2 gai:py-1'>
                                    <span className='gai:text-[10px] gai:leading-[14px] gai:font-semibold gai:text-[#1B5E20]'>
                                        Active
                                    </span>
                                </div>
                            ) : (
                                <div className='gai:flex gai:items-center gai:justify-center gai:gap-1 gai:rounded-lg gai:border gai:border-[#FFE599] gai:bg-[#FFF2CC] gai:px-2 gai:py-1'>
                                    <span className='gai:text-[10px] gai:leading-[14px] gai:font-semibold gai:text-[#997300]'>
                                        Pending
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Relationship Column */}
                <div className='gai:flex gai:flex-1 gai:flex-col'>
                    {/* Header */}
                    <div className='gai:flex gai:h-9 gai:items-center gai:justify-center gai:border-b gai:border-[#E6ECFF] gai:bg-[#F7F9FF] gai:px-4 gai:py-2'>
                        <span className='gai:text-sm gai:font-medium gai:text-[#3B3E40]'>Relationship</span>
                    </div>
                    {/* Rows */}
                    {allBrands.map((brand, index) => (
                        <div
                            key={`relationship-${index}`}
                            className='gai:flex gai:h-[60px] gai:items-center gai:justify-center gai:border-b gai:border-[#E6ECFF] gai:bg-white gai:px-4 gai:py-2.5'
                        >
                            <span className='gai:text-center gai:text-sm gai:font-medium gai:text-[#1D1F20]'>
                                {brand.relationship}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Socials Column */}
                <div className='gai:flex gai:flex-1 gai:flex-col gai:items-center'>
                    {/* Header */}
                    <div className='gai:flex gai:h-9 gai:w-full gai:items-center gai:justify-center gai:border-b gai:border-[#E6ECFF] gai:bg-[#F7F9FF] gai:px-4 gai:py-2'>
                        <span className='gai:text-sm gai:font-medium gai:text-[#3B3E40]'>Socials</span>
                    </div>
                    {/* Rows */}
                    {allBrands.map((brand, index) => {
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

                        return (
                            <div
                                key={`socials-${index}`}
                                className='gai:flex gai:h-[60px] gai:w-full gai:items-center gai:justify-center gai:border-b gai:border-[#E6ECFF] gai:bg-white gai:px-4 gai:py-2.5'
                            >
                                <div className='gai:flex gai:gap-2'>
                                    {brand.socials && brand.socials.length > 0 ? (
                                        brand.socials
                                            .sort((a, b) => a.platform.localeCompare(b.platform))
                                            .map((social, socialIndex) => {
                                                const iconUrl = getSocialIconUrl(social.platform);
                                                return iconUrl ? (
                                                    <a
                                                        key={`social-${socialIndex}`}
                                                        href={`https://${social.platform.toLowerCase()}.com/${social.platform === 'tiktok' ? '@' : ''}${social.username}`}
                                                        target='_blank'
                                                        rel='noopener noreferrer'
                                                        className='gai:flex gai:h-8 gai:w-8 gai:items-center gai:justify-center gai:rounded-[6.4px] gai:border gai:border-[#E6ECFF] gai:p-0 gai:transition-colors gai:hover:bg-[#F7F9FF]'
                                                    >
                                                        <img
                                                            src={iconUrl}
                                                            alt={social.platform}
                                                            className='gai:h-5 gai:w-5'
                                                        />
                                                    </a>
                                                ) : null;
                                            })
                                    ) : (
                                        <span className='gai:text-xs gai:text-[#6C757D]'>-</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* Insert All Button */}
            {pendingBrands.length > 0 && (
                <div className='gai:flex gai:items-center gai:justify-end gai:border-t gai:border-[#E6ECFF] gai:bg-[#F7F9FF] gai:px-4 gai:py-3'>
                    <button
                        onClick={handleInsertAllSelected}
                        disabled={selectedBrands.size === 0 || isInserting}
                        className='gai:flex gai:items-center gai:gap-1.5 gai:rounded-lg gai:bg-[#0645FF] gai:px-4 gai:py-2 gai:text-sm gai:font-medium gai:text-white gai:transition-colors gai:hover:bg-[#0539DD] gai:disabled:cursor-not-allowed gai:disabled:opacity-50'
                    >
                        <Add width='14' height='14' stroke='currentColor' />
                        {isInserting ? 'Inserting...' : `Insert Selected (${selectedBrands.size})`}
                    </button>
                </div>
            )}
        </div>
    );
};

export default BrandConsumerBrands;
