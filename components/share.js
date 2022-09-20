import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { Image } from 'react-bootstrap';
import { useWebShare } from './hooks/useWebShare';
import { useClipboard } from './hooks/useClipboard';
import shareImg from '../images/video-more-options/ic-share.svg';

export const ShareComponent = ({ title, description, url }) => {
  const { isSupported, loading, share } = useWebShare();
  const [isCopied, copy] = useClipboard(url, { successDuration: 1000 });

  useEffect(() => {
    if (isCopied) {
      let key;
      key = toast('link copied!', {
        autoClose: false,
        hideProgressBar: true,
      });
      return () => {
        toast.dismiss(key);
      };
    }
    return null;
  }, [isCopied]);

  return (
    <Image
      src={shareImg.src}
      width='24'
      height='24'
      alt='Share'
      title='Share'
      onClick={() =>
        isSupported && !loading
          ? share({ url: url, title: title, text: description })
          : copy()
      }
    />
  );
};
