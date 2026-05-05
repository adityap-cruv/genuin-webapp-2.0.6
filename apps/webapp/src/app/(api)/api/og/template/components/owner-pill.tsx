interface OwnerPillProps {
  name: string;
  username: string;
  profileImage: { url: string; bgColour: string };
  colors: {
    primary: string;
    secondary: string;
    default?: string;
  };
}

export const OwnerPill = ({ name = "", username = "", profileImage, colors }: OwnerPillProps) => {
  const fontSizeName = 24;
  const fontSizeUsername = 18;
  const maxTextWidth = 400;
  const imageWidth = 72;
  const padding = 12 * 2;
  const gap = 12;

  const estimateCharWidth = (fontSize: number) => fontSize * 0.6;
  const truncate = (text: string, limit: number) => (text.length > limit ? text.slice(0, limit - 1) + "…" : text);

  // Name width
  const estimateNameCharWidth = estimateCharWidth(fontSizeName);
  const maxNameChars = Math.floor(maxTextWidth / estimateNameCharWidth);
  const truncatedName = truncate(name, maxNameChars);
  const estimatedNameWidth = Math.min(name.length, maxNameChars) * estimateNameCharWidth;

  // Username width
  const estimateUsernameCharWidth = estimateCharWidth(fontSizeUsername);
  const maxUsernameChars = Math.floor(maxTextWidth / estimateUsernameCharWidth);
  const truncatedUsername = truncate(username, maxUsernameChars);
  const estimatedUsernameWidth = Math.min(username.length, maxUsernameChars) * estimateUsernameCharWidth;

  // Pick the larger width
  const textWidth = Math.max(estimatedNameWidth, estimatedUsernameWidth);

  const containerWidth = padding + imageWidth + gap + textWidth + 16; // Extra 16px for paddingRight

  return (
    <div
      style={{
        maxWidth: `${containerWidth}px`,
        display: "flex",
        alignItems: "center",
        gap: `${gap}px`,
        padding: `${padding / 2}px`,
        borderRadius: "100px",
        backgroundColor: "aqua",
        background:
          colors?.primary || colors?.secondary
            ? `radial-gradient(170.72% 103.86% at 80.3% 80.19%, ${colors.primary} 0%, ${colors.secondary} 100%)`
            : colors?.default,
      }}>
      <img
        src={profileImage.url}
        style={{
          width: `${imageWidth}px`,
          height: `${imageWidth}px`,
          borderRadius: "50%",
          backgroundColor: profileImage.bgColour,
          flexShrink: 0,
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <p
          style={{
            fontFamily: "InterExtraBold",
            fontSize: `${fontSizeName}px`,
            lineHeight: "32px",
            color: "#000",
            margin: 0,
          }}>
          {truncatedName}
        </p>
        {username && (
          <p
            style={{
              fontFamily: "InterRegular",
              fontSize: `${fontSizeUsername}px`,
              lineHeight: "28px",
              color: "#000",
              margin: 0,
              textOverflow: "ellipsis",
            }}>
            @{truncatedUsername}
          </p>
        )}
      </div>
    </div>
  );
};
