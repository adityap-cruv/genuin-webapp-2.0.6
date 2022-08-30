import React from "react";
import ReactPlayer from "react-player/lazy";
import { useDebounce } from "use-debounce";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";
import { Image, ProgressBar, Badge, Button } from "react-bootstrap";

const icArrowDown = require("../../../images/video-more-options/ic-arrow-down.svg");
const icArrowUp = require("../../../images/video-more-options/ic-arrow-up.svg");

export const ReactPlayerWrapper = ({
  videoUrl,
  isPlaying,
  handleToggleIsPlaying,
  onProgress,
  progress,
  videoThumbnail,
  userName,
  description,
  profilePic,
  children,
  onDuration,
  onEnded,
}) => {
  const [isPlayingDebounced] = useDebounce(isPlaying, 65);
  return (
    <div className="video-container">
      <ReactPlayer
        key={videoUrl}
        url={[videoUrl]}
        playing={isPlaying}
        controls={false}
        playsinline={true}
        // light={videoThumbnail}
        config={{
          file: {
            attributes: { poster: videoThumbnail },
          },
        }}
        onClick={handleToggleIsPlaying}
        className="video-wrapper"
        width="auto"
        height="100%"
        // fluid
        // aspectRatio='9:16'
        onProgress={onProgress}
        onDuration={onDuration}
        onEnded={onEnded}
        progressInterval={500}
      />
      <FontAwesomeIcon
        icon={isPlaying ? faPause : faPlay}
        style={{
          display: isPlayingDebounced ? "none" : "block",
        }}
        className="btn-play"
      />
      <div className="btn-arrow-controler d-none d-md-flex flex-column align-items-center justify-content-center">
        <Button className="btn-arrow">
          <Image
            src={icArrowUp}
            width="24"
            height="24"
            alt="Arrow Up"
            title="Arrow Up"
          />
        </Button>
        <Button className="btn-arrow">
          <Image
            src={icArrowDown}
            width="24"
            height="24"
            alt="Arrow Down"
            title="Arrow Down"
          />
        </Button>
      </div>
      <div className="video-footer bg-gradient-180">
        <div className="d-flex align-items-end justify-content-between">
          <div className="d-flex flex-column">
            <Badge pill bg="dark" className="mb-2 align-self-start">
              @pusateri added
            </Badge>
            <div className="video-auther mb-2">
              <Image
                src={profilePic}
                width="36"
                height="36"
                alt="@pusateri"
                title="@pusateri"
                className="img-auther-pic"
              />
              <h5 className="mb-0">
                {userName}
                <Button variant="outline-light" className="me-3">
                  Watch
                </Button>
              </h5>
            </div>
            <p className="mb-0">{description}</p>
          </div>
          <div className="flex-shrink-0 position-relative video-more-option">
            {children}
          </div>
        </div>
        <ProgressBar now={progress} />
      </div>
    </div>
  );
};
