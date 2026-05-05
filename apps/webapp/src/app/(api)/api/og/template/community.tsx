import type { CommunityItem } from "../types";
import { getAvatarFallback, getProfileImageData } from "../utils";

import { GenuinLogo, OwnerPill } from "./components";

interface CommunityProps {
  communityData: CommunityItem;
}

export function community({ communityData }: CommunityProps) {
  return (
    <div
      style={{
        display: "flex",
        width: 1084,
        height: 546,
        backgroundColor: "white",
        color: "black",
        position: "relative",
        fontFamily: "InterRegular, sans-serif",
        boxSizing: "border-box",
      }}>
      {/* Details Section */}
      <div
        style={{
          width: "57%",
          height: "100%",
          padding: "48px",
          gap: "10px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}>
        {/* User Section */}
        <OwnerPill
          name={communityData?.leader?.name}
          username={communityData?.leader?.nickname}
          profileImage={getProfileImageData(communityData?.leader)}
          colors={{
            primary: communityData?.colors?.primary_200 || "#E9CAF4",
            secondary: communityData?.colors?.primary_300 || "#ADD8FB",
          }}
        />

        {/* Community Name & Description */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "10px",
            width: "100%",
          }}>
          <p
            style={{
              color: "#111",
              fontFamily: "InterExtraBold",
              fontSize: "68px",
              lineHeight: "85px",
              letterSpacing: "-2.52px",
              maxWidth: 550,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              wordBreak: "break-word",
              whiteSpace: "normal",
              textOverflow: "ellipsis",
              margin: 0,
            }}>
            {communityData?.name}
          </p>

          {communityData?.description && (
            <p
              style={{
                color: "#111",
                fontFamily: "InterRegular",
                fontSize: "24px",
                lineHeight: "27.5px",
                marginTop: 10,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                margin: 0,
                wordBreak: "break-word",
                whiteSpace: "normal",
                maxHeight: "82.5px",
              }}>
              {communityData?.description}
            </p>
          )}
        </div>

        {/* Join Button */}
        <div
          style={{
            display: "flex",
            padding: "12px 30px",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "14px",
            background: communityData?.colors?.primary || "#0645FF",
            color: "#FFF",
            fontFamily: "InterExtraBold",
            fontSize: "21.68px",
            lineHeight: "29.61px",
            alignSelf: "flex-start",
          }}>
          Join Community
        </div>
      </div>

      {/* Image Section */}
      <div
        style={{
          width: "43%",
          display: "flex",
          justifyContent: "flex-end",
        }}>
        <div
          style={{
            width: "55%",
            display: "flex",
            position: "relative",
            background: `radial-gradient(163.62% 227.84% at -27.21% -8.42%, ${
              communityData?.colors?.primary_200 || "#DFBCE7"
            } 0%, ${communityData?.colors?.primary_300 || "#ADD8FB"} 100%)`,
          }}>
          {communityData?.dp ? (
            <img
              src={communityData?.dp}
              alt="Community DP"
              width={422}
              height={422}
              style={{
                border: `12px solid ${communityData?.colors?.primary_400 || "yellow"}`,
                borderRadius: "50%",
                position: "absolute",
                top: "50%",
                right: 48,
                transform: "translateY(-50%)",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                border: `12px solid ${communityData?.colors?.primary_400 || "yellow"}`,
                borderRadius: "50%",
                position: "absolute",
                top: "50%",
                right: 48,
                transform: "translateY(-50%)",
                height: 400,
                width: 400,
                backgroundColor: "#A576A6",
                fontFamily: "InterExtraBold",
                fontSize: "148px",
                lineHeight: "normal",
                color: "#571059",
              }}>
              <span>{getAvatarFallback(communityData?.name)}</span>
            </div>
          )}
        </div>
      </div>

      {!communityData?.colors && <GenuinLogo />}
    </div>
  );
}
