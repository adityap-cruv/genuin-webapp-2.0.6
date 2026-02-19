'use client';

import { createContext, useContext, useEffect, useState, type ReactNode, useMemo } from 'react';
import type { RudderAnalytics } from '@rudderstack/analytics-js';

interface RudderAnalyticsContextValue {
    rudderAnalytics: RudderAnalytics | null;
}

const RudderAnalyticsContext = createContext<RudderAnalyticsContextValue>({
    rudderAnalytics: null,
});

export const useRudderAnalytics = () => useContext(RudderAnalyticsContext);

export const RudderAnalyticsProvider = ({ children }: { children: ReactNode }) => {
    const [rudderAnalytics, setRudderAnalytics] = useState<RudderAnalytics | null>(null);
    const rudderstackKEY = import.meta.env.VITE_RUDDERSTACK_KEY ?? '';
    const rudderstackURL = import.meta.env.VITE_RUDDERSTACK_URL ?? '';

    useEffect(() => {
        const initialize = async () => {
            if (!rudderstackKEY || !rudderstackURL) {
                console.error('RudderStack key or URL is missing.');
                return;
            }

            const { RudderAnalytics } = await import('@rudderstack/analytics-js');
            const analytics = new RudderAnalytics();

            analytics.load(rudderstackKEY, rudderstackURL);

            analytics.ready(() => {
                console.log('RudderStack initialized successfully');
                setRudderAnalytics(analytics);
            });
        };

        initialize();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const value = useMemo(() => ({ rudderAnalytics }), [rudderAnalytics]);

    return <RudderAnalyticsContext.Provider value={value}>{children}</RudderAnalyticsContext.Provider>;
};
