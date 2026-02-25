import { CustomInput } from './CustomInput';
import { WebSDKPresetPrompts } from './WebSDKPresetPrompts';

type WebSDKInputProps = {
    hideBackground?: boolean;
    showPresetPrompts: boolean;
    onClosePresetPrompts: () => void;
    setIsSuggestionsOpen: (isSuggestionsOpen: boolean) => void;
};

export function WebSDKInput({
    hideBackground = false,
    showPresetPrompts,
    onClosePresetPrompts,
    setIsSuggestionsOpen,
}: WebSDKInputProps) {
    return (
        <div className='gai:relative gai:w-full'>
            <CustomInput hideBackground={hideBackground} />
            {showPresetPrompts && (
                <WebSDKPresetPrompts
                    setIsSuggestionsOpen={setIsSuggestionsOpen}
                    onClose={onClosePresetPrompts}
                />
            )}
        </div>
    );
}
