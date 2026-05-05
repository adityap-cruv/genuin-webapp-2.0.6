import { cva } from "class-variance-authority";
import cn from "classnames";
import { type ComponentProps } from "react";

// Define the properties for the UploadIcon component
type Props = ComponentProps<"svg"> & {
  variant?: "light" | "primary" | "dark" | "black"; // Optional variant prop to determine the color scheme
};

// Define the class variance authority (cva) for the UploadIcon component
const UploadIconClasses = cva("", {
  variants: {
    variant: {
      light: "fill-monochrome-white", // Light variant class
      primary: "fill-primary", // Primary variant class
      dark: "fill-primary", // Map 'dark' to 'primary' variant class
      black: "gencl:stroke-black",
    },
  },
  defaultVariants: {
    variant: "primary", // Default variant is 'primary'
  },
});

export function UploadIcon({ variant = "primary", className, ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      {...props}
      className={cn(UploadIconClasses({ variant }), className)}>
      <g clipPath="url(#clip0_7523_186340)">
        <path d="M25.8 13.3873C24.8933 8.78732 20.8533 5.33398 16 5.33398C12.1467 5.33398 8.8 7.52065 7.13333 10.7207C3.12 11.1473 0 14.5473 0 18.6673C0 23.0807 3.58667 26.6673 8 26.6673H25.3333C29.0133 26.6673 32 23.6807 32 20.0007C32 16.4806 29.2667 13.6273 25.8 13.3873ZM25.3333 24.0007H8C5.05333 24.0007 2.66667 21.614 2.66667 18.6673C2.66667 15.934 4.70667 13.654 7.41333 13.374L8.84 13.2273L9.50667 11.9607C10.7733 9.52065 13.2533 8.00065 16 8.00065C19.4933 8.00065 22.5067 10.4807 23.1867 13.9073L23.5867 15.9073L25.6267 16.054C27.7067 16.1873 29.3333 17.934 29.3333 20.0007C29.3333 22.2006 27.5333 24.0007 25.3333 24.0007ZM10.6667 17.334H14.0667V21.334H17.9333V17.334H21.3333L16 12.0007L10.6667 17.334Z" />
      </g>
      <defs>
        <clipPath id="clip0_7523_186340">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function UploadFileIcon({ variant = "black", className, ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      {...props}
      className={cn(UploadIconClasses({ variant }), className)}>
      <g clipPath="url(#clip0_3136_110858)">
        <path
          d="M12.856 5.78125H14.7846C14.9551 5.78125 15.1186 5.84898 15.2392 5.96954C15.3597 6.09009 15.4275 6.25361 15.4275 6.42411V16.7098C15.4275 16.8803 15.3597 17.0439 15.2392 17.1645C15.1186 17.2849 14.9551 17.3527 14.7846 17.3527H3.21317C3.04267 17.3527 2.87915 17.2849 2.75861 17.1645C2.63804 17.0439 2.57031 16.8803 2.57031 16.7098V6.42411C2.57031 6.25361 2.63804 6.09009 2.75861 5.96954C2.87915 5.84898 3.04267 5.78125 3.21317 5.78125H5.14169"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M9 0.640625V12.2121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M6.42773 3.21205L8.99916 0.640625L11.5706 3.21205"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_3136_110858">
          <rect width="18" height="18" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
