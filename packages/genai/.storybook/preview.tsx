import type { Preview } from '@storybook/react-vite';

import '../src/styles/index.css';

// The genai SDK's Dialog/DropdownMenu/Popover portal into
// `document.querySelector('.genai-sdk-container')`. In runtime that's the
// SDK mount root. In Storybook we put the class on `document.body` so the
// portal target is the document root — which `querySelector` returns first
// in document order — and overlays land at iframe-viewport scope instead
// of nested in the story's flow.
if (typeof document !== 'undefined') {
    document.body.classList.add('genai-sdk-container');
}

const preview: Preview = {
    decorators: [
        Story => (
            <div className='genai-sdk-container'>
                <Story />
            </div>
        ),
    ],
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        layout: 'centered',
        backgrounds: {
            default: 'light',
            values: [
                { name: 'light', value: '#ffffff' },
                { name: 'dark', value: '#1d1f20' },
            ],
        },
    },
};

export default preview;
