import { BACKEND_ASSESTS_URL } from "./utils";

// Default image options for OG image generation
export const imageOptions = {
  width: 1084,
  height: 546,
};

// Function to load fonts for OG image generation
export async function loadFonts() {
  const [interRegular, interMedium, interSemiBold, interBold, interExtraBold] = await Promise.all([
    fetch(`${BACKEND_ASSESTS_URL}/fonts/inter_regular.ttf`).then((res) => res.arrayBuffer()),
    fetch(`${BACKEND_ASSESTS_URL}/fonts/inter_medium.ttf`).then((res) => res.arrayBuffer()),
    fetch(`${BACKEND_ASSESTS_URL}/fonts/inter_semibold.ttf`).then((res) => res.arrayBuffer()),
    fetch(`${BACKEND_ASSESTS_URL}/fonts/inter_bold.ttf`).then((res) => res.arrayBuffer()),
    fetch(`${BACKEND_ASSESTS_URL}/fonts/inter_extrabold.ttf`).then((res) => res.arrayBuffer()),
  ]);

  return [
    {
      name: "InterRegular",
      data: interRegular,
      style: "normal",
      weight: 400,
    },
    {
      name: "InterMedium",
      data: interMedium,
      style: "normal",
      weight: 500,
    },
    {
      name: "InterSemiBold",
      data: interSemiBold,
      style: "normal",
      weight: 600,
    },
    {
      name: "InterBold",
      data: interBold,
      style: "normal",
      weight: 700,
    },
    {
      name: "InterExtraBold",
      data: interExtraBold,
      style: "normal",
      weight: 800,
    },
  ];
}
