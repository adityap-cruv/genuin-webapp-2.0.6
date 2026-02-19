import { useState } from 'react';

interface ToggleSwitchProps {
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
}

const ToggleSwitch = ({ checked: controlledChecked, defaultChecked = false, onChange }: ToggleSwitchProps) => {
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const isControlled = controlledChecked !== undefined;
    const checked = isControlled ? controlledChecked : internalChecked;

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const newChecked = !checked;
        if (!isControlled) {
            setInternalChecked(newChecked);
        }
        onChange?.(newChecked);
    };

    return (
        <button
            onClick={handleToggle}
            className={`gai:relative gai:inline-flex gai:h-5 gai:w-[33.34px] gai:items-center gai:rounded-full gai:transition-colors ${
                checked ? 'gai:bg-primary-500' : 'gai:bg-secondary-gray-300'
            }`}
            role='switch'
            aria-checked={checked}
        >
            <span
                className={`gai:inline-block gai:h-[13.34px] gai:w-[13.34px] gai:transform gai:rounded-full gai:bg-utility-white gai:shadow-[0px_2.5px_0.833px_rgba(0,0,0,0.059)] gai:transition-transform ${
                    checked ? 'gai:translate-x-[17px]' : 'gai:translate-x-[3px]'
                }`}
            />
        </button>
    );
};

export default ToggleSwitch;
