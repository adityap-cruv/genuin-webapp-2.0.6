import { cn } from '@/utils'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { type FormValues } from './edit-profile'

// Component for text fields with character count
export const CounterTextField = ({
  name,
  control,
  label,
  maxLength,
  getValues,
}: {
  name: keyof FormValues
  control: any
  label: string
  maxLength: number
  getValues: (name: keyof FormValues) => string | undefined | null
}) => {
  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => {
        const errors = useFormField().error
        return (
          <FormItem className='sm:w-full'>
            <FormLabel className='text-body-1-med'>
              <div className='flex w-full justify-between'>
                <p className='!text-body-1-med'>{label}</p>
                <p className='text-cap-1-med'>
                  {getValues(name)?.length ?? 0}/{maxLength}
                </p>
              </div>
            </FormLabel>
            <FormControl>
              <Input
                maxLength={maxLength}
                type='text'
                className={cn(
                  'border border-tertiary-200 bg-tertiary-100 text-title-3-med',
                  errors && '!border-red',
                )}
                {...field}
              />
            </FormControl>
            <FormMessage className={cn('!text-cap-1-demi')} />
          </FormItem>
        )
      }}
    />
  )
}
