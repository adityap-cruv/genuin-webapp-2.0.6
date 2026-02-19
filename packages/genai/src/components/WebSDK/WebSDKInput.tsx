import { CustomInput } from './CustomInput';

type WebSDKInputProps = {
    hideBackground?: boolean;
};

export function WebSDKInput({ hideBackground = false }: WebSDKInputProps) {
    return <CustomInput hideBackground={hideBackground} />;
}
