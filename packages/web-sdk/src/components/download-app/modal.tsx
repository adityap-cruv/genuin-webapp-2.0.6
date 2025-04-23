'use client'
import { type DialogProps } from '@radix-ui/react-dialog'
import { Body } from './body'
import { Dialog, DialogClose, DialogContent } from '../ui/dialog'
import { CloseIcon } from '../icons/close-icon'
import { useDownloadDialogContext } from './context'

type Props = DialogProps

export function DownloadAppModal({ ...props }: Props) {
  const { close, isOpen, title, subtitle, deepLink } =
    useDownloadDialogContext()

  return (
    <Dialog
      modal
      open={isOpen}
      {...props}>
      <DialogContent
        showClose={false}
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
        className='max-h-[90vh] overflow-y-auto rounded-t-lg !py-10'>
        <DialogClose className='absolute right-3 top-3'>
          <CloseIcon
            onClick={() => {
              close()
            }}
          />
        </DialogClose>
        <Body
          title={title}
          subtitle={subtitle}
          deepLink={deepLink}
        />
      </DialogContent>
    </Dialog>
  )
}
