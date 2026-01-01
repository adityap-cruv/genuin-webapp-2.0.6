
import { SearchIcon, XIcon, XIconProps } from "@genuin/ui/icons";
import { Button } from "@genuin/ui/components/button";
import { Input } from "@genuin/ui/components/input";
import { cn } from "@genuin/ui/lib/utils";

type SearchInputProps = React.ComponentProps<"input"> & {
  buttonProps?: React.ComponentProps<"button">;
  iconProps?: XIconProps;
  onClear?: () => void;
};

export function SearchInput({
  className,
  onClear,
  disabled,
  iconProps = {},
  buttonProps = {},
  ...restProps
}: SearchInputProps) {
  const { className: buttonClassName, ...restButtonProps } = buttonProps;
  return (
    <div className="gencl:relative gencl:flex gencl:items-center gencl:w-full">
      <Input
        icon={<SearchIcon />}
        className={cn("gencl:pr-10", className)}
        disabled={disabled}
        {...restProps}
      />
      {restProps?.value && (
        <Button
          theme="text"
          className={cn(
            "gencl:absolute gencl:right-3 gencl:p-0 gencl:w-6 gencl:h-6",
            buttonClassName
          )}
          aria-label="Clear search"
          type="button"
          onClick={onClear}
          disabled={disabled}
          {...restButtonProps}
        >
          <XIcon size="sm" {...iconProps} />
        </Button>
      )}
    </div>
  );
}
