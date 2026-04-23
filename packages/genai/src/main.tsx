import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
    // <StrictMode>
    <>
        <div style={{ height: '100vh', width: '100%' }}>
            <div id='genai-sdk-container' className='genai-sdk-container' style={{ height: '100%', width: '100%' }}>
                <App
                    userId='67b481efcda9a91b630d3843'
                    brandId={-1}
                    // sessionId='c2c0d38e-2f0c-4a7f-b49c-2ced24281971'
                />
            </div>
        </div>
    </>

    // </StrictMode>
);
