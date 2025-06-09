import React, { ComponentProps, useEffect, useRef, useImperativeHandle } from "react";

type Props = ComponentProps<"audio"> & {
  shouldPlay?: boolean;
  onProgress?: React.ReactEventHandler<HTMLAudioElement>;
};

export const AudioPlayer = React.forwardRef<HTMLAudioElement, Props>(
  (
    {
      src,
      shouldPlay = false,
      onProgress,
      onLoad,
      onEnded,
      ...restProps
    },
    ref
  ) => {
    const internalAudioRef = useRef<HTMLAudioElement>(null);

    // Expose the audio element to parent if ref is provided
    useImperativeHandle(ref, () => internalAudioRef.current as HTMLAudioElement, [internalAudioRef.current]);
    const audioRef = internalAudioRef;

    useEffect(() => {
      const element = internalAudioRef.current;
      if (!element) return;
      if (shouldPlay) {
        void element.play();
      } else {
        element.pause();
      }
    }, [shouldPlay]);

    return (
      <audio
        onLoadedData={onLoad}
        onTimeUpdate={onProgress}
        onEnded={onEnded}
        className="gencl:absolute gencl:-z-10"
        ref={audioRef}
        src={src}
        {...restProps}
      />
    );
  }
);
