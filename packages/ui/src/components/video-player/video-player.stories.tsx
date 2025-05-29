import type { Meta, StoryObj } from "@storybook/react-vite";
import { useCallback, useState } from "react";

import { type PlayerProps, VideoPlayer } from "./video-player";

const meta: Meta<typeof VideoPlayer> = {
  title: "UI/VideoPlayer",
  component: VideoPlayer,
  tags: ["autodocs"],
  argTypes: {
    src: {
      control: "text",
      description: "The URL of the video source.",
    },
    poster: {
      control: "text",
      description: "The URL of the poster image for the video.",
    },
    autoPlay: {
      control: "boolean",
      description: "Whether the video should start playing automatically.",
    },
    muted: {
      control: "boolean",
      description: "Whether the video should be muted by default.",
    },
    loop: {
      control: "boolean",
      description: "Whether the video should loop.",
    },
    controls: {
      control: "boolean",
      description:
        "Whether to display controls (derived from OpenPlayerJS config). Default: true (visible)",
    },
    width: {
      control: "text",
      description: 'Width of the player (e.g., "100%", "640px").',
    },
    height: {
      control: "text",
      description: 'Height of the player (e.g., "100%", "360px").',
    },
    volume: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Initial volume of the video (0-100).",
    },
    playbackSpeed: {
      control: { type: "number", min: 0.25, max: 4, step: 0.25 },
      description: "Initial playback speed.",
    },
    // Renamed onReady to onOpenPlayerReady to match component prop for clarity in argTypes
    onOpenPlayerReady: {
      action: "onOpenPlayerReady",
      description:
        "Callback when player is ready (OpenPlayerJS specific, maps to onOpenPlayerReady).",
    },
    onPlay: {
      action: "onPlay",
      description: "Callback when video starts playing.",
    },
    onPause: {
      action: "onPause",
      description: "Callback when video is paused.",
    },
    onEnded: { action: "onEnded", description: "Callback when video ends." },
    onError: { action: "onError", description: "Callback on player error." },
    onTimeUpdate: {
      action: "onTimeUpdate",
      description: "Callback on time update.",
    },
    onVolumeChange: {
      action: "onVolumeChange",
      description: "Callback on volume change.",
    },
    onPlayerLoad: {
      action: "onPlayerLoad",
      description: "Callback when the player instance has loaded.",
    },
    play: {
      control: "boolean",
      description: "Programmatically play or pause the video.",
    },
  },
  args: {
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    poster:
      "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217",
    autoPlay: false,
    muted: false,
    loop: false,
    controls: true, // Default to true (visible controls)
    width: "640px",
    height: "360px",
    volume: 80, // Adjusted to 0-100 scale
    playbackSpeed: 1.0, // Changed from playbackRate
    play: true,
    // Add onOpenPlayerReady to default args if needed, though actions don't usually need default values
  },
};

export default meta;

type Story = StoryObj<typeof VideoPlayer>;

export const Default: Story = {
  args: {},
};

export const AutoplayMuted: Story = {
  args: {
    autoPlay: true,
    muted: true,
    play: true, // ensure play is true for autoplay to work if component relies on it
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    poster:
      "https://orange.blender.org/wp-content/themes/orange/images/common/organisation_header.jpg",
  },
};

export const NoControlsStory: Story = {
  name: "No Controls",
  args: {
    controls: false,
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    poster: "",
  },
};

export const DifferentSource: Story = {
  args: {
    src: "https://test-videos.co.uk/vids/Sintel/mp4/Sintel_1080x460_500k.mp4",
    poster: "https://sintel.org/wp-content/uploads/2010/05/title_1_2K_web.jpg",
    width: "100%",
    height: "auto",
  },
};

export const WithPoster: Story = {
  args: {
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    poster: "https://mango.blender.org/wp-content/uploads/2012/05/title_02.jpg",
  },
};

export const LoopVideo: Story = {
  args: {
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    loop: true,
    autoPlay: true,
    play: true, // ensure play is true for autoplay to work
    muted: true,
  },
};

const EventHandlingPlayer = (props: PlayerProps) => {
  const [lastEvent, setLastEvent] = useState<string>("No events yet");

  const handleEvent = useCallback(
    (eventName: string, callback?: (...args: unknown[]) => void) => {
      return (...args: unknown[]) => {
        setLastEvent(
          `${eventName} fired at ${new Date().toLocaleTimeString()}`
        );
        if (callback) {
          callback(...args); // Call the original storybook action or mapped component prop
        }
        console.log(`${eventName} event: `, ...args);
      };
    },
    [] // Removed props from dependency array as it's not directly used for setLastEvent or console.log
  );

  return (
    <div>
      <VideoPlayer
        {...props}
        // Map story actions to component event handlers
        onOpenPlayerReady={handleEvent(
          "onOpenPlayerReady",
          props.onOpenPlayerReady as (...args: unknown[]) => void
        )}
        onPlay={handleEvent(
          "onPlay",
          props.onPlay as (...args: unknown[]) => void
        )}
        onPause={handleEvent(
          "onPause",
          props.onPause as (...args: unknown[]) => void
        )}
        onEnded={handleEvent(
          "onEnded",
          props.onEnded as (...args: unknown[]) => void
        )}
        onError={handleEvent(
          "onError",
          props.onError as (...args: unknown[]) => void
        )}
        onTimeUpdate={handleEvent(
          "onTimeUpdate",
          props.onTimeUpdate as (...args: unknown[]) => void
        )}
        onVolumeChange={handleEvent(
          "onVolumeChange",
          props.onVolumeChange as (...args: unknown[]) => void
        )}
        onPlayerLoad={handleEvent(
          "onPlayerLoad",
          props.onPlayerLoad as (...args: unknown[]) => void
        )}
      />
      <p style={{ marginTop: "10px", fontFamily: "monospace" }}>
        Last Event: {lastEvent}
      </p>
    </div>
  );
};

export const EventHandling: Story = {
  render: (args) => <EventHandlingPlayer {...args} />,
  args: {
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    controls: true,
  },
};

export const CustomDimensions: Story = {
  args: {
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    width: "800px",
    height: "450px",
  },
};

export const ResponsivePlayer: Story = {
  args: {
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    width: "100%",
    height: "auto",
  },
};

// Example of a story that might require specific setup if the component supports it,
// e.g., playing a HLS/DASH stream if OpenPlayerJS is configured for it.
// export const HLSSource: Story = {
//   args: {
//     src: 'YOUR_HLS_STREAM_URL.m3u8',
//     // Potentially other props needed for HLS playback
//   },
// };
