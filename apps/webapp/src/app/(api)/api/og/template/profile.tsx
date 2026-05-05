import type { ProfileItem } from "../types";
import { getProfileImageData } from "../utils";

import { GenuinLogo } from "./components";

interface ProfileProps {
  profileData: ProfileItem;
}

export function profile({ profileData }: ProfileProps) {
  const profileImage = getProfileImageData(profileData);
  return (
    <div
      style={{
        display: "flex",
        width: "1084px",
        height: "546px",
        background: profileData?.colors
          ? "white"
          : "radial-gradient(198.37% 95.48% at 91.74% 79.03%, #E9CAF4 0%, #ADD8FB 100%)",
        color: "black",
        position: "relative",
        fontFamily: "InterRegular, sans-serif",
      }}>
      {/* Left profile container */}
      <div
        style={{
          width: "275px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          background: profileData?.colors ? profileData?.colors?.primary_300 : "white",
        }}>
        <img
          src={profileImage.url}
          width={340}
          height={340}
          alt="User DP"
          style={{
            border: "12px solid white",
            borderRadius: "50%",
            backgroundColor: profileImage.bgColour,
            objectFit: "cover",
            position: "absolute",
            top: "50%",
            left: "105px", // containerWidth - imageWidth / 2
            transform: "translateY(-50%)",
          }}
        />
      </div>

      {/* Right content */}
      <div
        style={{
          marginLeft: "155px",
          flex: 1,
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}>
        {/* Text section */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            gap: "6px",
          }}>
          <p style={{ fontSize: "48px", lineHeight: "60px", margin: 0, fontFamily: "InterRegular" }}>Hey!</p>
          <p style={{ fontSize: "48px", lineHeight: "60px", margin: 0, fontFamily: "InterRegular" }}>
            Check out my profile
          </p>

          {profileData?.nickname && (
            <p
              style={{
                fontFamily: "InterBold",
                fontSize: "56px",
                lineHeight: "68px",
                letterSpacing: "-1.68px",
                display: "block",
                maxWidth: "100%",
                margin: 0,
                lineClamp: 2,
                wordBreak: "break-all",
                overflow: "hidden",
                WebkitLineClamp: 2,
                textOverflow: "ellipsis",
              }}>
              @{profileData?.nickname}
            </p>
          )}

          <p
            style={{
              fontSize: "48px",
              fontFamily: "InterRegular",
              lineHeight: "69px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
              padding: "4px",
              margin: 0,
            }}>
            on {profileData?.brand_name || "Genuin"}
          </p>
        </div>

        {/* Button */}
        <div
          style={{
            display: "flex",
            padding: "12px 30px",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "14px",
            background: profileData?.colors ? profileData?.colors?.primary : "#0645FF",
            color: "#FFF",
            fontFamily: "InterBold",
            fontSize: "21.68px",
            lineHeight: "29.61px",
            alignSelf: "flex-end",
            marginTop: "auto",
          }}>
          Check It Out
        </div>
      </div>

      {/* Genuin Icon */}
      {!profileData?.colors && <GenuinLogo />}
    </div>
  );
}
