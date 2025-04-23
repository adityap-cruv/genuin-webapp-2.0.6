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

// Component for social media field to reduce repetition
export const SocialMediaField = ({
  name,
  control,
  label,
  placeholder,
  Icon,
}: {
  name: keyof FormValues
  control: any
  label: string
  placeholder: string
  Icon: React.ComponentType<any>
}) => {
  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => {
        const errors = useFormField().error
        return (
          <FormItem className='sm:w-full'>
            <FormLabel className='!text-body-1-med'>{label}</FormLabel>
            <FormControl>
              <div className='relative flex items-center'>
                <Icon className='absolute ml-4 h-5 w-5 fill-primary' />
                <Input
                  type='text'
                  placeholder={placeholder}
                  className={cn(
                    'border border-tertiary-200 bg-tertiary-100 pl-12 text-title-3-med',
                    errors && '!border-red',
                  )}
                  {...field}
                />
              </div>
            </FormControl>
            <FormMessage className={cn('!text-cap-1-demi')} />
          </FormItem>
        )
      }}
    />
  )
}
