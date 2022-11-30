import { useEffect } from "react";
import { toast } from "react-toastify";
import { useClipboard } from "./hooks/useClipboard";
import CopyLink from "../images/video-actions/CopyLink.svg";
import { Image } from "@chakra-ui/react";

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
      cursor='pointer'
      src={CopyLink.src}
      width={12}
      height={12}
      alt='Share'
      title='Share'
      onClick={copy}
    />
  );
};
