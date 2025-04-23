import { Dialog, DialogClose, DialogContent } from '../ui/dialog'
import { Body } from './body'
import { SearchInput } from './search-input'
import { Loader } from '../loader'
import { GroupIcon } from '../icons/group-icon'
import { CloseIcon } from '../icons/close-icon'
import { useRepostModalContext } from '@/components/repost/context'

export function Modal() {
  const {
    isOpen,
    close,
    isLoading,
    repostCommunityData: data,
    searchStr,
  } = useRepostModalContext()

  return (
    <Dialog open={isOpen}>
      <DialogContent
        showClose={false}
        className='z-[60] flex h-5/6 flex-col overflow-hidden rounded-t-lg sm:h-2/3 sm:min-h-[400px] w-full sm:max-w-lg sm:px-8 sm:pb-0 sm:pt-6 sm:w-full'
        // onInteractOutside={close}
        // onKeyUp={(e) => {
        //   if (e.code === 'Escape') close()
        // }}
      >
        <DialogClose
          className='absolute right-4 top-4 focus:ring-0'
          onClick={close}>
          <CloseIcon className='stroke-foreground h-6 w-6' />
        </DialogClose>
        <p className='flex justify-center pb-5 text-title-1-bold'>
          Repost Post
        </p>
        {isLoading ? (
          <div className='flex h-full items-center justify-center'>
            <Loader />
          </div>
        ) : data && searchStr !== '' ? (
          <>
            <SearchInput />
            <Body />
          </>
        ) : (
          <NoData />
        )}
      </DialogContent>
    </Dialog>
  )
}

function NoData() {
  return (
    <div className='flex h-auto flex-1 flex-col items-center justify-center'>
      <div className='w-fit rounded-full bg-tertiary-200 p-2'>
        <GroupIcon className='h-10 w-10 fill-black' />
      </div>
      <p className='pt-4 text-title-2-bold'>No available Groups</p>
      <p className='text-center text-body-1-demi'>
        You must be a member in a Group to
        <br /> repost videos.
      </p>
    </div>
  )
}
