import { useRudderAnalytics } from './RudderAnalyticsProvider';

export const useRudderEvents = () => {
    const { rudderAnalytics } = useRudderAnalytics();

    const identify = (userId: string, traits: Record<string, any>) => {
        rudderAnalytics?.identify(userId, traits, () => {
            // console.log("identify call")
        });
    };

    const track = async (eventName: string, properties: Record<string, any> = {}) => {
        const extendedProperties = {
            source: 'genai',
            ...properties,
        };

        rudderAnalytics?.track(eventName, extendedProperties, () => {
            // console.log("DONE")
        });
    };

    return { identify, track };
};
