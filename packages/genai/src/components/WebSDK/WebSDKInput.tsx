import { CustomInput } from './CustomInput';
import { WebSDKPresetPrompts } from './WebSDKPresetPrompts';

type WebSDKInputProps = {
    hideBackground?: boolean;
    showPresetPrompts: boolean;
    mode?: 'compact' | 'full';
    suggestedPrompt?: string | null;
    countdown?: number | null;
    isLoadingPrompt?: boolean;
    onActivate?: () => void;
    onInputStart?: () => void;
    onCompactPromptSend?: () => void;
    onClosePresetPrompts: () => void;
    setIsSuggestionsOpen: (isSuggestionsOpen: boolean) => void;
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
    onActivate,
    onInputStart,
}: WebSDKInputProps) {
    return (
        <div className='gai:relative gai:w-full'>
            <CustomInput
                hideBackground={hideBackground}
                mode={mode}
                suggestedPrompt={suggestedPrompt ?? undefined}
                countdown={countdown}
                onSuggestedPromptSend={onCompactPromptSend}
                isLoading={isLoadingPrompt}
                onActivate={onActivate}
                onInputStart={onInputStart}
            />
            {showPresetPrompts && (
                <WebSDKPresetPrompts setIsSuggestionsOpen={setIsSuggestionsOpen} onClose={onClosePresetPrompts} />
            )}
        </div>
    );
}
