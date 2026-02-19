import type {
    BrandAssetsJsonData,
    BrandConsumerBrand,
    BrandCTKWsData,
    BrandGuidelinesData,
    BrandPersonaData,
} from '@/types';
import { insertBrandDetails, insertBrandGuidelines, insertCTKWs, insertExistingBrandAsConsumerBrand, insertNewBrandAsConsumerBrand, updateBrandAssets } from './api';

// function_name is received from SSE response to identify which BCC ingestion to run
export const ingestDataToBCC = async (data: any, function_name: string) => {
    switch (function_name) {
        case 'get_ctkws':
            const get_ctkws_result: BrandCTKWsData = data.result;
            await insertCTKWs(get_ctkws_result);
            window.dispatchEvent(
                new CustomEvent('genai:onboardingStepUpdate', {
                    detail: { step: 'brand_ctkws' },
                })
            );
            break;
        case 'get_brand_asset':
            data = data as BrandAssetsJsonData;
            await updateBrandAssets(data);
            window.dispatchEvent(
                new CustomEvent('genai:onboardingStepUpdate', {
                    detail: { step: 'brand_assets' },
                })
            );
            break;
        case 'get_brand_guidelines_':
            const get_brand_guidelines_result: BrandGuidelinesData = data.result;
            await insertBrandGuidelines(get_brand_guidelines_result);
            window.dispatchEvent(
                new CustomEvent('genai:onboardingStepUpdate', {
                    detail: { step: 'brand_guidelines' },
                })
            );
            break;
        case 'get_brand_persona_':
            const get_brand_persona_result: BrandPersonaData = data.result;
            await insertBrandDetails(get_brand_persona_result);
            window.dispatchEvent(
                new CustomEvent('genai:onboardingStepUpdate', {
                    detail: { step: 'brand_persona' },
                })
            );
            break;
        case 'get_consumer_brands_':
            const {existing, new: new_brands} = data as {existing: BrandConsumerBrand[], new: BrandConsumerBrand[]};
            for(const brand of existing)  {
                await insertExistingBrandAsConsumerBrand(brand);
            }
            for(const brand of new_brands) {
                await insertNewBrandAsConsumerBrand(brand);
            }
            window.dispatchEvent(
                new CustomEvent('genai:onboardingStepUpdate', {
                    detail: { step: 'brand_consumer_brands' },
                })
            );
            break;
        default:
            break;
    }
};
