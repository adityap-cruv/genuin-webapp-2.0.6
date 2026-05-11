import Image from "next/image";

import successGif from "@images/gifs/success.gif";

import { ModalShell } from "../modal-shell";

export function Note({ title, success = true }: { title: string; success?: boolean }) {
  return (
    <ModalShell>
      {success && <Image height={150} width={150} src={successGif} alt="success" />}
      <p className="text-title-1-demi text-center" style={{ fontSize: "32px" }}>
        {title}
      </p>
    </ModalShell>
  );
}
