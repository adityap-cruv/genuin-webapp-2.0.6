import { useModalHandler } from '@/hooks/useModalHandler'
import { cn } from '@/utils'
import { AddIcon } from './icons/add-icon'

const CreateCommunityButton = () => {
  const { handleAppDownloadModal } = useModalHandler()

  return (
    <div
      className='flex w-full max-w-full shrink-0 items-center gap-x-3 cursor-pointer rounded-md p-2 px-4 hover:bg-tertiary-200'
      onClick={() => {
        void handleAppDownloadModal()
      }}>
      <AddIcon className='stroke-primary' />
      <p className={cn('whitespace-nowrap !text-title-3-demi text-primary')}>
        Create Community
      </p>
    </div>
  )
}

export default CreateCommunityButton
