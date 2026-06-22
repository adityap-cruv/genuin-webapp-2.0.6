import { eventBus } from '@/core/events/EventBus';
import { EVENTS } from '@/core/events/eventRegistry';
import type {
    BrandAssetsJsonData,
    BrandConsumerBrand,
    BrandCTKWsData,
    BrandGuidelinesData,
    BrandPersonaData,
} from '@/types';

import {
    insertBrandDetails,
    insertBrandGuidelines,
    insertCTKWs,
    insertExistingBrandAsConsumerBrand,
    insertNewBrandAsConsumerBrand,
    updateBrandAssets,
} from './api';

// function_name is received from SSE response to identify which BCC ingestion to run
export const ingestDataToBCC = async (data: any, function_name: string) => {
    switch (function_name) {
        case 'get_ctkws': {
            const get_ctkws_result: BrandCTKWsData = data.result;
            await insertCTKWs(get_ctkws_result);
            eventBus.emit(EVENTS.ONBOARDING_STEP_UPDATE, { step: 'brand_ctkws' });
            break;
        }
        case 'get_brand_asset':
            data = data as BrandAssetsJsonData;
            await updateBrandAssets(data);
            eventBus.emit(EVENTS.ONBOARDING_STEP_UPDATE, { step: 'brand_assets' });
            break;
        case 'get_brand_guidelines_': {
            const get_brand_guidelines_result: BrandGuidelinesData = data.result;
            await insertBrandGuidelines(get_brand_guidelines_result);
            eventBus.emit(EVENTS.ONBOARDING_STEP_UPDATE, { step: 'brand_guidelines' });
            break;
        }
        case 'get_brand_persona_': {
            const get_brand_persona_result: BrandPersonaData = data.result;
            await insertBrandDetails(get_brand_persona_result);
            eventBus.emit(EVENTS.ONBOARDING_STEP_UPDATE, { step: 'brand_persona' });
            break;
        }
        case 'get_consumer_brands_': {
            const { existing, new: new_brands } = data as { existing: BrandConsumerBrand[]; new: BrandConsumerBrand[] };
            for (const brand of existing) {
                await insertExistingBrandAsConsumerBrand(brand);
            }
            for (const brand of new_brands) {
                await insertNewBrandAsConsumerBrand(brand);
            }
            eventBus.emit(EVENTS.ONBOARDING_STEP_UPDATE, { step: 'brand_consumer_brands' });
            break;
        }
        default:
            break;
    }
};
