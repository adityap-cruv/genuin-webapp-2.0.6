import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Form,
  FormLabel,
} from "@genuin/ui/components/form";
import { ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuthContext } from "@genuin/components/context/auth";
import { cn, sanitizeInput } from "@genuin/ui/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  InstagramIcon,
  LinkedInIcon,
  TiktokIcon,
  TwitterIcon,
  YouTubeIcon,
} from "@genuin/ui/icons";
import { useAuthenticationModalContext } from "../../context";
import { Input, Toast } from "@genuin/ui/components";
import { SubmitButton } from "../../submit-button";
import { useUpdateUserMutation } from "@genuin/components/react-query/api/authentication";

const generalUsernamePattern = /^[a-zA-Z0-9._-]+$/;
// const youtubeUrlPattern =
//   /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:user\/|c\/|channel\/|@)[\w\-]+(?:\/|$)/;
const linkedinUrlPattern =
  /^(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(in|company|school)\/[a-zA-Z0-9À-ž-]+\/?(?:\?.*)?$/;
const socialProfilesSchema = z.object({
  instagram: z
    .string()
    .regex(generalUsernamePattern, {
      message: "Only letters, numbers, underscores , and periods are allowed",
    })
    .optional()
    .or(z.literal("")),
  youtube: z
    .string()
    .regex(generalUsernamePattern, {
      message: "Only letters, numbers, underscores , and periods are allowed",
    })
    .optional()
    .or(z.literal("")),
  linkedin: z
    .string()
    .regex(linkedinUrlPattern, {
      message: "Please enter a valid LinkedIn URL.",
    })
    .optional()
    .or(z.literal("")),
  tiktok: z
    .string()
    .regex(generalUsernamePattern, {
      message: "Only letters, numbers, underscores , and periods are allowed",
    })
    .optional()
    .or(z.literal("")),
  x: z
    .string()
    .regex(generalUsernamePattern, {
      message: "Only letters, numbers, underscores , and periods are allowed",
    })
    .optional()
    .or(z.literal("")),
});

export function EditSocialProfiles({
  className,
  ...restProps
}: ComponentProps<"div">) {
  const { user, updateUser } = useAuthContext();
  const { closeModal } = useAuthenticationModalContext();

  const { mutate: updateUserDetails, isPending: isPendingUpdateUser } =
    useUpdateUserMutation({
      onSuccess: ({ status }) => {
        if (status) {
          const { instagram, youtube, linkedin, tiktok, x } = form.getValues();
          updateUser({
            ...user,
            instaId: sanitizeInput(instagram),
            youtubeId: sanitizeInput(youtube),
            linkedinId: sanitizeInput(linkedin?.split("?")[0] || ""),
            tiktokId: sanitizeInput(tiktok),
            xId: sanitizeInput(x),
          });
          Toast.Success({ message: "Your social profiles has been updated" });
        }
        closeModal();
      },
      onError: () => {
        form.setError("root", {
          message:
            "Something went wrong while updating social links. Please try again!",
        });
      },
    });

  const form = useForm({
    resolver: zodResolver(socialProfilesSchema),
    mode: "onChange",
    defaultValues: {
      instagram: user?.instaId ?? "",
      youtube: user?.youtubeId ?? "",
      linkedin: user?.linkedinId ?? "",
      tiktok: user?.tiktokId ?? "",
      x: user?.xId ?? "",
    },
  });

  const onSubmit = () => {
    const { instagram, youtube, linkedin, tiktok, x } = form.getValues();

    const payload: Record<string, string> = {};

    if (instagram) payload.insta_id = sanitizeInput(instagram);
    if (youtube) payload.youtube_id = sanitizeInput(youtube);
    if (linkedin)
      payload.linkedin_id = sanitizeInput(linkedin?.split("?")[0] || "");
    if (tiktok) payload.tiktok_id = sanitizeInput(tiktok);
    if (x) payload.twitter_id = sanitizeInput(x);

    updateUserDetails(payload);
  };

  return (
    <div className={cn("gencl:space-y-6", className)} {...restProps}>
      <div className="gencl:space-y-2">
        <h3 className="gencl:text-center gencl:text-headline-2-semi-bold">
          Edit Social Profiles
        </h3>
        <p className="gencl:text-center gencl:text-body-1-medium gencl:text-secondary-600">
          These links will show on your profile
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="gencl:space-y-6"
        >
          <FormField
            control={form.control}
            name="instagram"
            render={({ field }) => {
              return (
                <FormItem className="gencl:sm:w-full">
                  <FormLabel
                    htmlFor="instagram-profile-input"
                    className="gencl:flex gencl:justify-between"
                  >
                    <span>Instagram profile</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      icon={
                        <InstagramIcon className="gencl:w-5 gencl:h-5 gencl:fill-secondary-900" />
                      }
                      id="instagram-profile-input"
                      type="text"
                      autoComplete="off"
                      placeholder="@username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="youtube"
            render={({ field }) => {
              return (
                <FormItem className="gencl:sm:w-full">
                  <FormLabel
                    htmlFor="youtube-profile-input"
                    className="gencl:flex gencl:justify-between"
                  >
                    <span>Youtube profile</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      icon={
                        <YouTubeIcon className="gencl:w-5 gencl:h-5 gencl:fill-secondary-900" />
                      }
                      id="youtube-profile-input"
                      type="text"
                      autoComplete="off"
                      placeholder="@username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="linkedin"
            render={({ field }) => {
              return (
                <FormItem className="gencl:sm:w-full">
                  <FormLabel
                    htmlFor="linkedin-profile-input"
                    className="gencl:flex gencl:justify-between"
                  >
                    <span>Linkedin profile</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      icon={
                        <LinkedInIcon className="gencl:w-5 gencl:h-5 gencl:fill-secondary-900" />
                      }
                      id="linkedin-profile-input"
                      type="text"
                      autoComplete="off"
                      placeholder="https://www.linkedin.com/profile/username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="tiktok"
            render={({ field }) => {
              return (
                <FormItem className="gencl:sm:w-full">
                  <FormLabel
                    htmlFor="tiktok-profile-input"
                    className="gencl:flex gencl:justify-between"
                  >
                    <span>Tiktok profile</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      icon={
                        <TiktokIcon className="gencl:w-5 gencl:h-5 gencl:fill-secondary-900" />
                      }
                      id="tiktok-profile-input"
                      type="text"
                      autoComplete="off"
                      placeholder="@username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="x"
            render={({ field }) => {
              return (
                <FormItem className="gencl:sm:w-full">
                  <FormLabel
                    htmlFor="x-profile-input"
                    className="gencl:flex gencl:justify-between"
                  >
                    <span>X profile</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      icon={
                        <TwitterIcon className="gencl:w-5 gencl:h-5 gencl:fill-secondary-900" />
                      }
                      id="x-profile-input"
                      type="text"
                      autoComplete="off"
                      placeholder="@username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <SubmitButton
            disabled={!form.formState.isValid || !form.formState.isDirty}
            isLoading={isPendingUpdateUser}
            title="Save"
            error={form.formState.errors.root?.message ?? ""}
          />
        </form>
      </Form>
    </div>
  );
}
