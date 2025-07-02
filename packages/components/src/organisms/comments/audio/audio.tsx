import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  ComponentProps,
} from "react";
import { PlayIcon } from "@genuin/ui/icons";
import { useInView } from "@genuin/components/hooks/use-in-view";
import { PauseIcon } from "@genuin/ui/icons";
import { AudioPlayer } from "@genuin/ui/audio-player";
import { BarWaveform } from "@genuin/ui/audio-player";
import { formatTime } from "./utils";
import { audioManager } from "@genuin/components/lib/audio-manager";
import { cn } from "@genuin/ui/lib/utils";

type AudioWaveformPlayerProps = ComponentProps<"div"> & {
  audioUrl: string;
  commentShareString?: string;
  autoAnalyze?: boolean;
  config?: {
    barWidth?: number;
    barGap?: number;
    barColor?: string;
    progressColor?: string;
    height?: number;
  };
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onProgress?: (
    progress: number,
    currentTime: number,
    duration: number
  ) => void;
  className?: string;
};

const sampleData = [
  0.2, 0.3, 0.5, 0.7, 0.2, 0.4, 0.9, 0.9, 0.2, 0.1, 0.4, 0.9, 0.8, 0.5, 0.9,
  0.7, 0.3, 0.8, 1.0, 0.8, 0.7, 0.2, 0.1, 0.9, 1.0, 0.9, 0.8, 0.1, 0.8, 0.5,
];

const CANVAS_HEIGHT = 35;

export const Audio = ({
  audioUrl,
  onPlay,
  onPause,
  onEnded,
  onProgress,
  className = "",
  ...props
}: AudioWaveformPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const canvasId = useId();
  const progressCanvasId = useId();
  const upperProgressCanvasId = useId();
  const id = useId();

  const btnRef = useRef<HTMLButtonElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // In view logic
  const elementIsInView = useInView(elementRef);
  const shouldPlay = isPlaying && elementIsInView;

  // Audio progress
  const handleAudioProgress = useCallback(
    (event: React.SyntheticEvent<HTMLAudioElement>) => {
      const audio = event.currentTarget;
      const current = audio.currentTime;
      const total = audio.duration;
      if (total && !isNaN(total)) {
        setCurrentTime(current);
        setDuration(total);
        const newProgress = current / total;
        setProgress(newProgress);
        onProgress?.(newProgress, current, total);
      }
    },
    [onProgress]
  );

  const onLoad = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const { duration } = e.currentTarget;
    setCurrentTime(0);
    setDuration(duration && !isNaN(duration) ? duration : 0);
  };

  // Play/pause toggle
  const togglePlayPause = () => {
    setIsPlaying((prev) => {
      if (prev) onPause?.();
      else onPlay?.();
      return !prev;
    });
  };

  // Audio ended
  const handleAudioEnded = (
    e: React.SyntheticEvent<HTMLAudioElement, Event>
  ) => {
    const audioRef = e.currentTarget;
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(audioRef.duration);
    onEnded?.();
  };

  // Get audio element ref for AudioPlayer
  const getAudioRef = useCallback((node: HTMLAudioElement) => {
    audioRef.current = node;
  }, []);

  useEffect(() => {
    audioManager.register(id, () => {
      audioRef.current?.pause();
      setIsPlaying(false);
    });

    return () => {
      audioManager.unregister(id);
    };
  }, [id]);

  useEffect(() => {
    if (isPlaying) {
      audioManager.notifyPlaying(id);
    }
  }, [isPlaying]);

  useEffect(() => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    const audioElement = audioRef.current;
    const progressCanvas = document.getElementById(
      progressCanvasId
    ) as HTMLCanvasElement;
    const upperProgressDiv = document.getElementById(
      upperProgressCanvasId
    ) as HTMLDivElement;
    if (!canvas || !audioElement || !progressCanvas || !upperProgressDiv)
      return;
    progressCanvas.style.setProperty("width", canvas.clientWidth + "px");

    const waveform = new BarWaveform(canvas, 6, 8, "#D4D7D9", "center");
    waveform.drawWaveform(sampleData);

    const progressWave = new BarWaveform(
      progressCanvas,
      6,
      8,
      "#939aa1",
      "center"
    );

    progressWave.drawWaveform(sampleData);

    const resizeObserver = new ResizeObserver(() => {
      progressCanvas.style.setProperty("width", canvas.clientWidth + "px");
      waveform.drawWaveform(sampleData);
      progressWave.drawWaveform(sampleData);
    });

    resizeObserver.observe(canvas);

    function handleTimeUpdate() {
      if (!audioElement || audioElement.duration === 0) return;
      upperProgressDiv.style.setProperty(
        "width",
        `${(audioElement.currentTime / audioElement.duration) * 100}%`
      );
    }

    audioElement.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      audioElement.removeEventListener("timeupdate", handleTimeUpdate);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      className={cn("gencl:w-full gencl:h-14 gencl:pr-6", className)}
      {...props}
    >
      <div
        ref={elementRef}
        className="gencl:flex gencl:w-3/5 gencl:items-center gencl:rounded-lg gencl:border gencl:gap-4 gencl:border-secondary-150 gencl:p-2"
      >
        <button
          ref={btnRef}
          onClick={togglePlayPause}
          className="gencl:focus:outline-none"
        >
          {shouldPlay ? (
            <PauseIcon variant="dark" />
          ) : (
            <PlayIcon variant="dark" />
          )}
        </button>
        {/* Waveform replaces pipeHeights */}
        <div
          className="gencl:relative gencl:w-full"
          style={{ height: CANVAS_HEIGHT }}
        >
          <canvas
            className="gencl:w-full"
            style={{ height: CANVAS_HEIGHT }}
            id={canvasId}
          />
          <div
            id={upperProgressCanvasId}
            style={{
              height: CANVAS_HEIGHT,
              width: "0px",
            }}
            className="gencl:overflow-clip gencl:absolute gencl:top-0 gencl:left-0"
          >
            <canvas
              className="gencl:w-full"
              style={{
                height: CANVAS_HEIGHT,
              }}
              id={progressCanvasId}
            ></canvas>
          </div>
        </div>
        <div className="gencl:ml-3 gencl:h-full gencl:flex gencl:items-center gencl:text-secondary-500">
          {isPlaying
            ? formatTime(currentTime)
            : formatTime(currentTime === 0 ? duration : currentTime)}
        </div>
        <AudioPlayer
          ref={getAudioRef}
          src={audioUrl}
          shouldPlay={shouldPlay}
          onProgress={handleAudioProgress}
          onEnded={handleAudioEnded}
          onLoad={onLoad}
        />
      </div>
    </div>
  );
};
