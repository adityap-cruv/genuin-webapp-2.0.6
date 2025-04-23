import React from 'react'
import { Dialog, DialogTrigger, DialogContent } from '@components/ui/dialog'
import { LockIcon } from '@icons/LockIcon'

type Props = {
  children: React.ReactNode
}

export function PrivateModal({ children }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="rounded-t-2xl">
        <div>
          <p className="my-4 text-center text-title-2-demi">Community Type</p>
          <div className="flex gap-4">
            <div className="h-14 w-14 rounded-full bg-tertiary-200 p-3">
              <LockIcon className="h-8 w-8 stroke-tertiary" />
            </div>
            <div>
              <p className="my-2 text-title-3-med">Private</p>
              <p className="text-body-1-med text-tertiary">
                Only people approved by this community's moderators can see and participate in this community.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
