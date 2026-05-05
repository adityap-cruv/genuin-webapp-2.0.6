import type { VideoItem } from "../types";
import { getProfileImageData } from "../utils";

import { GenuinLogo, OwnerPill, PlayIcon } from "./components";

interface VideoProps {
  videoData: VideoItem;
}

const WatchIcon = ({ buttonColor }: { buttonColor: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill={buttonColor} />
      <path
        d="M26.9464 17.6646L18.7274 11.7786C18.2655 11.4439 17.7195 11.2467 17.1517 11.2096C16.5839 11.1724 16.0171 11.2967 15.5161 11.5684C15.014 11.8434 14.5954 12.2505 14.305 12.7463C14.0146 13.2421 13.8633 13.808 13.8673 14.3836V26.1556C13.8631 26.7312 14.0143 27.2972 14.3047 27.793C14.5952 28.2888 15.0138 28.6959 15.5161 28.9708C16.017 29.2425 16.5837 29.367 17.1514 29.3301C17.7192 29.2933 18.2653 29.0965 18.7274 28.7623L26.9464 22.8763C27.3554 22.578 27.6883 22.1863 27.9179 21.7333C28.1475 21.2803 28.2672 20.779 28.2672 20.2705C28.2672 19.7619 28.1475 19.2606 27.9179 18.8076C27.6883 18.3547 27.3554 17.963 26.9464 17.6646Z"
        fill="#F8F8F8"
      />
    </svg>
  );
};

export function video({ videoData }: VideoProps) {
  return (
    <div
      style={{
        display: "flex",
        width: 1084,
        height: 546,
        color: "black",
        position: "relative",
        overflow: "hidden",
        background: videoData?.colors
          ? "#F8F8F8"
          : "radial-gradient(123.19% 48.8% at 76.02% 69.05%, #e9caf4 0%, #add8fb 100%)",
        fontFamily: "InterRegular, sans-serif",
      }}>
      {/* Container Left */}
      <div
        style={{
          width: "60%",
          display: "flex",
          flexDirection: "column", // Owner details pill size issue occure due to this css
          justifyContent: "space-between",
          padding: "48px",
          height: "100%",
        }}>
        {/* Owner Details */}
        <OwnerPill
          name={videoData?.owner?.name}
          username={videoData?.owner?.nickname}
          profileImage={getProfileImageData(videoData?.owner)}
          colors={{
            primary: videoData?.colors?.primary_200 || "",
            secondary: videoData?.colors?.primary_300 || "",
            default: "rgba(248, 248, 248, 0.50)",
          }}
        />

        {/* Group Name & Title */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
          <p
            style={{
              color: "#16171A",
              fontFamily: "InterRegular",
              fontSize: "32px",
              fontStyle: "normal",
              lineHeight: "110%",
              margin: 0,
            }}>
            Posted in
          </p>
          <h1
            style={{
              color: "#16171a",
              fontFamily: "InterExtraBold",
              fontSize: "72px",
              fontStyle: "normal",
              lineHeight: "84px",
              letterSpacing: "-2.16px",
              flexShrink: 0,
              overflow: "hidden",
              wordBreak: "break-word",
              display: "-webkit-box",
              textOverflow: "ellipsis",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              margin: 0,
            }}>
            {videoData?.group_name}
          </h1>
        </div>

        {/* Watch Now */}
        <div
          style={{
            display: "flex",
            padding: "12px",
            paddingRight: "24px",
            gap: "8px",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "60px",
            backgroundColor: "rgba(22, 23, 26, 1)",
            color: "#FFF",
            fontFamily: "InterBold",
            fontSize: "32px",
            lineHeight: "110%",
            alignSelf: "flex-start",
          }}>
          <WatchIcon buttonColor={videoData?.colors ? videoData?.colors?.primary : "#0645FF"} />
          Watch now
        </div>
      </div>

      {/* Container Right */}
      <div style={{ display: "flex", width: "40%" }}>
        {/* Video Thumbnail */}
        <div style={{ display: "flex", position: "relative" }}>
          <img
            width={300}
            height={546}
            style={{
              marginTop: "48px",
              width: "300px",
              height: "546px",
              objectFit: "cover",
            }}
            src={videoData?.video_thumbnail}
          />
          <div
            style={{
              position: "absolute",
              bottom: "184px",
              left: "85px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              borderRadius: "50%",
              width: "128px",
              height: "128px",
            }}>
            <PlayIcon width={80} height={80} />
          </div>
        </div>
      </div>

      {/* Genuin Logo */}
      {!videoData?.colors && <GenuinLogo />}
    </div>
  );
}
