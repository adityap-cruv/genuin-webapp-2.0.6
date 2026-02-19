import { useEffect } from 'react';

const SDKLoader = ({ onLoad }: { onLoad?: () => void }) => {
    useEffect(() => {
        // console.log('SDK client-side effects');

        const sdkUrl = import.meta.env.VITE_GEN_SDK_URL;
        if (!sdkUrl) {
            console.error('REACT_APP_GEN_SDK_URL is not defined');
            return;
        }

        // Check if script is already loaded
        if (window.genuin) {
            onLoad?.();
            return;
        }

        const script = document.createElement('script');
        script.src = sdkUrl;
        script.async = true;

        script.onload = () => {
            // console.log('Genuin SDK loaded');
            onLoad?.();
        };

        document.body.appendChild(script);

        return () => {
            // Clean up the script if the component is unmounted
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, [onLoad]);

    return null; // This component doesn't need to render anything
};

export default SDKLoader;
