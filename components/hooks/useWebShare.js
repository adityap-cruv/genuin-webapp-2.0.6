import { useState, useEffect } from 'react';

function getUrl(url) {
  if (!!url) {
    return url;
  } else {
    const canonicalEl = document.querySelector('link[rel=canonical]');
    return canonicalEl ? canonicalEl.href : window.location.href;
  }
}

function shareContent(onSuccess, onError) {
  return function (config) {
    const url = getUrl(config.url);
    const title = config.title || document.title;
    const text = config.text;
    navigator.share({ text, title, url }).then(onSuccess).catch(onError);
  };
}

export const useWebShare = (onSuccess = () => {}, onError = () => {}) => {
  const [loading, setLoading] = useState(true);
  const [isSupported, setSupport] = useState(false);

  useEffect(() => {
    if (!!navigator.share) {
      setSupport(true);
    } else {
      setSupport(false);
    }
    setLoading(false);
  }, [onSuccess, onError]);

  return {
    loading,
    isSupported,
    share: shareContent(onSuccess, onError),
  };
};
