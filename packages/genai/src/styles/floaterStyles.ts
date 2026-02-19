import GenAILogo from '../assets/GenAI.png';
// import Draggabilly from 'draggabilly';

export const FLOATER_BASE_STYLES = {
    position: 'fixed' as const,
    bottom: '20px',
    right: '20px',
    width: '60px',
    height: '60px',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    // transition: 'all 0.3s ease',
    border: 'none',
    outline: 'none',
    zIndex: 9999,
    // transform: 'translateZ(0)',
    // willChange: 'transform, box-shadow',
};

// export const FLOATER_HOVER_STYLES = {
//     transform: 'scale(1.1)',
//     boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
// };

// export const FLOATER_NORMAL_STYLES = {
//     transform: 'scale(1)',
//     boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
// };

export function createFloaterContent(): string {
    return `
        <img src="${GenAILogo}" alt="GenAI" draggable="false" style="
            width: 100%;
            height: 100%;
            object-fit: contain;
        ">
    `;
}

const POSITION_STORAGE_KEY = 'genai-floater-position';

const getSavedPosition = () => {
    try {
        const saved = localStorage.getItem(POSITION_STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch {
        return null;
    }
};

export const createFloaterElement = (draggable?: boolean) => {
    // check if floater already exists
    const existingFloater = document.getElementById('genai-floater');
    if (existingFloater) {
        existingFloater.innerHTML = createFloaterContent();
        return existingFloater;
    }

    const floater = document.createElement('div');
    const savedPosition = getSavedPosition();

    // Apply base styles first
    Object.assign(floater.style, FLOATER_BASE_STYLES);

    // Override with saved position if available
    if (savedPosition) {
        floater.style.right = 'auto';
        floater.style.left = `${savedPosition.x}px`;
        floater.style.top = `${savedPosition.y}px`;
        floater.style.bottom = 'auto';
    }

    floater.id = 'genai-floater';
    floater.innerHTML = createFloaterContent();
    document.body.appendChild(floater);

    // Add click handler for non-draggable floaters (draggable floaters will have this handled by Draggabilly)
    if (!draggable) {
        floater.addEventListener('click', () => {
            floater.innerHTML = createFloaterSpinner();
            window.dispatchEvent(new Event('genai:openDialog'));
        });
    }

    return floater;
};

export function createFloaterSpinner(): string {
    return `
        <div 
            class="genai-spinner"
            style="
            width: 20px;
            height: 20px;
            border: 2px solid #ffffff;
            border-top: 2px solid transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        "></div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
}

export function showFloaterSpinner() {
    const floater = document.getElementById('genai-floater');
    if (floater) {
        floater.innerHTML = createFloaterSpinner();
        floater.style.display = 'flex';
    }
}

export function showFloaterContent() {
    const floater = document.getElementById('genai-floater');
    if (floater) {
        floater.innerHTML = createFloaterContent();
        floater.style.display = 'flex';
    }
}

export function hideFloater() {
    const floater = document.getElementById('genai-floater');
    if (floater) {
        floater.style.display = 'none';
    }
}

export function showFloater() {
    const floater = document.getElementById('genai-floater');
    if (floater) {
        floater.innerHTML = createFloaterContent();
        floater.style.display = 'flex';
    }
}
