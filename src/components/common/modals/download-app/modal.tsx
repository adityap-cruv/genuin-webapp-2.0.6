'use client'
import { Dialog, DialogTrigger, DialogContent, DialogClose } from '@components/ui/dialog'
import { type DialogProps } from '@radix-ui/react-dialog'
import { useDownloadDialogModalStore } from './store'
import { DownloadDialog } from './download-dialog'
import { X } from 'lucide-react'

type Props = DialogProps

export function Modal({ ...props }: Props) {
  const { isModalOpen, closeModal, title, subtitle } = useDownloadDialogModalStore((state) => ({
    isModalOpen: state.isOpen,
    closeModal: state.close,
    title: state.title,
    subtitle: state.subtitle,
  }))

  return (
    <Dialog modal open={isModalOpen} {...props}>
      <DialogContent
        showClose={false}
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
        className="rounded-t-lg !py-10">
        <DialogClose className="absolute right-2 top-2">
          <X
            onClick={() => {
              closeModal()
            }}
          />
        </DialogClose>
        <DownloadDialog title={title} subtitle={subtitle} />
      </DialogContent>
    </Dialog>
  )
}
