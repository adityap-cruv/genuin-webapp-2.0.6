"use client";
import { type DialogProps } from "@radix-ui/react-dialog";

import { Dialog, DialogContent, DialogClose } from "@components/ui/dialog";
import { CloseIcon } from "@icons/close-icon";

import { Body } from "./body";
import { useDownloadDialogModalStore } from "./store";

type Props = DialogProps;

export function Modal({ ...props }: Props) {
  const { isModalOpen, closeModal, title, subtitle, deepLink } = useDownloadDialogModalStore((state) => ({
    isModalOpen: state.isOpen,
    closeModal: state.close,
    title: state.title,
    subtitle: state.subtitle,
    deepLink: state.deepLink,
  }));

  return (
    <Dialog modal open={isModalOpen} {...props}>
      <DialogContent
        showClose={false}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="max-h-[90vh] overflow-y-auto rounded-t-lg !py-10">
        <DialogClose className="absolute top-3 right-3">
          <CloseIcon
            onClick={() => {
              closeModal();
            }}
          />
        </DialogClose>
        <Body title={title} subtitle={subtitle} deepLink={deepLink} />
      </DialogContent>
    </Dialog>
  );
}
