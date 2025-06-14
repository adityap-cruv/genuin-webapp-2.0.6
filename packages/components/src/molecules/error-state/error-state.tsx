import { Button } from "@genuin/ui/components/button";
import type { ComponentProps } from "react";
import { Link } from "@genuin/components/molecules/link";
import BG_404 from "../../../public/images/404.webp";
import BG_OPPS from "../../../public/images/opps.webp";

const STATES_MESSAGES = {
  ERROR: {
    img: BG_OPPS,
    title: "Something went wrong.",
    message:
      "We’re unable to load posts.Try refreshing or \nreload page to explore more content.",
    showButton: true,
    button: {
      text: "Reload",
      url: "/",
    },
  },
  PAGE_NOT_FOUND: {
    img: BG_404,
    title: "Page not found",
    message:
      "The link you’re looking for doesn’t exist or may have been moved. \nTry checking the URL or head to the home page to explore more content",
    showButton: true,
    button: {
      text: "Go to Home",
      url: "/",
    },
  },
  NO_CONTENT: {
    img: BG_OPPS,
    title: "No content available",
    message:
      "We're unable to load posts, try refreshing or\n reload page to explore more content.",
    showButton: false,
    button: {
      text: "",
      url: "/",
    },
  },
  NO_BRAND_USER: {
    img: BG_OPPS,
    title: "No content available",
    message:
      "We're unable to load posts, try refreshing or \nreload page to explore more content.",
    showButton: false,
    button: {
      text: "Create Community",
      url: "/",
    },
  },
  NO_COMMUNITY: {
    img: BG_OPPS,
    title: "Community not found",
    message:
      "We're sorry, but the community you are looking for no longer exists.",
    showButton: false,
    button: {
      text: "Go to Home",
      url: "/",
    },
  },
  NO_GROUP: {
    img: BG_OPPS,
    title: "Group not found",
    message: "We're sorry, but the group you are looking for no longer exists.",
    showButton: true,
    button: {
      text: "Go to Home",
      url: "/",
    },
  },
  NO_USER: {
    img: BG_OPPS,
    title: "User not found",
    message: "We're sorry, but the user you are looking for no longer exists.",
    showButton: true,
    button: {
      text: "Go to Home",
      url: "/",
    },
  },
  NO_VIDEO: {
    img: BG_OPPS,
    title: "Video not found",
    message: "We're sorry, but the video you are looking for no longer exists.",
    showButton: true,
    button: {
      text: "Go to Home",
      url: "/",
    },
  },
  NO_PRIVATE_VIDEO: {
    img: BG_OPPS,
    title: "Video not available",
    message:
      "The video you are trying to access is private. Please verify your access \npermissions or request access to view it.",
    showButton: true,
    button: {
      text: "Go to Home",
      url: "/",
    },
  },
};

type ErrorStateProps = ComponentProps<"div"> & {
  type: keyof typeof STATES_MESSAGES;
};

export function ErrorState({ className, type = "ERROR" }: ErrorStateProps) {
  const state = STATES_MESSAGES[type];

  return (
    <div className="gencl:flex gencl:flex-col gencl:h-full gencl:items-center gencl:w-full gencl:justify-center">
      <div
        className="gencl:flex gencl:flex-col gencl:h-100 gencl:items-center gencl:justify-center gencl:w-full gencl:max-h-[300px]"
        style={{
          background: `url('${state?.img}') center  no-repeat`,
        }}
      >
        <p className="gencl:text-headline-1-semi-bold mb-4 gencl:text-center gencl:mb-2">
          {state?.title}
        </p>
        <p className="gencl:text-secondary-600 text-body-1-semi-bold gencl:text-center gencl:mb-4">
          {state.message.split("\n").map((line) => (
            <>
              {line}
              <br />
            </>
          ))}
        </p>
        {state?.showButton && (
          <Link href={state?.button?.url}>
            <Button size="md" theme={type === "ERROR" ? "outline" : "primary"}>
              {state?.button?.text}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
