import { CheckIcon, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { cn } from "@genuin/ui/lib/utils";

import { Button } from "../button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "../command";
import { Input, type InputProps } from "../input";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover";

type PhoneInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
    onChange: (value: RPNInput.Value) => void;
    value: RPNInput.Value;
    popoverClassName?: string;
  };

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
  React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
    ({ className, onChange, popoverClassName, ...props }, ref) => (
      <RPNInput.default
        ref={ref}
        className={cn("gencl:flex", className)}
        flagComponent={FlagComponent}
        countrySelectComponent={(selectProps) => (
          <CountrySelect {...selectProps} popoverClassName={popoverClassName} />
        )}
        inputComponent={InputComponent}
        defaultCountry="US"
        withCountryCallingCode
        countryCallingCodeEditable
        /**
         * Handles the onChange event.
         *
         * react-phone-number-input might trigger the onChange event as undefined
         * when a valid phone number is not entered. To prevent this,
         * the value is coerced to an empty string.
         *
         * @param {E164Number | undefined} value - The entered value
         */
        onChange={(value) => {
          onChange(value ?? ("" as any));
        }}
        {...props}
      />
    )
  );
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <Input
      className={cn(
        "gencl:ml-2 gencl:rounded-lg gencl:border gencl:border-secondary-300",
        className
      )}
      {...props}
      ref={ref}
      placeholder="Phone number"
    />
  )
);
InputComponent.displayName = "InputComponent";

type CountrySelectOption = { label: string; value: RPNInput.Country };

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  onChange: (value: RPNInput.Country) => void;
  options: CountrySelectOption[];
  popoverClassName?: string;
};

const CountrySelect = ({
  disabled,
  value,
  onChange,
  options,
  popoverClassName,
}: CountrySelectProps) => {
  const handleSelect = React.useCallback(
    (country: RPNInput.Country) => {
      onChange(country);
    },
    [onChange]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          theme="outline"
          className={cn(
            "gencl:flex gencl:gap-1 gencl:rounded-lg gencl:border-secondary-300 gencl:pl-3 gencl:pr-1"
          )}
          disabled={disabled}
        >
          <FlagComponent country={value} countryName={value} />
          <ChevronsUpDown
            className={cn(
              "gencl:h-4 gencl:w-4 gencl:opacity-50",
              disabled ? "gencl:hidden" : "gencl:opacity-100"
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("gencl:w-[300px] gencl:z-10 gencl:p-0", popoverClassName)}
      >
        <Command>
          <CommandList>
            {/* <CommandInput placeholder="Search country..." /> */}
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {options
                .filter((x) => x.value)
                .map((option) => (
                  <CommandItem
                    className="gencl:gap-2"
                    key={option.value}
                    onSelect={() => {
                      handleSelect(option.value);
                    }}
                  >
                    <FlagComponent
                      country={option.value}
                      countryName={option.label}
                    />
                    <span className="gencl:text-sm gencl:flex-1 gencl:text-left">
                      {option.label}
                    </span>
                    {option.value && (
                      <span className="gencl:text-sm gencl:text-foreground/50">
                        {`+${RPNInput.getCountryCallingCode(option.value)}`}
                      </span>
                    )}
                    <CheckIcon
                      className={cn(
                        "gencl:ml-auto gencl:h-4 gencl:w-4",
                        option.value === value
                          ? "gencl:opacity-100"
                          : "gencl:opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="gencl:flex gencl:h-4 gencl:w-6 gencl:overflow-hidden gencl:rounded-sm gencl:bg-foreground/20">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};
FlagComponent.displayName = "FlagComponent";

export { PhoneInput };
