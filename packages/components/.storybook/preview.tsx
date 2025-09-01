import type { Preview } from "@storybook/react-vite";

import "../src/globals.css";
import { AuthProvider } from "../src/context/auth";
import { BaseContextProvider } from "../src/context/base";
import { parseBrandColors } from "../src/lib/utils/brand-color-parser";
import { ReactQueryClientProvider } from "../src/react-query/react-query-provider";
import { Toaster } from "@genuin/ui/toaster";
import { AnalyticsProvider } from "../src/context/analytics/provider";
import { LinkProvider } from "../src/context/link";
import { EmbedProvider } from "../src/context/embed";
import { testBrandDetails, testEmbedData } from "./test-data";

const testEmbedDataCarousel = {
  ...testEmbedData,
  style: "carousel",
  customization: {
    ...testEmbedData.customization,
    carousel_style: "default",
    autoplay: true,
    dimensions: {
      width: 800,
      height: 500,
    },
  },
};

const testEmbedDataFeed = {
  ...testEmbedData,
  style: "feed",
  customization: {
    ...testEmbedData.customization,
    feed_display_pref: "default",
    autoplay: false,
    dimensions: {
      width: 300,
      height: 600,
    },
  },
};

const testEmbedDataGrid = {
  ...testEmbedData,
  style: "grid",
  customization: {
    ...testEmbedData.customization,
    dimensions: {
      width: 300,
      height: 600,
    },
  },
};

const preview: Preview = {
  decorators: [
    (Story, context) => {
      let embedData;

      if (context.name === "Embed Carousel") {
        embedData = { ...testEmbedDataCarousel, ...context.args };
      } else if (context.name === "Embed Feed") {
        embedData = { ...testEmbedDataFeed, ...context.args };
      } else if (context.name === "Embed Grid") {
        embedData = { ...testEmbedDataGrid, ...context.args };
      } else {
        embedData = { ...testEmbedData, ...context.args };
      }

      if (
        context.kind.toLowerCase().includes("web-sdk") ||
        context.title.toLowerCase().includes("web-sdk")
      ) {
        const parsedColor = parseBrandColors(testBrandDetails.brand_colors);

        return (
          <div
            id="gen-sdk"
            className="gen-sdk-class"
            style={{ ...parsedColor }}
          >
            <ReactQueryClientProvider>
              <BaseContextProvider brandDetails={testBrandDetails} isEmbed>
                <EmbedProvider
                  container={document.getElementById("gen-sdk") as HTMLElement}
                  embedData={embedData}
                >
                  <AuthProvider
                    onSignIn={() => {}}
                    onSignOut={() => {}}
                    onUpdateUser={() => {}}
                    user={null}
                  >
                    <LinkProvider>
                      <AnalyticsProvider isWebSDK>
                        <Story />
                        <Toaster />
                      </AnalyticsProvider>
                    </LinkProvider>
                  </AuthProvider>
                </EmbedProvider>
              </BaseContextProvider>
            </ReactQueryClientProvider>
          </div>
        );
      }

      const parsedColor = parseBrandColors(testBrandDetails.brand_colors);
      return (
        <ReactQueryClientProvider>
          <LinkProvider>
            <BaseContextProvider
              isEmbed={false}
              brandDetails={testBrandDetails}
            >
              <AuthProvider
                onSignIn={() => {}}
                onSignOut={() => {}}
                onUpdateUser={() => {}}
                user={{
                  isAvatar: false,
                  id: "b6aebf66-db37-48bf-8fac-bda06eb81914",
                  phoneNumber: "916354665097",
                  nickname: "ycombinator",
                  image:
                    "https://media.qa.begenuin.com/uploads/profile_images/1741280553604_croppedImage_1741280519374.png",
                  email: "himanshu@begenuin.com",
                  name: "ycombinator",
                  accessToken:
                    "eyJraWQiOiJkLTE3NDk4MDgyMzY3ODMiLCJ0eXAiOiJKV1QiLCJ2ZXJzaW9uIjoiNSIsImFsZyI6IlJTMjU2In0.eyJpYXQiOjE3NDk4MjQ0MjksImV4cCI6MTc1MTAzNDAyOCwic3ViIjoiYjJmOTcxNTItOGQxYi00ZmM5LTkwNzItMzdiMjI5YWFmYWYxIiwidElkIjoicHVibGljIiwicnN1YiI6ImIyZjk3MTUyLThkMWItNGZjOS05MDcyLTM3YjIyOWFhZmFmMSIsInNlc3Npb25IYW5kbGUiOiJiZmQwZDFjYy03ZmUxLTQzNmUtODI1My01NGQxZDQzMGUzNWMiLCJyZWZyZXNoVG9rZW5IYXNoMSI6IjQwZGI1ZTU2ZjYxMjIxMGVkM2E1NzA3YjlkM2RiYjdkNGM0MDBhMzFjOTU4N2RlMWMwODVkZDc2YWRmNjM3NDgiLCJwYXJlbnRSZWZyZXNoVG9rZW5IYXNoMSI6bnVsbCwiYW50aUNzcmZUb2tlbiI6bnVsbCwiaXNzIjoiaHR0cHM6Ly9ub2RlanMucWEuYmVnZW51aW4uY29tL2FwaS92NC9hdXRoIiwic3Qtcm9sZSI6eyJ2IjpbXSwidCI6MTc0OTgyNDQyODY5NX0sInN0LXBlcm0iOnsidiI6W10sInQiOjE3NDk4MjQ0Mjg2OTZ9LCJnZW51aW4iOnsidXNlcl9pZCI6ImI2YWViZjY2LWRiMzctNDhiZi04ZmFjLWJkYTA2ZWI4MTkxNCIsImxvZ2luX3NvdXJjZSI6MywiZGV2aWNlX3R5cGUiOiJ3ZWIiLCJicmFuZF9pZCI6MjI2MH19.Ae-HpYiG2SK40AfoAQfePmglrxxLA--XYl_anVTVQhnV1nW2WBuz4bD51pJPr2JABds4J4Qna2T3V296gy8PBt8Ose88bzFoccRBRU1S77LKe4_Ojqqbe4cRLc_M5t0UkpCFAnvQKd9egre9XIduT2x3GyCC7Lb8_5gqSLfVNkrpp0wz3eB31QRkvKMKKBE8f5SPBlyUwHwnOFFBFfEMdeRD8T9VRUlEZaWdYUtPiV4vwnGM4kV3lfu56_mP0Qg7b52MZZUVoZdqPyMXNcqzudTHBnkG0cQSe_tcXQ5zUUEfxZZ9h_-VZljX0RYiBTD6aUzpQwenPmiewjF8atSuRg",
                  ksCbRequestStatus: "Accepted",
                  isBrandSystemUser: true,
                  brandId: 2260,
                  brandSlug: "ycombinator",
                  hasTopics: true,
                  refreshToken:
                    "d/4WndBLTrRcowEqOKGsU7NQwDTIcGjNOHuX6g2rt1AdhMdMDNF6uChX4kI/bZPAyC+7IY7NzSJNNCL92Drk7o1rLhTJtR4INhwKUiwQsXIstlXV9CqtWEQsa7/gQCLHUS0oAo93jVdA9dIbRm6vb25UAZzyKOF6Y5nIOpTykMEgQZUgvCZgRoH0VVbOwBd9vP0EIKfCCJni9vr+Aw8g+Ckz5yLqQBpDmKlFeRxOHMlhBSLuLMlWogf8HaD0F4RcGFWCu1B9eWRAMrGls7/V.7913f90c5bc557d41f084b6733356e6a25ab3bcae9cb56674c58d716dac9ef25.V2",
                  usernameSet: true,
                }}
              >
                <AnalyticsProvider>
                  <main style={{ ...parsedColor }}>
                    <Story />
                    <Toaster />
                  </main>
                </AnalyticsProvider>
              </AuthProvider>
            </BaseContextProvider>
          </LinkProvider>
        </ReactQueryClientProvider>
      );
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
