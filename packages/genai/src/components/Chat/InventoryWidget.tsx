import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SyntheticEvent } from 'react';

import { useAgentsContext } from '@/context/app/context';
import { renderInventoryWidget, type InventoryRenderRequest, type InventoryRenderResponse } from '@/lib/api';
import type { ToolMetadataPayload } from '@/types';

import Spinner from '../ui/spinner';

type InventoryWidgetProps = {
    metadata: ToolMetadataPayload;
};

const extractHtml = (response: InventoryRenderResponse | null | undefined): string => {
    if (!response) return '';
    if (typeof response === 'string') return response;
    return response.html ?? '';
};

const deriveRenderPayloads = (metadata: ToolMetadataPayload | undefined): InventoryRenderRequest[] => {
    if (!metadata) return [];
    const structured = metadata.structuredContent;
    const inventoryItems = structured?.inventory;
    const fallbackTemplateId = structured?.templates?.template_id;
    const fallbackBrandId = structured?.brand_id;

    if (Array.isArray(inventoryItems) && inventoryItems.length > 0) {
        const payloads = inventoryItems
            .map((item) => {
                const templateId = item?.template_id ?? fallbackTemplateId;
                const inventoryId = item?.inventory_id;
                const brandId = item?.brand_id ?? fallbackBrandId;

                if (!templateId || !inventoryId || !brandId) {
                    return null;
                }

                return {
                    template_id: templateId,
                    inventory_id: inventoryId,
                    brand_id: brandId,
                } satisfies InventoryRenderRequest;
            })
            .filter(Boolean) as InventoryRenderRequest[];

        if (payloads.length > 0) {
            return payloads;
        }
    }

    const firstInventory = Array.isArray(inventoryItems) ? inventoryItems[0] : undefined;
    const templateId = firstInventory?.template_id ?? fallbackTemplateId;
    const inventoryId = firstInventory?.inventory_id ?? structured?.inventory_id;
    const brandId = firstInventory?.brand_id ?? fallbackBrandId;

    if (typeof templateId === 'string' && typeof inventoryId === 'string' && typeof brandId === 'string') {
        return [
            {
                template_id: templateId,
                inventory_id: inventoryId,
                brand_id: brandId,
            },
        ];
    }

    return [];
};

const InventoryWidget = ({ metadata }: InventoryWidgetProps) => {
    const { view } = useAgentsContext();
    const [htmlContents, setHtmlContents] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [iframeHeights, setIframeHeights] = useState<number[]>([]);

    const renderPayloads = useMemo(() => deriveRenderPayloads(metadata).slice(0, 2), [metadata]);
    const requestId = metadata?._meta?.request_id ?? 'inventory-widget';
    const isWebSdkView = view === 'web-sdk';
    const defaultFrameWidth = isWebSdkView ? '100%' : '408px';
    const defaultIframeHeight = 320;
    const overflowPadding = 10;

    useEffect(() => {
        if (htmlContents.length === 0) {
            setIframeHeights([]);
            return;
        }

        setIframeHeights(Array(htmlContents.length).fill(defaultIframeHeight));
    }, [htmlContents, defaultIframeHeight]);

    const handleIframeLoad = useCallback(
        (index: number) => (event: SyntheticEvent<HTMLIFrameElement>) => {
            const iframe = event.currentTarget;

            try {
                const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
                if (!doc) {
                    return;
                }

                const bodyHeight = doc.body?.scrollHeight ?? 0;
                const docHeight = doc.documentElement?.scrollHeight ?? 0;
                const contentHeight = Math.max(bodyHeight, docHeight);

                if (contentHeight <= 0) {
                    return;
                }

                setIframeHeights((prev) => {
                    const next = [...prev];
                    const hasOverflow = contentHeight > defaultIframeHeight;
                    const heightWithPadding = hasOverflow ? contentHeight + overflowPadding : Math.max(contentHeight, defaultIframeHeight);
                    next[index] = heightWithPadding;
                    return next;
                });
            } catch (err) {
                console.error('[InventoryWidget] Unable to resize iframe', err);
            }
        },
        [defaultIframeHeight, overflowPadding],
    );

    useEffect(() => {
        if (!isWebSdkView) {
            return;
        }

        let isActive = true;
        const fetchRenderedHtml = async () => {
            setIsLoading(true);
            setError(null);
            setHtmlContents([]);

            try {
                if (renderPayloads.length === 0) {
                    throw new Error('Missing inventory details');
                }

                const responses = await Promise.all(renderPayloads.map((payload) => renderInventoryWidget(payload)));
                if (!isActive) return;
                const htmlSnippets = responses.map((response) => extractHtml(response)).filter(Boolean).slice(0, 2);

                if (htmlSnippets.length === 0) {
                    setError('Unable to load inventory widget.');
                    setHtmlContents([]);
                    return;
                }

                setHtmlContents(htmlSnippets);
            } catch (err) {
                if (!isActive) return;
                console.error('[InventoryWidget] Failed to fetch rendered inventory HTML', err);
                setError('Unable to load inventory widget.');
                setHtmlContents([]);
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        if (renderPayloads.length > 0) {
            fetchRenderedHtml();
        }

        return () => {
            isActive = false;
        };
    }, [renderPayloads, isWebSdkView]);

    if (!metadata || renderPayloads.length === 0 || !isWebSdkView) {
        return null;
    }

    return (
        <div style={{ width: defaultFrameWidth, maxWidth: defaultFrameWidth }}>
            {isLoading ? (
                <div className='gai:overflow-hidden gai:rounded-xl gai:border gai:border-secondary-gray-200 gai:bg-white'>
                    <div className='gai:flex gai:h-[320px] gai:w-full gai:items-center gai:justify-center'>
                        <Spinner size='md' />
                    </div>
                </div>
            ) : error ? (
                <div className='gai:overflow-hidden gai:rounded-xl gai:border gai:border-secondary-gray-200 gai:bg-white'>
                    <div className='gai:flex gai:h-[320px] gai:w-full gai:items-center gai:justify-center gai:px-4 gai:text-center gai:text-secondary-gray-600 gai:text-sm'>
                        {error}
                    </div>
                </div>
            ) : htmlContents.length > 0 ? (
                <div className='gai:flex gai:flex-col gai:space-y-4'>
                    {htmlContents.map((content, index) => (
                        <div
                            key={`inventory-widget-${requestId}-${index}`}
                            className='gai:overflow-hidden gai:rounded-xl gai:border gai:border-secondary-gray-200 gai:bg-white'
                        >
                            <iframe
                                title={`inventory-widget-${requestId}-${index}`}
                                srcDoc={content}
                                className='gai:w-full'
                                style={{
                                    width: defaultFrameWidth,
                                    maxWidth: defaultFrameWidth,
                                    height: iframeHeights[index] ?? defaultIframeHeight,
                                }}
                                sandbox='allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation'
                                loading='lazy'
                                onLoad={handleIframeLoad(index)}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className='gai:overflow-hidden gai:rounded-xl gai:border gai:border-secondary-gray-200 gai:bg-white'>
                    <div className='gai:flex gai:h-[320px] gai:w-full gai:items-center gai:justify-center gai:px-4 gai:text-center gai:text-secondary-gray-600 gai:text-sm'>
                        Inventory widget is unavailable.
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryWidget;
