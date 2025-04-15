'use client'
import { Dialog, DialogContent, DialogClose } from '@components/ui/dialog'
import { type DialogProps } from '@radix-ui/react-dialog'
import { useDownloadDialogModalStore } from './store'
import { Body } from './body'
import { CloseIcon } from '@icons/close-icon'

type Props = DialogProps

export function Modal({ ...props }: Props) {
  const { isModalOpen, closeModal, title, subtitle, deepLink } = useDownloadDialogModalStore((state) => ({
    isModalOpen: state.isOpen,
    closeModal: state.close,
    title: state.title,
    subtitle: state.subtitle,
    deepLink: state.deepLink,
  }))

  return (
    <Dialog modal open={isModalOpen} {...props}>
      <DialogContent
        showClose={false}
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
        className="max-h-[90vh] overflow-y-auto rounded-t-lg !py-10">
        <DialogClose className="absolute right-3 top-3">
          <CloseIcon
            onClick={() => {
              closeModal()
            }}
          />
        </DialogClose>
        <Body title={title} subtitle={subtitle} deepLink={deepLink} />
      </DialogContent>
    </Dialog>
  )
}
