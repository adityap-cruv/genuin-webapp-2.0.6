function getSupportedMimeType(): string {
  const types = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4;codecs=h264",
    "video/mp4",
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "video/webm";
}

export async function trimVideo({
  file,
  startTime,
  endTime,
  onProgress,
}: {
  file: File;
  startTime: number;
  endTime: number;
  onProgress?: (progress: number, progressText: string) => void;
}): Promise<Blob | null> {
  if (!file) throw new Error("No file selected");
  if (startTime >= endTime)
    throw new Error("Start time must be less than end time");
  if (!("MediaRecorder" in window)) {
    throw new Error(
      "Video trimming is not supported in this browser. Please use Chrome, Firefox, or Safari."
    );
  }

  try {
    onProgress?.(0, "Setting up video processing...");

    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.muted = true;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = reject;
    });

    onProgress?.(10, "Creating video canvas...");

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    onProgress?.(20, "Starting recording...");

    const stream = canvas.captureStream(30); // 30 FPS

    try {
      let audioStream;
      // @ts-ignore
      if (video.captureStream) {
        // @ts-ignore
        audioStream = video.captureStream();
        // @ts-ignore
      } else if (video.mozCaptureStream) {
        // @ts-ignore
        audioStream = video.mozCaptureStream();
      }

      if (audioStream) {
        const audioTracks = audioStream.getAudioTracks();
        if (audioTracks.length > 0) {
          stream.addTrack(audioTracks[0]);
        }
      }
    } catch (e) {
      console.log("Audio capture not available:", e);
    }

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: getSupportedMimeType(),
    });

    const chunks: BlobPart[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    onProgress?.(30, "Processing video frames...");

    const recordingPromise = new Promise<Blob>((resolve, reject) => {
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
        resolve(blob);
      };
      mediaRecorder.onerror = reject;
    });

    mediaRecorder.start(100);

    video.currentTime = startTime;
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
    });

    onProgress?.(40, "Recording trimmed video...");

    video.play();

    const frameRate = 30;
    const frameInterval = 1000 / frameRate;
    let lastFrameTime = 0;

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const drawFrame = () => {
      if (video.currentTime >= endTime || video.ended) {
        mediaRecorder.stop();
        video.pause();
        return;
      }

      const now = Date.now();
      if (now - lastFrameTime >= frameInterval) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        lastFrameTime = now;

        const trimDuration = endTime - startTime;
        const currentProgress = (video.currentTime - startTime) / trimDuration;
        onProgress?.(
          40 + currentProgress * 50,
          `Recording... ${formatTime(
            video.currentTime - startTime
          )} / ${formatTime(trimDuration)}`
        );
      }

      requestAnimationFrame(drawFrame);
    };

    drawFrame();

    const resultBlob = await recordingPromise;

    onProgress?.(95, "Finalizing video...");

    // Cleanup
    URL.revokeObjectURL(video.src);

    onProgress?.(100, "Complete!");

    return resultBlob;
  } catch (err: any) {
    console.error("Video trimming error:", err);
    throw new Error(`Video processing failed: ${err.message}`);
  }
}

export function downloadBlob(
  blob: Blob,
  originalName: string,
  suffix = "trimmed"
) {
  const baseName = originalName?.replace(/\.[^/.]+$/, "");
  const extension = blob.type.includes("webm") ? "webm" : "mp4";
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${baseName}_${suffix}.${extension}`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
