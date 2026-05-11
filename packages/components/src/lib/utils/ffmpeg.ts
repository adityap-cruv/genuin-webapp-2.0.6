const FFMPEG_URL = "https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js";
const FFMPEG_UTIL_URL = "https://unpkg.com/@ffmpeg/util@0.12.1/dist/esm/index.js";
const FFMPEG_CORE_URL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

export async function loadFFmpeg(ffmpegRef: any): Promise<void> {
  try {
    console.log("Loading FFmpeg...");

    const { FFmpeg } = await import(FFMPEG_URL);
    const { fetchFile, toBlobURL } = await import(FFMPEG_UTIL_URL);

    const ffmpeg = new FFmpeg();
    ffmpegRef.current = { ffmpeg, fetchFile, toBlobURL };

    ffmpeg.on("log", ({ message }: { message: string }) => {
      console.log(message);
    });

    ffmpeg.on("progress", ({ progress }: { progress: number }) => {
      const percent = Math.round(progress * 100);
      console.log("Processing...", percent);
    });

    const baseURL = FFMPEG_CORE_URL;
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });

    console.log("FFmpeg loaded successfully!");
  } catch (error) {
    console.error("Failed to load FFmpeg.", error);
    throw error;
  }
}

export async function trimVideo({
  ffmpegRef,
  file,
  startTime,
  endTime,
  outputFormat = "mp4",
  setProcessing,
}: {
  ffmpegRef: any;
  file: File;
  startTime: number;
  endTime: number;
  outputFormat?: string;
  setProcessing: (val: boolean) => void;
}): Promise<Blob | null> {
  if (!file) throw new Error("No file selected");
  if (!ffmpegRef?.current?.ffmpeg) throw new Error("FFmpeg not loaded");
  if (startTime >= endTime) throw new Error("Start time must be less than end time");

  setProcessing(true);

  try {
    const { ffmpeg, fetchFile } = ffmpegRef.current;
    const inputFileName = `input.${getFileExtension(file.name)}`;
    const outputFileName = `output.${outputFormat}`;

    await ffmpeg.writeFile(inputFileName, await fetchFile(file));

    const duration = endTime - startTime;
    const command = [
      "-i",
      inputFileName,
      "-ss",
      startTime.toString(),
      "-t",
      duration.toString(),
      "-c",
      "copy",
      "-avoid_negative_ts",
      "make_zero",
      outputFileName,
    ];

    await ffmpeg.exec(command);

    const outputData = await ffmpeg.readFile(outputFileName);
    const blob = new Blob([outputData.buffer], {
      type: `video/${outputFormat}`,
    });

    await ffmpeg.deleteFile(inputFileName);
    await ffmpeg.deleteFile(outputFileName);

    return blob;
  } catch (error) {
    console.error("Trimming failed:", error);
    return null;
  } finally {
    setProcessing(false);
  }
}

export function downloadBlob(blob: Blob, originalName: string, suffix = "trimmed", format = "mp4") {
  const baseName = originalName?.replace(/\.[^/.]+$/, "");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${baseName}_${suffix}.${format}`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function getFileExtension(filename: string): string {
  return filename.split(".").pop() || "";
}
