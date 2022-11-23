import { useEffect } from "react";
import { toast } from "react-toastify";
import { Image } from "react-bootstrap";
import { useClipboard } from "./hooks/useClipboard";
import CopyLink from "../images/video-actions/CopyLink.svg";

export const ShareComponent = ({ title, description, url }) => {
  const [isCopied, copy] = useClipboard(url, { successDuration: 1000 });

  useEffect(() => {
    if (isCopied) {
      let key;
      key = toast("Link copied!", {
        autoClose: false,
        hideProgressBar: true,
      });
      return () => {
        toast.dismiss(key);
      };
    }
  }, [isCopied]);

  return (
    <Image
      src={CopyLink.src}
      width={48}
      height={48}
      alt='Share'
      title='Share'
      onClick={copy}
    />
  );
};
