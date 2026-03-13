import { CustomInput } from './CustomInput';
import { WebSDKPresetPrompts } from './WebSDKPresetPrompts';

type WebSDKInputProps = {
    hideBackground?: boolean;
    showPresetPrompts: boolean;
    onClosePresetPrompts: () => void;
    setIsSuggestionsOpen: (isSuggestionsOpen: boolean) => void;
    mode?: 'compact' | 'full';
    suggestedPrompt?: string | null;
    countdown?: number | null;
    onCompactPromptSend?: () => void;
    isLoadingPrompt?: boolean;
};

export function WebSDKInput({
    hideBackground = false,
    showPresetPrompts,
    onClosePresetPrompts,
    setIsSuggestionsOpen,
    mode = 'full',
    suggestedPrompt,
    countdown,
    onCompactPromptSend,
    isLoadingPrompt,
}: WebSDKInputProps) {
    return (
        <div className='gai:relative gai:w-full'>
            <CustomInput
                hideBackground={hideBackground}
                mode={mode}
                suggestedPrompt={suggestedPrompt}
                countdown={countdown}
                onSuggestedPromptSend={onCompactPromptSend}
                isLoading={isLoadingPrompt}
            />
            {showPresetPrompts && (
                <WebSDKPresetPrompts
                    setIsSuggestionsOpen={setIsSuggestionsOpen}
                    onClose={onClosePresetPrompts}
                />
            )}
        </div>
    );
}
