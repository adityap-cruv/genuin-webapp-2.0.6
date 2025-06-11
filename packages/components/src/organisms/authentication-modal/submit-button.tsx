import { Button, type ButtonProps } from "@genuin/ui/button";
import { FormMessage } from "@genuin/ui/components/form";
import { Loader } from "@genuin/ui/loader";

export type SubmitButtonProps = Omit<ButtonProps, "children"> & {
  isLoading?: boolean;
  title?: string;
  error?: string;
};

export function SubmitButton({
  type = "submit",
  isLoading,
  title = "Submit",
  disabled,
  error,
  ...rest
}: SubmitButtonProps) {
  return (
    <div className="gencl:space-y-1">
      <Button
        theme="primary"
        className="gencl:w-full"
        type={type}
        disabled={isLoading || disabled}
        {...rest}
      >
        {isLoading ? (
          <Loader size="sm" strokeColor="white" />
        ) : (
          <span>{title}</span>
        )}
      </Button>
      {error && <FormMessage error>{error}</FormMessage>}
    </div>
  );
}
