import { ModalShell } from "../modal-shell";
// import successGif from "@images/gifs/success.gif";

export function Note({
  title,
  success = true,
}: {
  title: string;
  success?: boolean;
}) {
  // TODO: put a path for success image after hosting it.
  return (
    <ModalShell>
      {success && (
        <img height={150} width={150} src={"put-path"} alt="success" />
      )}
      <p className="text-center text-title-1-demi" style={{ fontSize: "32px" }}>
        {title}
      </p>
    </ModalShell>
  );
}
