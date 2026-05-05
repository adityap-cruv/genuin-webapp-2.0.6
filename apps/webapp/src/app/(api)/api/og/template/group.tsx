import type { GroupItem } from "../types";
import { BACKEND_ASSESTS_URL, getProfileImageData } from "../utils";

import { GenuinLogo, PlayIcon } from "./components";

interface GroupProps {
  groupData: GroupItem;
}

export function group({ groupData }: GroupProps) {
  const buttonIconSvg = `${BACKEND_ASSESTS_URL}/priview_images_assets/black_camara_logo.svg`;

  const curveBackgroundColor = groupData?.colors ? groupData?.colors?.primary_400 : "#ADDAFF";
  const otherMembers = groupData?.member_images?.map((item: any) => getProfileImageData(item)) || [];
  const prepareMembers = [
    ...(groupData?.leader_image ? [getProfileImageData(groupData?.leader_image)] : []),
    ...otherMembers,
  ];

  return (
    <div
      style={{
        display: "flex",
        width: 1084,
        height: 546,
        color: "black",
        position: "relative",
        overflow: "hidden",
        fontFamily: "InterRegular, sans-serif",
      }}>
      {/* Right side patterned background image */}
      <div
        style={{
          position: "absolute",
          top: "0px",
          left: "0px",
          width: "100%",
          height: "100%",
          backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='402' height='546' viewBox='0 0 402 546' fill='${curveBackgroundColor}'><path fill-rule='evenodd' clip-rule='evenodd' d='M437.733 -510.976C493.133 -520.309 549.067 -526 608.001 -526C685.321 -526 748.001 -463.32 748.001 -386C748.001 -308.68 685.321 -246 608.001 -246C567.465 -246 527.325 -242.124 484.248 -234.866C387.965 -218.646 304.467 -149.736 283.141 -75.5637C280.054 -64.8245 279.885 -58.5137 280.04 -55.6021C280.181 -52.9584 280.668 -51.2045 281.545 -49.2805C283.673 -44.6103 317.322 -99.0476 343.611 -80.4885C411.265 -32.7278 481.33 9.77655 549.165 37.5C553.367 39.217 531.674 107.938 535.973 109.805C539.733 111.438 543.654 113.142 547.951 114.936C548.355 114.925 548.76 114.915 549.165 114.906C557.622 114.711 574.751 115.338 592.917 119.376C598.5 120.617 607.289 122.85 617.398 126.859C626.025 130.28 644.774 138.494 663.339 155.708C684.025 174.889 710.109 211.449 709.004 263.204C708.002 310.16 684.864 341.697 672.578 355.542C630.319 403.165 575.241 404.439 564.558 404.686L564.478 404.687C557.387 404.852 550.693 404.536 544.634 403.981C542.831 405.325 540.858 406.828 538.686 408.517C500.114 438.498 480.44 461.583 474.116 475.097C474.203 476.698 474.571 479.813 475.962 484.653C479.355 496.462 486.264 508.708 493.165 516.735C543.569 575.368 536.898 663.76 478.266 714.164C419.633 764.568 331.241 757.897 280.837 699.265C248.494 661.641 221.727 613.752 206.851 561.979C192.096 510.627 186.216 444.814 211.002 378.966C224.15 344.038 243.363 313.008 264.595 286.045C226.318 263.121 190.016 238.967 156.348 215.199C106.743 180.181 56.7222 132.588 26.7562 66.8343C-4.77927 -2.36346 -7.65412 -77.469 14.0429 -152.933C71.7889 -353.779 261.171 -481.231 437.733 -510.976Z'/></svg>")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "65% 0",
          zIndex: "1",
          backgroundColor: "white",
        }}
      />

      {/* Element to hide repeated background image */}
      <div
        style={{
          width: "65%",
          height: "100%",
          position: "absolute",
          left: 0,
          background: "white",
        }}
      />

      <div
        className="text_mata_data"
        style={{
          width: "64%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
        }}>
        <div
          className="text_data"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "16px",
          }}>
          <p
            className="title"
            style={{
              color: "var(--Off-black, #16171A)",
              fontFamily: "InterExtraBold",
              fontSize: "72px",
              wordBreak: "break-word",
              lineHeight: "84px",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              textOverflow: "ellipsis",
              margin: 0,
            }}>
            {groupData?.name}
          </p>
          {groupData?.description && (
            <p
              aria-label="description"
              style={{
                color: "#16171A",
                fontFamily: "InterMedium",
                fontSize: "24px",
                lineHeight: "32px",
                whiteSpace: "normal",
                wordBreak: "break-word",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 4,
                margin: 0,
              }}>
              {groupData?.description}
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          {/* Join Now Button */}
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              padding: "0px 24px",
              gap: "8px",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "60px",
              backgroundColor: "#16171A",
              color: "#FFF",
              fontFamily: "InterExtraBold",
              fontSize: "20px",
              lineHeight: "29.61px",
            }}>
            <img src={buttonIconSvg} width={36} height={36} style={{ width: "36px", height: "36px" }} />
            Join now
          </div>

          {prepareMembers.map((member, index) => {
            const isOwner = index === 0;
            return (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  overflow: "hidden",
                }}
                key={index}>
                <img
                  src={member.url}
                  width={64}
                  height={64}
                  style={{
                    backgroundColor: member.bgColour,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: isOwner ? "3px solid #DFBCE7" : "none",
                  }}
                />
              </div>
            );
          })}

          {groupData?.additional_members && (
            <div
              style={{
                backgroundColor: "#ECEAF2",
                color: "black",
                fontSize: "20px",
                fontFamily: "InterExtraBold",
                lineHeight: "24px",
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <span style={{ marginTop: "2px" }}>+{groupData?.additional_members}</span>
            </div>
          )}
        </div>
      </div>

      {groupData?.video_thumbnails.map((thumbnail: string, idx: number) => {
        const lastThumbnail = idx === groupData?.video_thumbnails?.length - 1;

        // Base position for the first post
        let positionTop = 64;
        let positionRight = 80;

        // For the second post and beyond, increase by 16
        if (idx > 0) {
          positionTop += idx * 16; // Increment positionTop by 16 for each post after the first
          positionRight += idx * 16; // Increment positionRight by 16 for each post after the first
        }
        return (
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: `${positionTop}px`,
              right: `${positionRight}px`,
            }}
            key={idx}>
            <div
              style={{
                display: "flex",
                position: "relative",
                width: "224px",
                height: "400px",
                borderRadius: "10px",
                overflow: "hidden",
              }}>
              <img src={thumbnail} width={224} height={400} />
              {lastThumbnail && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    borderRadius: "50%",
                    width: "120px",
                    height: "120px",
                  }}>
                  <PlayIcon width={72} height={72} />
                </div>
              )}
            </div>
          </div>
        );
      })}

      {!groupData?.colors && <GenuinLogo />}
    </div>
  );
}
