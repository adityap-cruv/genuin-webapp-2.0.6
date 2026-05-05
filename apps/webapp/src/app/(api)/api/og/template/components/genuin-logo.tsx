import { BACKEND_ASSESTS_URL } from "../../utils";

export const GenuinLogo = () => {
  return (
    <img
      src={`${BACKEND_ASSESTS_URL}/priview_images_assets/genuin_black_logo.png`}
      style={{
        width: "56px",
        height: "56px",
        flexShrink: 0,
        position: "absolute",
        top: "20px",
        right: "20px",
      }}
    />
  );
};
