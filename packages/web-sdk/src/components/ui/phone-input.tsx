import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { CheckIcon, ChevronsUpDown } from 'lucide-react'

import * as React from 'react'

import * as RPNInput from 'react-phone-number-input'

import flags from 'react-phone-number-input/flags'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from './command'
import { Input, type InputProps } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import { cn } from '@/utils'

type PhoneInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, 'onChange'> & {
    onChange: (value: RPNInput.Value) => void
    value: RPNInput.Value
  }

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
  React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
    ({ className, onChange, value, ...props }, ref) => {
      const parsedPhone = value ? parsePhoneNumberFromString(`+${value}`) : null
      const country = parsedPhone?.country || 'US'
      const formattedValue = parsedPhone?.formatInternational() || value

      return (
        <RPNInput.default
          ref={ref}
          className={cn('flex', className)}
          flagComponent={FlagComponent}
          countrySelectComponent={CountrySelect}
          inputComponent={InputComponent}
          defaultCountry={country}
          value={formattedValue}
          international
          /**
           * Handles the onChange event.
           *
           * react-phone-number-input might trigger the onChange event as undefined
           * when a valid phone number is not entered. To prevent this,
           * the value is coerced to an empty string.
           *
           * @param {E164Number | undefined} value - The entered value
           */
          onChange={(newValue) => {
            onChange(newValue ?? ('' as any))
          }}
          {...props}
        />
      )
    },
  )
PhoneInput.displayName = 'PhoneInput'

const InputComponent = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <Input
      className={cn('ml-2 rounded-lg border', className)}
      {...props}
      ref={ref}
    />
  ),
)
InputComponent.displayName = 'InputComponent'

type CountrySelectOption = { label: string; value: RPNInput.Country }

type CountrySelectProps = {
  disabled?: boolean
  value: RPNInput.Country
  onChange: (value: RPNInput.Country) => void
  options: CountrySelectOption[]
}

const CountrySelect = ({
  disabled,
  value,
  onChange,
  options,
}: CountrySelectProps) => {
  const handleSelect = React.useCallback(
    (country: RPNInput.Country) => {
      onChange(country)
    },
    [onChange],
  )
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          className='flex gap-1 cursor-pointer rounded-lg bg-tertiary-100 border-solid border border-tertiary-300 pl-3 pr-1'
          disabled={disabled}>
          <FlagComponent
            country={value}
            countryName={value}
          />
          <ChevronsUpDown
            className={cn(
              'h-4 w-4 opacity-50',
              disabled ? 'hidden' : 'opacity-100',
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[300px] p-0'>
        <Command>
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {options
                .filter((x) => x.value)
                .map((option) => (
                  <CommandItem
                    className='gap-2'
                    key={option.value}
                    onSelect={() => {
                      handleSelect(option.value)
                    }}>
                    <FlagComponent
                      country={option.value}
                      countryName={option.label}
                    />
                    <span className='flex-1 text-left'>{option.label}</span>
                    {option.value && (
                      <span>
                        {`+${RPNInput.getCountryCallingCode(option.value)}`}
                      </span>
                    )}
                    <CheckIcon
                      className={cn(
                        'ml-auto h-4 w-4',
                        option.value === value ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country]

  return (
    <span className='flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20'>
      {Flag && <Flag title={countryName} />}
    </span>
  )
}
FlagComponent.displayName = 'FlagComponent'

export { PhoneInput }
