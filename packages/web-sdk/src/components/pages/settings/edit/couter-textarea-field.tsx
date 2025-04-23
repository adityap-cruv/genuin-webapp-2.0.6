import { cn } from '@/utils'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { FormValues } from './edit-profile'

// Component for textarea fields with character count
export const CounterTextareaField = ({
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
              <Textarea
                maxLength={maxLength}
                {...field}
                value={field.value ?? ''}
                className={cn(
                  'border-tertiary-200 border bg-tertiary-100 p-2 py-3 text-title-3-med',
                  errors && '!border-red',
                )}
              />
            </FormControl>
            <FormMessage className={cn('!text-cap-1-demi')} />
          </FormItem>
        )
      }}
    />
  )
}
