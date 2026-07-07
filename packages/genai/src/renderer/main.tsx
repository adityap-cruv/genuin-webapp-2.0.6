import { createRoot } from 'react-dom/client';

import '../styles/index.css';

import App from './App';

createRoot(document.getElementById('root')!).render(
    // <StrictMode>
    <>
        <div style={{ height: '50vh', width: '100%' }}>
            <div
                id='genai-sdk-container'
                className='genai-sdk-container'
                style={{ height: '100%', width: '100%', backgroundColor: 'black' }}
            >
                <App
                    userId='67b481efcda9a91b630d3843'
                    brandId={1729}
                    view='web-sdk'
                    videoId='1174be49-e552-429a-b827-f7cbd631eb80'
                    renderMode='compact'
                    autoPromptConfig={{
                        mode: 'countdown-only',
                        countdownMs: 0,
                        // idealDelayMs: 7_000,
                        // nextPromptDelayMs: 7_000,
                    }}
                    // sessionId='c2c0d38e-2f0c-4a7f-b49c-2ced24281971'
                />
            </div>
        </div>
    </>

    // </StrictMode>
);
